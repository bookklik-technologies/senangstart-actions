this.SenangStart = (function (SenangStart, registry_js, walker_js) {
    'use strict';

    function install() {
        registry_js.registerScope('ss-id', (el, expr, scope, parentScope) => {
            const idName = expr.trim() || 'default';
            const names = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
            const newScope = scope ? { ...scope } : {
                data: {}, $refs: {}, $store: walker_js.getGlobalStores()
            };
            newScope.$idRoots = { ...scope?.$idRoots };
            window.__ssIdCounts = window.__ssIdCounts || {};

            (Array.isArray(names) ? names : [names]).forEach(name => {
                const previous = Object.hasOwn(window.__ssIdCounts, name) ? window.__ssIdCounts[name] : 0;
                const id = previous + 1;
                Object.defineProperty(window.__ssIdCounts, name, {
                    value: id, writable: true, configurable: true, enumerable: true
                });
                Object.defineProperty(newScope.$idRoots, name, {
                    value: id, writable: true, configurable: true, enumerable: true
                });
            });
            return newScope;
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.walker);
