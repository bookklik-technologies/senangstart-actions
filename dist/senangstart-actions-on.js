this.SenangStart = (function (SenangStart, registry_js) {
    'use strict';

    /**
     * SenangStart Actions - Expression Evaluator
     * Safe evaluation of expressions within component scope
     * 
     * @module evaluator
     */


    /**
     * Create a function to execute a statement (not return value)
     */
    function createExecutor(expression, scope, element) {
        const { data, $refs, $store } = scope;
        
        const magics = {
            $data: data,
            $store: $store,
            $el: element,
            $my: element,
            $refs: $refs,
            $dispatch: (name, detail = {}) => {
                element.dispatchEvent(new CustomEvent(name, {
                    detail,
                    bubbles: true,
                    cancelable: true
                }));
            },
            $watch: (prop, callback) => {
                if (data.__subscribers) {
                    if (!data.__subscribers.has(prop)) {
                        data.__subscribers.set(prop, new Set());
                    }
                    data.__subscribers.get(prop).add(() => callback(data[prop]));
                }
            },
            $nextTick: (fn) => {
                queueMicrotask(fn);
            }
        };
        
        const dataKeys = Object.keys(typeof data === 'object' && data !== null ? data : {});
        const magicKeys = Object.keys(magics);
        
        try {
            const fn = new Function(
                ...dataKeys,
                ...magicKeys,
                `with(this) { ${expression} }`
            );
            
            return function() {
                const dataValues = dataKeys.map(k => data[k]);
                const magicValues = magicKeys.map(k => magics[k]);
                return fn.call(data, ...dataValues, ...magicValues);
            };
        } catch (e) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, e);
            return () => {};
        }
    }

    function install() {
        registry_js.registerAttribute('ss-on', (el, attrName, expr, scope) => {
            const parts = attrName.replace('ss-on:', '').split('.');
            const eventName = parts[0];
            const modifiers = parts.slice(1);
            
            const executor = createExecutor(expr, scope, el);
            
            const handler = (event) => {
                if (modifiers.includes('prevent')) event.preventDefault();
                if (modifiers.includes('stop')) event.stopPropagation();
                if (modifiers.includes('self') && event.target !== el) return;
                if (modifiers.includes('once')) {
                    el.removeEventListener(eventName, handler);
                }
                
                if (event instanceof KeyboardEvent) {
                    const key = event.key.toLowerCase();
                    const keyModifiers = ['enter', 'escape', 'tab', 'space', 'up', 'down', 'left', 'right'];
                    const hasKeyModifier = modifiers.some(m => keyModifiers.includes(m));
                    
                    if (hasKeyModifier) {
                        const keyMap = {
                            'enter': 'enter',
                            'escape': 'escape',
                            'tab': 'tab',
                            'space': ' ',
                            'up': 'arrowup',
                            'down': 'arrowdown',
                            'left': 'arrowleft',
                            'right': 'arrowright'
                        };
                        
                        const shouldFire = modifiers.some(m => keyMap[m] === key);
                        if (!shouldFire) return;
                    }
                }
                
                scope.data.$event = event;
                executor();
                delete scope.data.$event;
            };
            
            if (modifiers.includes('window')) {
                window.addEventListener(eventName, handler);
            } else if (modifiers.includes('document')) {
                document.addEventListener(eventName, handler);
            } else {
                el.addEventListener(eventName, handler);
            }
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry);
