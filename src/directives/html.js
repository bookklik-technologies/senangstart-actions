import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-html', (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerHTML = evaluator() ?? '';
        };
        runEffect(update);
    });
}
