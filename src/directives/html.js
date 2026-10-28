import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function handleHtml(el, expr, scope) {
    const evaluate = createEvaluator(expr, scope, el);
    runEffect(() => {
        el.innerHTML = evaluate() ?? '';
    }, el);
}

export function install() {
    registerAttribute('ss-html', handleHtml);
}
