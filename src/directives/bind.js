import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function handleBind(el, attrName, expr, scope) {
    const attr = attrName.replace('ss-bind:', '');
    const evaluate = createEvaluator(expr, scope, el);
    const previousClasses = new Map();
    const previousStyles = new Map();

    runEffect(() => {
        const value = evaluate();
        if (attr === 'class') {
            previousClasses.forEach((present, name) => el.classList.toggle(name, present));
            previousClasses.clear();
            const classes = typeof value === 'string' ? { [value]: true } : value;
            if (!classes || typeof classes !== 'object') return;
            Object.entries(classes).forEach(([names, condition]) => {
                names.split(/\s+/).filter(Boolean).forEach(name => {
                    if (!previousClasses.has(name)) previousClasses.set(name, el.classList.contains(name));
                    el.classList.toggle(name, !!condition);
                });
            });
        } else if (attr === 'style') {
            previousStyles.forEach(([original, priority], name) => {
                if (original) el.style.setProperty(name, original, priority);
                else el.style.removeProperty(name);
            });
            previousStyles.clear();
            let styles = value;
            let parsed;
            if (typeof value === 'string') {
                parsed = document.createElement('div').style;
                parsed.cssText = value;
                styles = Object.fromEntries(Array.from(parsed).map(name => [name, parsed.getPropertyValue(name)]));
            }
            if (!styles || typeof styles !== 'object') return;
            Object.entries(styles).forEach(([property, setting]) => {
                const name = property.startsWith('--') ? property : property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                previousStyles.set(name, [el.style.getPropertyValue(name), el.style.getPropertyPriority(name)]);
                el.style.setProperty(name, setting ?? '', parsed?.getPropertyPriority(name) ?? '');
            });
        } else if (value === false || value === null || value === undefined) {
            el.removeAttribute(attr);
        } else {
            el.setAttribute(attr, value === true ? '' : value);
        }
    }, el);
}

export function install() {
    registerAttribute('ss-bind', handleBind);
}
