import { registerAttribute } from '../core/registry.js';
import { createExecutor } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function handleEffect(el, expr, scope) {
    const execute = createExecutor(expr, scope, el);
    runEffect(() => execute(), el);
}

export function install() {
    registerAttribute('ss-effect', handleEffect);
}
