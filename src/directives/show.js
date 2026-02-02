import { registerAttribute } from '../core/registry.js';
import { createEvaluator } from '../evaluator.js';
import { runEffect } from '../reactive.js';
import { handleTransition } from './transition.js'; // We'll move transition logic too

export function install() {
    registerAttribute('ss-show', (el, expr, scope) => {
        const originalDisplay = el.style.display || '';
        
        const update = () => {
            const evaluator = createEvaluator(expr, scope, el);
            const show = !!evaluator();
            
            // Check for any transition attribute
            const hasTransition = Array.from(el.attributes)
                .some(attr => attr.name.startsWith('ss-transition'));
            
            if (hasTransition) {
                handleTransition(el, show, originalDisplay);
            } else {
                el.style.display = show ? originalDisplay : 'none';
            }
        };
        runEffect(update);
    });
}
