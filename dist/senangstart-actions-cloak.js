this.SenangStart = (function (SenangStart, registry_js) {
    'use strict';

    function install() {
        // Inject style
        if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = '[ss-cloak] { display: none !important; }';
            document.head.appendChild(style);
        }

        registry_js.registerAttribute('ss-cloak', (el, expr, scope) => {
            el.removeAttribute('ss-cloak');
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry);
