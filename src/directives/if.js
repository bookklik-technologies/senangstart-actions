import { registerStructural } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerStructural('ss-if', (templateEl, expr, scope, walk) => {
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
        
        runEffect(update);
        return true;
    });
}
