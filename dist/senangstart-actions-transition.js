this.SenangStart = (function (SenangStart) {
    'use strict';

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart);
