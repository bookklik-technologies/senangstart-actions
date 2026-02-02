this.SenangStart = (function (SenangStart, registry_js) {
    'use strict';

    function install() {
        registry_js.registerStructural('ss-teleport', (templateEl, expr, scope, walk) => {
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

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry);
