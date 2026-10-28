import { registerAttribute } from '../core/registry.js';
import { createExecutor } from '../evaluator.js';

export function handleInit(el, expr, scope) {
    createExecutor(expr, scope, el)();
}

export function install() {
    registerAttribute('ss-init', handleInit);
}
