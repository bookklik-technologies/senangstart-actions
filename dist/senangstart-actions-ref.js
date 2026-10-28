this.SenangStart = (function (SenangStart, registry_js) {
    'use strict';

    function handleRef(el, name, scope) {
        scope.$refs[name] = el;
        el.__ssOnCleanup = el.__ssOnCleanup || [];
        el.__ssOnCleanup.push(() => {
            if (scope.$refs[name] === el) delete scope.$refs[name];
        });
    }

    function install() {
        registry_js.registerAttribute('ss-ref', handleRef);
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry);
