import { handleText } from '../directives/text.js';
import { handleHtml } from '../directives/html.js';
import { handleShow } from '../directives/show.js';
import { handleModel } from '../directives/model.js';
import { handleRef } from '../directives/ref.js';
import { handleInit } from '../directives/init.js';
import { handleEffect } from '../directives/effect.js';

export { handleTransition } from '../directives/transition.js';

export const attributeHandlers = {
    'ss-text': handleText,
    'ss-html': handleHtml,
    'ss-show': handleShow,
    'ss-model': handleModel,
    'ss-ref': handleRef,
    'ss-init': handleInit,
    'ss-effect': handleEffect
};
