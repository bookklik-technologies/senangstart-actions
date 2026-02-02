import { registerAttribute } from '../core/registry.js';

export function install() {
    registerAttribute('ss-ref', (el, name, scope) => {
        scope.$refs[name] = el;
    });
}
