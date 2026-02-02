this.SenangStart = (function (SenangStart, registry_js, reactive_js) {
    'use strict';

    /**
     * SenangStart Actions - Expression Evaluator
     * Safe evaluation of expressions within component scope
     * 
     * @module evaluator
     */

    /**
     * Create a function to evaluate an expression within a component scope
     */
    function createEvaluator(expression, scope, element) {
        const { data, $refs, $store } = scope;
        
        // Magic properties
        const magics = {
            $data: data,
            $store: $store,
            $el: element,
            $my: element,
            $refs: $refs,
            $dispatch: (name, detail = {}) => {
                element.dispatchEvent(new CustomEvent(name, {
                    detail,
                    bubbles: true,
                    cancelable: true
                }));
            },
            $watch: (prop, callback) => {
                const watchEffect = () => {
                    const value = data[prop];
                    callback(value);
                };
                if (data.__subscribers) {
                    if (!data.__subscribers.has(prop)) {
                        data.__subscribers.set(prop, new Set());
                    }
                    data.__subscribers.get(prop).add(watchEffect);
                }
            },
            $nextTick: (fn) => {
                queueMicrotask(fn);
            },
            $id: (name, key) => {
                if (scope.$idRoots && scope.$idRoots[name]) {
                    return `${name}-${scope.$idRoots[name]}${key ? `-${key}` : ''}`;
                }
                return undefined;
            }
        };
        
        // Build the function with data properties spread as local variables
        const dataKeys = Object.keys(typeof data === 'object' && data !== null ? data : {});
        const magicKeys = Object.keys(magics);
        
        try {
            const fn = new Function(
                ...dataKeys,
                ...magicKeys,
                `with(this) { return (${expression}); }`
            );
            
            return function() {
                const dataValues = dataKeys.map(k => data[k]);
                const magicValues = magicKeys.map(k => magics[k]);
                return fn.call(data, ...dataValues, ...magicValues);
            };
        } catch (e) {
            console.error(`[SenangStart] Failed to parse expression: ${expression}`, e);
            return () => undefined;
        }
    }

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
            const mainPart = parts[0];
            let phase = 'both'; // both, enter, leave
            
            if (mainPart === 'ss-transition:enter') phase = 'enter';
            else if (mainPart === 'ss-transition:leave') phase = 'leave';
            else if (mainPart !== 'ss-transition') return;
            
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
                         phaseConfig.easing = nextMod;
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
    function handleTransition(el, show, originalDisplay) {
        const config = getTransitionConfig(el);
        
        if (show) {
            // Enter
            el.style.display = originalDisplay;
            el.style.transition = 'none';
            
            const { duration, delay, easing, opacity, scale } = config.enter;
            
            const setTransition = () => {
                 el.style.transitionProperty = 'opacity, transform';
                 el.style.transitionDuration = `${duration}ms`;
                 el.style.transitionTimingFunction = easing;
                 el.style.transitionDelay = `${delay}ms`;
            };

            if (opacity < 1) el.style.opacity = 0;
            if (scale < 1) el.style.transform = `scale(${scale})`;
            
            el.classList.add('ss-enter-from');
            el.classList.add('ss-enter-active');
            
            void el.offsetHeight; // Force reflow
            
            requestAnimationFrame(() => {
                setTransition();
                el.classList.remove('ss-enter-from');
                el.classList.add('ss-enter-to');
                
                if (opacity < 1) el.style.opacity = 1;
                if (scale < 1) el.style.transform = 'scale(1)';
            });
            
            const onEnd = () => {
                el.classList.remove('ss-enter-active', 'ss-enter-to');
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
            // Leave
            el.classList.add('ss-leave-from');
            el.classList.add('ss-leave-active');
            el.style.transition = 'none';
            
            const { duration, delay, easing, opacity, scale } = config.leave;
            
            const setTransition = () => {
                 el.style.transitionProperty = 'opacity, transform';
                 el.style.transitionDuration = `${duration}ms`;
                 el.style.transitionTimingFunction = easing;
                 el.style.transitionDelay = `${delay}ms`;
            };
            
            void el.offsetHeight;
            
            requestAnimationFrame(() => {
                setTransition();
                el.classList.remove('ss-leave-from');
                el.classList.add('ss-leave-to');
                
                if (opacity < 1) el.style.opacity = 0;
                if (scale < 1) el.style.transform = `scale(${scale})`;
            });
            
            const onEnd = () => {
                el.style.display = 'none';
                el.classList.remove('ss-leave-active', 'ss-leave-to');
                el.style.transition = '';
                el.style.transitionProperty = '';
                el.style.opacity = '';
                el.style.transform = '';
                el.removeEventListener('transitionend', onEnd);
            };
            el.addEventListener('transitionend', onEnd);
        }
    }

    function install() {
        registry_js.registerAttribute('ss-show', (el, expr, scope) => {
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
            reactive_js.runEffect(update);
        });
    }

    // show usually needs transition too? Assume logic is embedded or separate?
    // User said "each only support its specific directives only". 
    // But show relies on transition.js logic (internal import), so it works. 
    // It does NOT support `ss-transition` unless registered.
    // So `ss-show` works, but `ss-transition` attribute won't be parsed?
    // Wait, `show.js` imports `handleTransition` directly.
    // And `handleTransition` parses attributes from the element passed to it.
    // So `ss-transition` attributes WILL work on the element that has `ss-show`.
    // But `ss-transition` won't be a registered directive (so no warning if warned, but otherwise fine).
    // So this is correct.

    install();

    if (typeof window !== 'undefined') {
        window.SenangStart = SenangStart;
    }
    SenangStart.start();

    return SenangStart;

})(SenangStart, SenangStart.internals.registry, SenangStart.internals.reactive);
