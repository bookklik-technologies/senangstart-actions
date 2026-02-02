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
        registry_js.registerStructural('ss-for', (templateEl, expr, scope, walk) => {
            // Parse "item in items"
            const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
            if (!match) {
                console.error('[SenangStart] Invalid ss-for expression:', expr);
                return false;
            }
            
            const itemName = (match[1] || match[3]).trim();
            const indexName = (match[2] || 'index').trim();
            const arrayExpr = match[4];
            
            const parent = templateEl.parentNode;
            const anchor = document.createComment(`ss-for: ${expr}`);
            parent.insertBefore(anchor, templateEl);
            templateEl.remove();
            
            let currentNodes = [];
            let lastItemsJSON = '';
            
            const update = () => {
                const evaluator = createEvaluator(arrayExpr, scope, templateEl);
                const items = evaluator() || [];
                
                const itemsJSON = JSON.stringify(items);
                if (itemsJSON === lastItemsJSON) return;
                lastItemsJSON = itemsJSON;
                
                currentNodes.forEach(node => node.remove());
                currentNodes = [];
                
                items.forEach((item, index) => {
                    const clone = templateEl.content.cloneNode(true);
                    const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
                    
                    const itemScope = {
                        data: reactive_js.createReactive({ 
                            ...scope.data, 
                            [itemName]: item, 
                            [indexName]: index 
                        }, () => {}),
                        $refs: scope.$refs,
                        $store: scope.$store,
                        parentData: scope.data
                    };
                    
                    nodes.forEach(node => {
                        parent.insertBefore(node, anchor);
                        currentNodes.push(node);
                        node.__ssScope = itemScope;
                        if (walk) walk(node, itemScope);
                    });
                });
            };
            
            reactive_js.runEffect(update);
            return true; // Stop walking the template element (it was removed)
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
