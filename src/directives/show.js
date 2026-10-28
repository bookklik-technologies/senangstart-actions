import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';
import { handleTransition } from './transition.js';

export function handleShow(el, expr, scope) {
    const originalDisplay = el.style.display || '';
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        const show = !!evaluate();
        const hasTransition = Array.from(el.attributes).some(attr => attr.name.startsWith('ss-transition'));
        if (hasTransition) handleTransition(el, show, originalDisplay);
        else el.style.display = show ? originalDisplay : 'none';
    }, el);
}

export function install() {
    registerAttribute('ss-show', handleShow);
}
