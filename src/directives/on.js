/**
 * SenangStart Actions - ss-on Directive
 * Delegates all event handling logic to handlers/events.js
 * 
 * @module directives/on
 */

import { registerAttribute } from '../core/registry.js';
import { handleEvent } from '../handlers/events.js';

export function install() {
    registerAttribute('ss-on', (el, attrName, expr, scope) => {
        handleEvent(el, attrName, expr, scope);
    });
}
