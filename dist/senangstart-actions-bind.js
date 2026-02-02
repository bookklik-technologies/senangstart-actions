this.SenangStart = (function (SenangStart, registry_js, reactive_js) {
    'use strict';

    /**
     * SenangStart Actions - Expression Evaluator
     * Safe evaluation of expressions within component scope
     * 
     * @module evaluator
     */

    /**
     * Create a function to evaluate an expression within a component scope
     */
    function createEvaluator(expression, scope, element) {
        const { data, $refs, $store } = scope;
        
        // Magic properties
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
                const watchEffect = () => {
                    const value = data[prop];
                    callback(value);
                };
                if (data.__subscribers) {
                    if (!data.__subscribers.has(prop)) {
                        data.__subscribers.set(prop, new Set());
                    }
                    data.__subscribers.get(prop).add(watchEffect);
                }
            },
            $nextTick: (fn) => {
                queueMicrotask(fn);
            },
            $id: (name, key) => {
                if (scope.$idRoots && scope.$idRoots[name]) {
                    return `${name}-${scope.$idRoots[name]}${key ? `-${key}` : ''}`;
                }
                return undefined;
            }
        };
        
        // Build the function with data properties spread as local variables
        const dataKeys = Object.keys(typeof data === 'object' && data !== null ? data : {});
        const magicKeys = Object.keys(magics);
        
        try {
            const fn = new Function(
                ...dataKeys,
                ...magicKeys,
                `with(this) { return (${expression}); }`
            );
            
            return function() {
                const dataValues = dataKeys.map(k => data[k]);
                const magicValues = magicKeys.map(k => magics[k]);
                return fn.call(data, ...dataValues, ...magicValues);
            };
        } catch (e) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, e);
            return () => undefined;
        }
    }

    function install() {
        registry_js.registerAttribute('ss-bind', (el, attrName, expr, scope) => {
            const attr = attrName.replace('ss-bind:', '');
            
            const update = () => {
                const evaluator = createEvaluator(expr, scope, el);
                const value = evaluator();
                
                if (attr === 'class') {
                    if (typeof value === 'string') {
                        el.className = value;
                    } else if (typeof value === 'object') {
                        Object.entries(value).forEach(([className, condition]) => {
                            el.classList.toggle(className, !!condition);
                        });
                    }
                } else if (attr === 'style') {
                    if (typeof value === 'string') {
                        el.style.cssText = value;
                    } else if (typeof value === 'object') {
                        Object.assign(el.style, value);
                    }
                } else if (value === false || value === null || value === undefined) {
                    el.removeAttribute(attr);
                } else if (value === true) {
                    el.setAttribute(attr, '');
                } else {
                    el.setAttribute(attr, value);
                }
            };
            
            reactive_js.runEffect(update);
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
