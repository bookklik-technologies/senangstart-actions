import { registerStructural } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { createReactive, runEffect } from '../reactive.js';

export function install() {
    registerStructural('ss-for', (templateEl, expr, scope, walk) => {
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
                    data: createReactive({ 
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
        
        runEffect(update);
        return true; // Stop walking the template element (it was removed)
    });
}
