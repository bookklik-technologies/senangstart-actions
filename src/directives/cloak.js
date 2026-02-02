import { registerAttribute } from '../core/registry.js';

export function install() {
    // Inject style
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = '[ss-cloak] { display: none !important; }';
        document.head.appendChild(style);
    }

    registerAttribute('ss-cloak', (el, expr, scope) => {
        el.removeAttribute('ss-cloak');
    });
}
