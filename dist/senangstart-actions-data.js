this.SenangStart = (function (SenangStart, registry_js, reactive_js, walker_js) {
    'use strict';

    function install() {
        registry_js.registerScope('ss-data', (el, expr, scope, parentScope) => {
            expr = expr.trim();
            let initialData = {};
            
            if (expr) {
                const factory = walker_js.getDataFactory(expr);
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
                data: reactive_js.createReactive(initialData, () => {}),
                $refs: {},
                $store: walker_js.getGlobalStores() // Ensure we have access to stores
            };
            
            return newScope;
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive, SenangStart.internals.walker);
