/**
 * SenangStart Actions - Bind Handler
 * Handler for ss-bind:[attr] dynamic attribute binding
 * 
 * @module handlers/bind
 */

import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

/**
 * Handle ss-bind:[attr] dynamically
 */
export function handleBind(el, attrName, expr, scope) {
    const attr = attrName.replace('ss-bind:', '');
    
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const value = evaluator();
        
        if (attr === 'class') {
            if (typeof value === 'string') {
                el.className = value;
            } else if (typeof value === 'object') {
                // Object syntax: { 'class-name': condition }
                Object.entries(value).forEach(([className, condition]) => {
                    el.classList.toggle(className, !!condition);
                });
            }
        } else if (attr === 'style') {
            if (typeof value === 'string') {
                el.style.cssText = value;
            } else if (typeof value === 'object') {
                Object.assign(el.style, value);
            }
        } else if (value === false || value === null || value === undefined) {
            el.removeAttribute(attr);
        } else if (value === true) {
            el.setAttribute(attr, '');
        } else {
            el.setAttribute(attr, value);
        }
    };
    
    runEffect(update);
}
