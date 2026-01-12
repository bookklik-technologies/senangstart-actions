/**
 * SenangStart Actions - Attribute Handlers
 * Handlers for basic ss-* attributes
 * 
 * @module handlers/attributes
 */

import { createEvaluator, createExecutor } from '../evaluator.js';
import { runEffect } from '../reactive.js';

/**
 * Handle ss-transition animations
 */
export function handleTransition(el, show, originalDisplay) {
    if (show) {
        // Enter transition
        el.classList.add('ss-enter-from');
        el.classList.add('ss-enter-active');
        el.style.display = originalDisplay;
        
        requestAnimationFrame(() => {
            el.classList.remove('ss-enter-from');
            el.classList.add('ss-enter-to');
        });
        
        const onEnd = () => {
            el.classList.remove('ss-enter-active', 'ss-enter-to');
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    } else {
        // Leave transition
        el.classList.add('ss-leave-from');
        el.classList.add('ss-leave-active');
        
        requestAnimationFrame(() => {
            el.classList.remove('ss-leave-from');
            el.classList.add('ss-leave-to');
        });
        
        const onEnd = () => {
            el.style.display = 'none';
            el.classList.remove('ss-leave-active', 'ss-leave-to');
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    }
}

/**
 * Attribute handlers map
 */
export const attributeHandlers = {
    /**
     * ss-text: Set element's innerText
     */
    'ss-text': (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerText = evaluator() ?? '';
        };
        runEffect(update);
    },
    
    /**
     * ss-html: Set element's innerHTML
     */
    'ss-html': (el, expr, scope) => {
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            el.innerHTML = evaluator() ?? '';
        };
        runEffect(update);
    },
    
    /**
     * ss-show: Toggle visibility
     */
    'ss-show': (el, expr, scope) => {
        const originalDisplay = el.style.display || '';
        
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const show = !!evaluator();
            
            if (el.hasAttribute('ss-transition')) {
                handleTransition(el, show, originalDisplay);
            } else {
                el.style.display = show ? originalDisplay : 'none';
            }
        };
        runEffect(update);
    },
    
    /**
     * ss-model: Two-way binding for inputs
     */
    'ss-model': (el, expr, scope) => {
        const { data } = scope;
        
        // Determine input type
        const isCheckbox = el.type === 'checkbox';
        const isRadio = el.type === 'radio';
        const isSelect = el.tagName === 'SELECT';
        
        // Set initial value
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
        
        // Listen for changes
        const eventType = isCheckbox || isRadio ? 'change' : 'input';
        el.addEventListener(eventType, () => {
            let newValue;
            
            if (isCheckbox) {
                newValue = el.checked;
            } else if (isRadio) {
                if (el.checked) newValue = el.value;
                else return; // Don't update if not checked
            } else {
                newValue = el.value;
            }
            
            // Set the value on the data object
            data[expr] = newValue;
        });
    },
    
    /**
     * ss-ref: Register element reference
     */
    'ss-ref': (el, name, scope) => {
        scope.$refs[name] = el;
    },
    
    /**
     * ss-init: Run initialization code
     */
    'ss-init': (el, expr, scope) => {
        const executor = createExecutor(expr, scope, el);
        executor();
    },
    
    /**
     * ss-effect: Run reactive effect
     */
    'ss-effect': (el, expr, scope) => {
        const update = () => {
            const executor = createExecutor(expr, scope, el);
            executor();
        };
        runEffect(update);
    }
};
