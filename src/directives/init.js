import { registerAttribute } from '../core/registry.js';
import { createExecutor } from '../evaluator.js';

export function install() {
    registerAttribute('ss-init', (el, expr, scope) => {
        const executor = createExecutor(expr, scope, el);
        executor();
    });
}
