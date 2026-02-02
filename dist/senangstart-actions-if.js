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
        registry_js.registerStructural('ss-if', (templateEl, expr, scope, walk) => {
            const parent = templateEl.parentNode;
            const anchor = document.createComment(`ss-if: ${expr}`);
            parent.insertBefore(anchor, templateEl);
            templateEl.remove();
            
            let currentNodes = [];
            
            const update = () => {
                const evaluator = createEvaluator(expr, scope, templateEl);
                const condition = !!evaluator();
                
                currentNodes.forEach(node => node.remove());
                currentNodes = [];
                
                if (condition) {
                    const clone = templateEl.content.cloneNode(true);
                    const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
                    
                    nodes.forEach(node => {
                        parent.insertBefore(node, anchor);
                        currentNodes.push(node);
                        if (walk) walk(node, scope);
                    });
                }
            };
            
            reactive_js.runEffect(update);
            return true;
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
