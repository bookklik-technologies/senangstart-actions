this.SenangStart = (function (SenangStart, registry_js) {
    'use strict';

    function install() {
        registry_js.registerAttribute('ss-ref', (el, name, scope) => {
            scope.$refs[name] = el;
        });
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry);
