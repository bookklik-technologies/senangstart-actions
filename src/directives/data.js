import { registerScope } from '../core/registry.js';
import { createReactive } from '../reactive.js';
import { getDataFactory, getGlobalStores } from '../walker.js';

export function install() {
    registerScope('ss-data', (el, expr, scope, parentScope) => {
        expr = expr.trim();
        let initialData = {};
        
        if (expr) {
            const factory = getDataFactory(expr);
            if (factory) {
                initialData = factory();
            } else {
                try {
                    initialData = new Function(`return (${expr})`)();
                } catch (e) {
                    console.error('[SenangStart] Failed to parse ss-data:', expr, e);
                }
            }
        }
        
        // ss-data creates a new scope
        const newScope = {
            data: createReactive(initialData, () => {}),
            $refs: {},
            $store: getGlobalStores() // Ensure we have access to stores
        };
        
        return newScope;
    });
}
