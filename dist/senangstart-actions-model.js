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
        registry_js.registerAttribute('ss-model', (el, expr, scope) => {
            const { data } = scope;
            
            const isCheckbox = el.type === 'checkbox';
            const isRadio = el.type === 'radio';
            const isSelect = el.tagName === 'SELECT';
            
            const setInitialValue = () => {
                const evaluator = createEvaluator(expr, scope, el);
                const value = evaluator();
                
                if (isCheckbox) {
                    el.checked = !!value;
                } else if (isRadio) {
                    el.checked = el.value === value;
                } else if (isSelect) {
                    el.value = value ?? '';
                } else {
                    el.value = value ?? '';
                }
            };
            
            reactive_js.runEffect(setInitialValue);
            
            const eventType = isCheckbox || isRadio ? 'change' : 'input';
            el.addEventListener(eventType, () => {
                let newValue;
                
                if (isCheckbox) {
                    newValue = el.checked;
                } else if (isRadio) {
                    if (el.checked) newValue = el.value;
                    else return;
                } else {
                    newValue = el.value;
                }
                
                data[expr] = newValue;
            });
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
