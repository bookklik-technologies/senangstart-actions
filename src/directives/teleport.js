import { registerStructural } from '../core/registry.js';

export function install() {
    registerStructural('ss-teleport', (templateEl, expr, scope, walk) => {
        const targetSelector = expr;
        let target = document.querySelector(targetSelector);
        
        const anchor = document.createComment(`ss-teleport: ${targetSelector}`);
        templateEl.parentNode.insertBefore(anchor, templateEl);
        templateEl.remove();
        
        if (!target) {
            console.warn(`[SenangStart] ss-teleport target not found: ${targetSelector}`);
            return true;
        }
        
        const clone = templateEl.content.cloneNode(true);
        const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
        
        nodes.forEach(node => {
            target.appendChild(node);
            if (walk) walk(node, scope);
        });
        
        return true;
    });
}
