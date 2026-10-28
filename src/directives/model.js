import { registerAttribute } from '../core/registry.js';
import { createEvaluator, createExecutor } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function handleModel(el, expr, scope) {
    const isCheckbox = el.type === 'checkbox';
    const isRadio = el.type === 'radio';
    const isSelect = el.tagName === 'SELECT';
    const evaluate = createEvaluator(expr, scope, el);
    const assign = createExecutor(`${expr} = $value`, scope, el);

    runEffect(() => {
        const value = evaluate();
        if (isCheckbox) {
            el.checked = !!value;
        } else if (isRadio) {
            el.checked = el.value === value;
        } else {
            el.value = value ?? '';
        }
    }, el);

    const eventType = isCheckbox || isRadio || isSelect ? 'change' : 'input';
    const onInput = () => {
        if (isRadio && !el.checked) return;
        assign({ $value: isCheckbox ? el.checked : el.value });
    };
    el.addEventListener(eventType, onInput);
    el.__ssOnCleanup = el.__ssOnCleanup || [];
    el.__ssOnCleanup.push(() => el.removeEventListener(eventType, onInput));
}

export function install() {
    registerAttribute('ss-model', handleModel);
}
