import { registerStructural } from '../core/registry.js';
import { cleanupTree } from '../reactive.js';

export function handleTeleport(templateEl, expr, scope, walk) {
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
        cleanupTree(node);
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

export function install() {
    registerStructural('ss-teleport', handleTeleport);
}
