/**
 * SenangStart Actions - Attribute Handlers
 * Handlers for basic ss-* attributes
 * 
 * @module handlers/attributes
 */

import { createEvaluator, createExecutor } from '../evaluator.js';
import { runEffect } from '../reactive.js';

/**
 * Parse transition configuration from element attributes
 */
function getTransitionConfig(el) {
    const config = {
        enter: { duration: 150, delay: 0, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', opacity: 1, scale: 1 },
        leave: { duration: 150, delay: 0, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', opacity: 1, scale: 1 }
    };
    
    const attrs = Array.from(el.attributes);
    
    attrs.forEach(attr => {
        if (!attr.name.startsWith('ss-transition')) return;
        
        const parts = attr.name.split('.');
        // parts[0] is 'ss-transition' or 'ss-transition:enter' or 'ss-transition:leave'
        // parts[1...] are modifiers
        
        const mainPart = parts[0];
        let phase = 'both'; // both, enter, leave
        
        if (mainPart === 'ss-transition:enter') phase = 'enter';
        else if (mainPart === 'ss-transition:leave') phase = 'leave';
        else if (mainPart !== 'ss-transition') return; // ignore other attrs
        
        const modifiers = parts.slice(1);
        
        const applyModifier = (targetPhase) => {
            const phaseConfig = config[targetPhase];
            
            for (let i = 0; i < modifiers.length; i++) {
                const mod = modifiers[i];
                const nextMod = modifiers[i + 1];
                
                if (mod === 'duration' && nextMod) {
                    phaseConfig.duration = parseInt(nextMod.replace('ms', ''));
                    i++;
                } else if (mod === 'delay' && nextMod) {
                    phaseConfig.delay = parseInt(nextMod.replace('ms', ''));
                    i++;
                } else if (mod === 'opacity' && nextMod) {
                     phaseConfig.opacity = parseInt(nextMod) / 100;
                     i++;
                } else if (mod === 'scale' && nextMod) {
                     phaseConfig.scale = parseInt(nextMod) / 100;
                     i++;
                } else if (mod === 'easing' && nextMod) {
                     phaseConfig.easing = nextMod; // simple support for ease-in-out, etc?
                     // If it's a known css easing identifier it works, otherwise might process it.
                     // The user request example: ss-transition.easing.ease-in-out
                     i++;
                }
            }
        };
        
        if (phase === 'both') {
            applyModifier('enter');
            applyModifier('leave');
        } else {
            applyModifier(phase);
        }
    });
    
    return config;
}

/**
 * Handle ss-transition animations
 */
export function handleTransition(el, show, originalDisplay) {
    const config = getTransitionConfig(el); // Always parse fresh
    
    if (show) {
        // Enter transition
        // Cancel any pending leave transition
        // el.classList.remove('ss-leave-active', 'ss-leave-to'); // Actually handled by logic flow usually
        
        el.style.display = originalDisplay;
        
        // Initial state
        el.style.transition = 'none'; // reset to apply initial props
        
        const { duration, delay, easing, opacity, scale } = config.enter;
        
        // Helper to set transition CSS
        const setTransition = () => {
             el.style.transitionProperty = 'opacity, transform';
             el.style.transitionDuration = `${duration}ms`;
             el.style.transitionTimingFunction = easing;
             el.style.transitionDelay = `${delay}ms`;
        };

        // Start state (hidden-ish)
        if (opacity < 1) el.style.opacity = 0; // standard fade in
        if (scale < 1) el.style.transform = `scale(${scale})`; // standard scale in
        
        // If not using opacity/scale mods, specific classes might handle it?
        // Prioritize modifiers if they dictate change.
        // Users might mix classes and modifiers. 
        // If modifiers are present involving opacity/scale, we inline styles.
        
        // Also support standard class-based if no modifiers?
        // The previous implementation added classes. We should KEEP that behavior for bw compat.
        el.classList.add('ss-enter-from');
        el.classList.add('ss-enter-active');
        
        // Force reflow
        void el.offsetHeight;
        
        // Transition to end state
        requestAnimationFrame(() => {
            setTransition();
            
            el.classList.remove('ss-enter-from');
            el.classList.add('ss-enter-to');
            
            // Apply end inline styles
            if (opacity < 1) el.style.opacity = 1;
            if (scale < 1) el.style.transform = 'scale(1)';
        });
        
        const onEnd = () => {
            el.classList.remove('ss-enter-active', 'ss-enter-to');
            
            // Cleanup inline styles?
            el.style.transition = '';
            el.style.transitionProperty = '';
            el.style.transitionDuration = '';
            el.style.transitionTimingFunction = '';
            el.style.transitionDelay = '';
            el.style.opacity = '';
            el.style.transform = '';
            
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    } else {
        // Leave transition
        el.classList.add('ss-leave-from');
        el.classList.add('ss-leave-active');
        
        // Initial state (fully visible)
        el.style.transition = 'none';
        
        const { duration, delay, easing, opacity, scale } = config.leave;
        
        const setTransition = () => {
             el.style.transitionProperty = 'opacity, transform';
             el.style.transitionDuration = `${duration}ms`;
             el.style.transitionTimingFunction = easing; // Should this be 'leave' easing?
             el.style.transitionDelay = `${delay}ms`;
        };
        
        // Force reflow
        void el.offsetHeight;
        
        requestAnimationFrame(() => {
            setTransition();
            
            el.classList.remove('ss-leave-from');
            el.classList.add('ss-leave-to');
            
            // Target state
            if (opacity < 1) el.style.opacity = 0;
            if (scale < 1) el.style.transform = `scale(${scale})`;
        });
        
        const onEnd = () => {
            el.style.display = 'none';
            el.classList.remove('ss-leave-active', 'ss-leave-to');
            
            // Cleanup
            el.style.transition = '';
            el.style.transitionProperty = '';
            el.style.opacity = '';
            el.style.transform = '';
            
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
