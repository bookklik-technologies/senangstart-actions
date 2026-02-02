import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-text', (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerText = evaluator() ?? '';
        };
        runEffect(update);
    });
}
