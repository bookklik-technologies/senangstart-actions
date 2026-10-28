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

    function handleIf(templateEl, expr, scope, walk) {
        if (templateEl.tagName !== 'TEMPLATE') {
            console.error('[SenangStart] ss-if requires a template element');
            return false;
        }
        const { parent, anchor, clear } = createRegion(templateEl, `ss-if: ${expr}`);
        const evaluate = createEvaluator(expr, scope, templateEl);
        let previousCondition;

        reactive_js.runEffect(() => {
            const condition = !!evaluate();
            if (condition === previousCondition) return;
            previousCondition = condition;
            clear();
            if (!condition) return;

            const clone = templateEl.content.cloneNode(true);
            const currentNodes = Array.from(clone.childNodes);
            currentNodes.forEach(node => {
                parent.insertBefore(node, anchor);
                if (node.nodeType === 1 && walk) walk(node, scope);
            });
        }, anchor);
        return true;
    }

    function install() {
        registry_js.registerStructural('ss-if', handleIf);
    }

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
