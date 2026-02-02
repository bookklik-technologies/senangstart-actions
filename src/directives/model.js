
import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';

export function install() {
    registerAttribute('ss-model', (el, expr, scope) => {
        const { data } = scope;
        
        const isCheckbox = el.type === 'checkbox';
        const isRadio = el.type === 'radio';
        const isSelect = el.tagName === 'SELECT';
        
        const setInitialValue = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const value = evaluator();
            
            if (isCheckbox) {
                el.checked = !!value;
            } else if (isRadio) {
                el.checked = el.value === value;
            } else if (isSelect) {
                el.value = value ?? '';
            } else {
                el.value = value ?? '';
            }
        };
        
        runEffect(setInitialValue);
        
        const eventType = isCheckbox || isRadio ? 'change' : 'input';
        el.addEventListener(eventType, () => {
            let newValue;
            
            if (isCheckbox) {
                newValue = el.checked;
            } else if (isRadio) {
                if (el.checked) newValue = el.value;
                else return;
            } else {
                newValue = el.value;
            }
            
            data[expr] = newValue;
        });
    });
}
