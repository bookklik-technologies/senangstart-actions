import { registerStructural } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { createReactive, runEffect } from '../reactive.js';
import { createRegion } from './region.js';

export function handleFor(templateEl, expr, scope, walk) {
    if (templateEl.tagName !== 'TEMPLATE') {
        console.error('[SenangStart] ss-for requires a template element');
        return false;
    }
    const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
    if (!match) {
        console.error('[SenangStart] Invalid ss-for expression:', expr);
        return false;
    }
    const itemName = (match[1] || match[3]).trim();
    const indexName = (match[2] || 'index').trim();
    const { parent, anchor, clear } = createRegion(templateEl, `ss-for: ${expr}`);
    const evaluate = createEvaluator(match[4], scope, templateEl);

    runEffect(() => {
        const items = evaluate() ?? [];
        if (!Array.isArray(items)) {
            console.error('[SenangStart] ss-for requires an array:', expr);
            return;
        }
        clear();

        items.forEach((item, index) => {
            const localData = createReactive({ [itemName]: item, [indexName]: index }, () => {});
            const data = new Proxy(localData, {
                has(target, property) {
                    return Reflect.has(target, property) || Reflect.has(scope.data, property);
                },
                get(target, property, receiver) {
                    if (property === '__isReactive' || property === '__subscribers' || Reflect.has(target, property)) {
                        return Reflect.get(target, property, receiver);
                    }
                    return scope.data[property];
                },
                set(target, property, value) {
                    if (Object.hasOwn(target, property) || !Reflect.has(scope.data, property)) {
                        return Reflect.set(target, property, value);
                    }
                    return Reflect.set(scope.data, property, value);
                }
            });
            const itemScope = { ...scope, data, parentData: scope.data };
            const clone = templateEl.content.cloneNode(true);
            Array.from(clone.childNodes).forEach(node => {
                parent.insertBefore(node, anchor);
                if (node.nodeType === 1) {
                    node.__ssScope = itemScope;
                    if (walk) walk(node, itemScope);
                }
            });
        });
    }, anchor);
    return true;
}

export function install() {
    registerStructural('ss-for', handleFor);
}
