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

    function handleBind(el, attrName, expr, scope) {
        const attr = attrName.replace('ss-bind:', '');
        const evaluate = createEvaluator(expr, scope, el);
        const previousClasses = new Map();
        const previousStyles = new Map();

        reactive_js.runEffect(() => {
            const value = evaluate();
            if (attr === 'class') {
                previousClasses.forEach((present, name) => el.classList.toggle(name, present));
                previousClasses.clear();
                const classes = typeof value === 'string' ? { [value]: true } : value;
                if (!classes || typeof classes !== 'object') return;
                Object.entries(classes).forEach(([names, condition]) => {
                    names.split(/\s+/).filter(Boolean).forEach(name => {
                        if (!previousClasses.has(name)) previousClasses.set(name, el.classList.contains(name));
                        el.classList.toggle(name, !!condition);
                    });
                });
            } else if (attr === 'style') {
                previousStyles.forEach(([original, priority], name) => {
                    if (original) el.style.setProperty(name, original, priority);
                    else el.style.removeProperty(name);
                });
                previousStyles.clear();
                let styles = value;
                let parsed;
                if (typeof value === 'string') {
                    parsed = document.createElement('div').style;
                    parsed.cssText = value;
                    styles = Object.fromEntries(Array.from(parsed).map(name => [name, parsed.getPropertyValue(name)]));
                }
                if (!styles || typeof styles !== 'object') return;
                Object.entries(styles).forEach(([property, setting]) => {
                    const name = property.startsWith('--') ? property : property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                    previousStyles.set(name, [el.style.getPropertyValue(name), el.style.getPropertyPriority(name)]);
                    el.style.setProperty(name, setting ?? '', parsed?.getPropertyPriority(name) ?? '');
                });
            } else if (value === false || value === null || value === undefined) {
                el.removeAttribute(attr);
            } else {
                el.setAttribute(attr, value === true ? '' : value);
            }
        }, el);
    }

    function install() {
        registry_js.registerAttribute('ss-bind', handleBind);
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
