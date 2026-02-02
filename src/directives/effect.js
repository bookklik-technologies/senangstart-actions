import { registerAttribute } from '../core/registry.js';
import { createExecutor } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-effect', (el, expr, scope) => {
        const update = () => {
            const executor = createExecutor(expr, scope, el);
            executor();
        };
        runEffect(update);
    });
}
