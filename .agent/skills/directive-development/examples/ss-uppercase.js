/**
 * Example: ss-uppercase directive implementation
 * 
 * This shows how to create a simple attribute directive.
 * Add this to handlers/attributes.js in the attributeHandlers object.
 */

// In handlers/attributes.js:

'ss-uppercase': (el, expr, scope) => {
    const update = () => {
        const evaluator = createEvaluator(expr, scope, el);
        const value = evaluator();
        el.textContent = String(value ?? '').toUpperCase();
    };
    runEffect(update);
},

// Usage in HTML:
//
// <div ss-data="{ text: 'hello world' }">
//     <span ss-uppercase="text"></span>
//     <!-- Renders: HELLO WORLD -->
// </div>
