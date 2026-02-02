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
export function handleTransition(el, show, originalDisplay) {
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

// Just an export for direct usage? 
// Or should we register something? 
// ss-transition is not exactly a directive that runs on its own, it configures other directives (show/if).
// But maybe we register it as a no-op attribute so it doesn't get warned about if we had warnings?
// For now, just exporting the logic is enough for `show.js` to consume.
// To support `senangstart-actions-transition` bundle, we might need a dummy install?
export function install() {
    // No-op or register 'ss-transition' as a marker?
}
