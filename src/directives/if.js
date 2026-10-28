import { registerStructural } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';
import { createRegion } from './region.js';

export function handleIf(templateEl, expr, scope, walk) {
    if (templateEl.tagName !== 'TEMPLATE') {
        console.error('[SenangStart] ss-if requires a template element');
        return false;
    }
    const { parent, anchor, clear } = createRegion(templateEl, `ss-if: ${expr}`);
    const evaluate = createEvaluator(expr, scope, templateEl);
    let previousCondition;

    runEffect(() => {
        const condition = !!evaluate();
        if (condition === previousCondition) return;
        previousCondition = condition;
        clear();
        if (!condition) return;

        const clone = templateEl.content.cloneNode(true);
        const currentNodes = Array.from(clone.childNodes);
        currentNodes.forEach(node => {
            parent.insertBefore(node, anchor);
            if (node.nodeType === 1 && walk) walk(node, scope);
        });
    }, anchor);
    return true;
}

export function install() {
    registerStructural('ss-if', handleIf);
}
