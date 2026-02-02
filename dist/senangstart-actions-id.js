this.SenangStart = (function (SenangStart, registry_js, walker_js) {
    'use strict';

    function install() {
        registry_js.registerScope('ss-id', (el, expr, scope, parentScope) => {
            const idName = expr.trim() || 'default';
            const idNameArray = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
            
            // Ensure scope exists
            let newScope = scope;
            if (!scope) {
               newScope = parentScope ? { ...parentScope } : { data: {}, $refs: {}, $store: walker_js.getGlobalStores() };
            } else {
                 // Shallow copy to augment for this specific branch
                 newScope = { ...scope };
            }
            
            if (!newScope.$idRoots) newScope.$idRoots = {};
            
            (Array.isArray(idNameArray) ? idNameArray : [idNameArray]).forEach(name => {
                 if (!newScope.$idRoots[name]) {
                     if (!window.__ssIdCounts) window.__ssIdCounts = {};
                     if (!window.__ssIdCounts[name]) window.__ssIdCounts[name] = 0;
                     const id = ++window.__ssIdCounts[name];
                     newScope.$idRoots[name] = id;
                 }
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
