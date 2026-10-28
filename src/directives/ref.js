import { registerAttribute } from '../core/registry.js';

export function handleRef(el, name, scope) {
    scope.$refs[name] = el;
    el.__ssOnCleanup = el.__ssOnCleanup || [];
    el.__ssOnCleanup.push(() => {
        if (scope.$refs[name] === el) delete scope.$refs[name];
    });
}

export function install() {
    registerAttribute('ss-ref', handleRef);
}
