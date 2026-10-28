this.SenangStart = (function (SenangStart, registry_js, reactive_js) {
    'use strict';

    function createMagics(scope, element) {
        const { data, $refs, $store } = scope;
        return {
            $data: data,
            $store,
            $el: element,
            $my: element,
            $refs,
            $dispatch: (name, detail = {}) => element.dispatchEvent(new CustomEvent(name, {
                detail,
                bubbles: true,
                cancelable: true
            })),
            $watch: (property, callback) => {
                let previousValue;
                let initialized = false;
                reactive_js.runEffect(() => {
                    const value = data[property];
                    if (initialized && !Object.is(value, previousValue)) {
                        const oldValue = previousValue;
                        previousValue = value;
                        queueMicrotask(() => callback(value, oldValue));
                    } else {
                        previousValue = value;
                        initialized = true;
                    }
                }, element);
            },
            $nextTick: (callback) => queueMicrotask(callback),
            $id: (name, key) => {
                const root = scope.$idRoots && Object.hasOwn(scope.$idRoots, name) ? scope.$idRoots[name] : undefined;
                if (!root) return undefined;
                return `${name}-${root}${key !== undefined && key !== null ? `-${key}` : ''}`;
            }
        };
    }

    function compile(expression, scope, element, statement) {
        const magics = createMagics(scope, element);
        try {
            const body = statement ? expression : `return (${expression});`;
            const evaluate = new Function('$scope', '$magics', '$locals',
                `with ($magics) { with ($scope) { with ($locals) { ${body} } } }`);
            return (locals = {}) => evaluate.call(scope.data, scope.data, magics, locals);
        } catch (error) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, error);
            return () => undefined;
        }
    }

    function createEvaluator(expression, scope, element) {
        return compile(expression, scope, element, false);
    }

    function createRegion(templateEl, label) {
        const parent = templateEl.parentNode;
        const start = document.createTextNode('');
        const anchor = document.createComment(label);
        parent.insertBefore(start, templateEl);
        parent.insertBefore(anchor, templateEl);
        templateEl.remove();

        const clear = () => {
            while (start.nextSibling && start.nextSibling !== anchor) {
                const node = start.nextSibling;
                reactive_js.cleanupTree(node);
                node.remove();
            }
        };
        anchor.__ssOnCleanup = [() => {
            clear();
            start.remove();
        }];
        return { parent, anchor, clear };
    }

    function handleFor(templateEl, expr, scope, walk) {
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

        reactive_js.runEffect(() => {
            const items = evaluate() ?? [];
            if (!Array.isArray(items)) {
                console.error('[SenangStart] ss-for requires an array:', expr);
                return;
            }
            clear();

            items.forEach((item, index) => {
                const localData = reactive_js.createReactive({ [itemName]: item, [indexName]: index }, () => {});
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

    function install() {
        registry_js.registerStructural('ss-for', handleFor);
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
