this.SenangStart = (function (SenangStart, registry_js, reactive_js) {
    'use strict';

    function handleTeleport(templateEl, expr, scope, walk) {
        if (templateEl.tagName !== 'TEMPLATE') {
            console.error('[SenangStart] ss-teleport requires a template element');
            return false;
        }
        const target = document.querySelector(expr);
        const anchor = document.createComment(`ss-teleport: ${expr}`);
        templateEl.parentNode.insertBefore(anchor, templateEl);
        templateEl.remove();
        if (!target) {
            console.warn(`[SenangStart] ss-teleport target not found: ${expr}`);
            return true;
        }
        const clone = templateEl.content.cloneNode(true);
        const nodes = Array.from(clone.childNodes);
        anchor.__ssOnCleanup = [() => nodes.forEach(node => {
            reactive_js.cleanupTree(node);
            node.remove();
        })];

        nodes.forEach(node => {
            target.appendChild(node);
            if (node.nodeType === 1) {
                node.__ssScope = scope;
                if (walk) walk(node, scope);
            }
        });
        return true;
    }

    function install() {
        registry_js.registerStructural('ss-teleport', handleTeleport);
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
