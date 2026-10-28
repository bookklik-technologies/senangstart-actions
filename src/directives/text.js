import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function handleText(el, expr, scope) {
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        el.innerText = evaluate() ?? '';
    }, el);
}

export function install() {
    registerAttribute('ss-text', handleText);
}
