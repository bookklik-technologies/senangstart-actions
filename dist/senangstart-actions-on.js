this.SenangStart = (function (SenangStart, registry_js, reactive_js) {
    'use strict';

    function createMagics(scope, element) {
        const { data, $refs, $store } = scope;
        return {
            $data: data,
            $store,
            $el: element,
            $my: element,
            $refs,
            $dispatch: (name, detail = {}) => element.dispatchEvent(new CustomEvent(name, {
                detail,
                bubbles: true,
                cancelable: true
            })),
            $watch: (property, callback) => {
                let previousValue;
                let initialized = false;
                reactive_js.runEffect(() => {
                    const value = data[property];
                    if (initialized && !Object.is(value, previousValue)) {
                        const oldValue = previousValue;
                        previousValue = value;
                        queueMicrotask(() => callback(value, oldValue));
                    } else {
                        previousValue = value;
                        initialized = true;
                    }
                }, element);
            },
            $nextTick: (callback) => queueMicrotask(callback),
            $id: (name, key) => {
                const root = scope.$idRoots && Object.hasOwn(scope.$idRoots, name) ? scope.$idRoots[name] : undefined;
                if (!root) return undefined;
                return `${name}-${root}${key !== undefined && key !== null ? `-${key}` : ''}`;
            }
        };
    }

    function compile(expression, scope, element, statement) {
        const magics = createMagics(scope, element);
        try {
            const body = statement ? expression : `return (${expression});`;
            const evaluate = new Function('$scope', '$magics', '$locals',
                `with ($magics) { with ($scope) { with ($locals) { ${body} } } }`);
            return (locals = {}) => evaluate.call(scope.data, scope.data, magics, locals);
        } catch (error) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, error);
            return () => undefined;
        }
    }

    function createEvaluator(expression, scope, element) {
        return compile(expression, scope, element, false);
    }

    function createExecutor(expression, scope, element) {
        return compile(expression, scope, element, true);
    }

    /**
     * SenangStart Actions - Event Handler
     * Centralized handler for ss-on:[event] with full modifier support.
     * 
     * @module handlers/events
     */


    /**
     * Handle ss-on:[event] dynamically.
     * Returns a function that removes the listener.
     */
    function handleEvent(el, attrName, expr, scope) {
        let spec = attrName.replace(/^ss-on:?(.*)$/, '$1');
        const rawParts = spec.split('.');
        let event = rawParts[0];
        const modifiers = rawParts.slice(1);
        const optionsRef = {};

        let listenerTarget = el;

        let active = true;
        let handler = (e) => {
            if (active) invoke(e);
        };

        // This little helper allows us to add functionality to the listener's
        // handler more flexibly in a "middleware" style.
        const wrapHandler = (callback, wrapper) => (e) => wrapper(callback, e);

        if (modifiers.includes('dot')) event = dotSyntax(event);
        if (modifiers.includes('camel')) event = camelCase(event);
        if (modifiers.includes('capture')) optionsRef.capture = true;
        if (modifiers.includes('window')) { listenerTarget = window; }
        if (modifiers.includes('document')) { listenerTarget = document; }

        if (modifiers.includes('passive')) {
            optionsRef.passive = modifiers[modifiers.indexOf('passive') + 1] !== 'false';
        }

        // By wrapping the handler with debounce & throttle first, we ensure that the wrapping logic itself
        // is not throttled/debounced, only the user's callback is.
        handler = addDebounceOrThrottle(modifiers, handler);

        if (modifiers.includes('prevent')) handler = wrapHandler(handler, (next, e) => { e.preventDefault(); next(e); });
        if (modifiers.includes('stop')) handler = wrapHandler(handler, (next, e) => { e.stopPropagation(); next(e); });

        if (modifiers.includes('once')) {
            handler = wrapHandler(handler, (next, e) => {
                next(e);
                listenerTarget.removeEventListener(event, handler, optionsRef);
            });
        }

        if (modifiers.includes('away') || modifiers.includes('outside')) {
            listenerTarget = document;

            handler = wrapHandler(handler, (next, e) => {
                if (el.contains(e.target)) return;
                if (e.target.isConnected === false) return;
                if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
                // Additional check for special implementations (e.g. collapse)
                if (el._x_isShown === false || el.__ssShown === false) return;
                next(e);
            });
        }

        if (modifiers.includes('self')) {
            handler = wrapHandler(handler, (next, e) => { e.target === el && next(e); });
        }

        // Handle :keydown and :keyup listeners.
        // Handle :click and :auxclick-like listeners.
        if (isKeyEvent(event) || isClickEvent(event)) {
            handler = wrapHandler(handler, (next, e) => {
                if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) return;
                next(e);
            });
        }

        listenerTarget.addEventListener(event, handler, optionsRef);

        const removeListener = () => {
            active = false;
            listenerTarget.removeEventListener(event, handler, optionsRef);
        };

        if (el && el.nodeType === 1) {
            // Expose cleanup so the framework can release listeners later if needed
            el.__ssOnCleanup = el.__ssOnCleanup || [];
            el.__ssOnCleanup.push(removeListener);
        }

        return removeListener;

        /**
         * Runs the user expression with $event available.
         * Supports bare method references: `ss-on:click="handleClick"`
         * invokes `handleClick($event)`.
         */
        function invoke(e) {
            if (isBareMethodReference(expr)) {
                const evaluator = createEvaluator(expr, scope, el);
                const fn = evaluator({ $event: e });
                if (typeof fn === 'function') fn(e);
                return;
            }

            const executor = createExecutor(expr, scope, el);
            executor({ $event: e });
        }
    }

    function addDebounceOrThrottle(modifiers, handler) {
        if (modifiers.includes('debounce')) {
            let nextModifier = modifiers[modifiers.indexOf('debounce') + 1] || 'invalid-wait';
            let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;

            handler = debounce(handler, wait);
        }
        if (modifiers.includes('throttle')) {
            let nextModifier = modifiers[modifiers.indexOf('throttle') + 1] || 'invalid-wait';
            let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;

            handler = throttle(handler, wait);
        }
        return handler;
    }

    function debounce(func, wait) {
        let timeout;

        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;

        return function (...args) {
            if (!inThrottle) {
                func.apply(null, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    function dotSyntax(subject) {
        return subject.replace(/-/g, '.')
    }

    function camelCase(subject) {
        return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase())
    }

    function isNumeric(subject) {
        // NaN strings should return false; short-circuit empty strings
        if (subject === '') return false;
        return !Array.isArray(subject) && !isNaN(subject);
    }

    function kebabCase(subject) {
        if ([' ', '_'].includes(subject)) return subject;
        return subject.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[_\s]/, '-').toLowerCase()
    }

    function isKeyEvent(event) {
        return ['keydown', 'keyup'].includes(event)
    }

    function isClickEvent(event) {
        return ['contextmenu', 'click', 'mouse'].some(i => event.includes(i))
    }

    // Every modifier ss-on consumes. None of them is a key name, so none of them
    // may be mistaken for one. (`enter` is deliberately absent: it is a real key.)
    const nonKeyModifiers = [
        // ss-on's own modifiers:
        'window', 'document', 'prevent', 'stop', 'once', 'capture', 'self',
        'away', 'outside', 'passive', 'dot', 'camel',
        // ss-model's own modifiers:
        'blur', 'change', 'lazy', 'number', 'boolean', 'trim', 'fill',
        'unintrusive', 'parent',
    ];

    function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
        let keyModifiers = modifiers.filter((modifier, index) => {
            // `.passive.false` - the argument isn't a key name either.
            if (modifier === 'false' && modifiers[index - 1] === 'passive') return false

            return !nonKeyModifiers.includes(modifier)
        });

        if (keyModifiers.includes('debounce')) {
            let debounceIndex = keyModifiers.indexOf('debounce');
            keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
        }

        if (keyModifiers.includes('throttle')) {
            let throttleIndex = keyModifiers.indexOf('throttle');
            keyModifiers.splice(throttleIndex, isNumeric((keyModifiers[throttleIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
        }

        // If no modifier is specified, we'll call it a press.
        if (keyModifiers.length === 0) return false

        // If one is passed, AND it matches the key pressed, we'll call it a press.
        if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0])) return false

        // The user is listening for key combinations.
        const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'];
        const selectedSystemKeyModifiers = systemKeyModifiers.filter(modifier => keyModifiers.includes(modifier));

        keyModifiers = keyModifiers.filter(i => !selectedSystemKeyModifiers.includes(i));

        if (selectedSystemKeyModifiers.length > 0) {
            const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter(modifier => {
                // Alias "cmd" and "super" to "meta"
                if (modifier === 'cmd' || modifier === 'super') modifier = 'meta';

                return e[`${modifier}Key`]
            });

            // If all the modifiers selected are pressed, ...
            if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
                // AND the event is a click. It's a pass.
                if (isClickEvent(e.type)) return false

                // OR the remaining key is pressed as well. It's a press.
                if (keyToModifiers(e.key).includes(keyModifiers[0])) return false
            }
        }

        // We'll call it NOT a valid keypress.
        return true
    }

    function keyToModifiers(key) {
        if (!key) return []

        key = kebabCase(key);

        let modifierToKeyMap = {
            'ctrl': 'control',
            'slash': '/',
            'space': ' ',
            'spacebar': ' ',
            'cmd': 'meta',
            'esc': 'escape',
            'up': 'arrow-up',
            'down': 'arrow-down',
            'left': 'arrow-left',
            'right': 'arrow-right',
            'period': '.',
            'comma': ',',
            'equal': '=',
            'minus': '-',
            'underscore': '_',
        };

        modifierToKeyMap[key] = key;

        return Object.keys(modifierToKeyMap).map(modifier => {
            if (modifierToKeyMap[modifier] === key) return modifier
        }).filter(modifier => modifier)
    }

    function isBareMethodReference(expr) {
        return /^[$\w$.]+$/.test(expr) && /[A-Za-z_$]/.test(expr)
    }

    /**
     * SenangStart Actions - ss-on Directive
     * Delegates all event handling logic to handlers/events.js
     * 
     * @module directives/on
     */


    function install() {
        registry_js.registerAttribute('ss-on', (el, attrName, expr, scope) => {
            handleEvent(el, attrName, expr, scope);
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
