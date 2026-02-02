import { registerAttribute } from '../core/registry.js';
import { createExecutor } from '../evaluator.js';

export function install() {
    registerAttribute('ss-on', (el, attrName, expr, scope) => {
        const parts = attrName.replace('ss-on:', '').split('.');
        const eventName = parts[0];
        const modifiers = parts.slice(1);
        
        const executor = createExecutor(expr, scope, el);
        
        const handler = (event) => {
            if (modifiers.includes('prevent')) event.preventDefault();
            if (modifiers.includes('stop')) event.stopPropagation();
            if (modifiers.includes('self') && event.target !== el) return;
            if (modifiers.includes('once')) {
                el.removeEventListener(eventName, handler);
            }
            
            if (event instanceof KeyboardEvent) {
                const key = event.key.toLowerCase();
                const keyModifiers = ['enter', 'escape', 'tab', 'space', 'up', 'down', 'left', 'right'];
                const hasKeyModifier = modifiers.some(m => keyModifiers.includes(m));
                
                if (hasKeyModifier) {
                    const keyMap = {
                        'enter': 'enter',
                        'escape': 'escape',
                        'tab': 'tab',
                        'space': ' ',
                        'up': 'arrowup',
                        'down': 'arrowdown',
                        'left': 'arrowleft',
                        'right': 'arrowright'
                    };
                    
                    const shouldFire = modifiers.some(m => keyMap[m] === key);
                    if (!shouldFire) return;
                }
            }
            
            scope.data.$event = event;
            executor();
            delete scope.data.$event;
        };
        
        if (modifiers.includes('window')) {
            window.addEventListener(eventName, handler);
        } else if (modifiers.includes('document')) {
            document.addEventListener(eventName, handler);
        } else {
            el.addEventListener(eventName, handler);
        }
    });
}
