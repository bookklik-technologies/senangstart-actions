import { runEffect } from './reactive.js';

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
            runEffect(() => {
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

export function createEvaluator(expression, scope, element) {
    return compile(expression, scope, element, false);
}

export function createExecutor(expression, scope, element) {
    return compile(expression, scope, element, true);
}
