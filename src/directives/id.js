import { registerScope } from '../core/registry.js';
import { getGlobalStores } from '../walker.js';

export function install() {
    registerScope('ss-id', (el, expr, scope, parentScope) => {
        const idName = expr.trim() || 'default';
        const names = idName.startsWith('[') ? new Function(`return ${idName}`)() : [idName];
        const newScope = scope ? { ...scope } : {
            data: {}, $refs: {}, $store: getGlobalStores()
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
