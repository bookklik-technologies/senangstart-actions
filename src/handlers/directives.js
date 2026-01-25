/**
 * SenangStart Actions - Directive Handlers
 * Handlers for ss-for and ss-if template directives
 * 
 * @module handlers/directives
 */

import { createEvaluator } from '../evaluator.js';
import { createReactive, runEffect } from '../reactive.js';

// Forward declaration - will be set by walker.js
let walkFn = null;

/**
 * Set the walk function reference (to avoid circular imports)
 */
export function setWalkFunction(fn) {
    walkFn = fn;
}

/**
 * Handle ss-for directive
 */
export function handleFor(templateEl, expr, scope) {
    // Parse expression: "item in items" or "(item, index) in items"
    const match = expr.match(/^\s*(?:\(([^,]+),\s*([^)]+)\)|([^\s]+))\s+in\s+(.+)$/);
    if (!match) {
        console.error('[SenangStart] Invalid ss-for expression:', expr);
        return;
    }
    
    const itemName = (match[1] || match[3]).trim();
    const indexName = (match[2] || 'index').trim();
    const arrayExpr = match[4];
    
    const parent = templateEl.parentNode;
    const anchor = document.createComment(`ss-for: ${expr}`);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();
    
    let currentNodes = [];
    let lastItemsJSON = '';
    
    const update = () => {
        const evaluator = createEvaluator(arrayExpr, scope, templateEl);
        const items = evaluator() || [];
        
        // Check if items actually changed (shallow comparison)
        const itemsJSON = JSON.stringify(items);
        if (itemsJSON === lastItemsJSON) {
            return; // No change, skip re-render
        }
        lastItemsJSON = itemsJSON;
        
        // Remove old nodes
        currentNodes.forEach(node => node.remove());
        currentNodes = [];
        
        // Create new nodes
        items.forEach((item, index) => {
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            // Create child scope with item and index - use parent scope's data for non-item properties
            const itemScope = {
                data: createReactive({ 
                    ...scope.data, 
                    [itemName]: item, 
                    [indexName]: index 
                }, () => {}),
                $refs: scope.$refs,
                $store: scope.$store,
                parentData: scope.data // Keep reference to parent data
            };
            
            nodes.forEach(node => {
                parent.insertBefore(node, anchor);
                currentNodes.push(node);
                node.__ssScope = itemScope;
                if (walkFn) walkFn(node, itemScope);
            });
        });
    };
    
    runEffect(update);
}

/**
 * Handle ss-if directive
 */
export function handleIf(templateEl, expr, scope) {
    const parent = templateEl.parentNode;
    const anchor = document.createComment(`ss-if: ${expr}`);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();
    
    let currentNodes = [];
    
    const update = () => {
        const evaluator = createEvaluator(expr, scope, templateEl);
        const condition = !!evaluator();
        
        // Remove old nodes
        currentNodes.forEach(node => node.remove());
        currentNodes = [];
        
        if (condition) {
            const clone = templateEl.content.cloneNode(true);
            const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
            
            nodes.forEach(node => {
                parent.insertBefore(node, anchor);
                currentNodes.push(node);
                if (walkFn) walkFn(node, scope);
            });
        }
    };
    
    runEffect(update);
}

/**
 * Handle ss-teleport directive
 */
export function handleTeleport(templateEl, expr, scope) {
    const targetSelector = expr;
    let target = document.querySelector(targetSelector);
    
    // Create anchor in original location
    const anchor = document.createComment(`ss-teleport: ${targetSelector}`);
    templateEl.parentNode.insertBefore(anchor, templateEl);
    templateEl.remove();
    
    // If target doesn't exist yet, we could use MutationObserver on body to wait for it.
    // For now, mirroring Alpine's behavior: if it doesn't exist, it warns and does nothing? 
    // Or maybe we should retry. Let's start with immediate check.
    if (!target) {
        console.warn(`[SenangStart] ss-teleport target not found: ${targetSelector}`);
        return;
    }
    
    // Clone content
    const clone = templateEl.content.cloneNode(true);
    const nodes = Array.from(clone.childNodes).filter(n => n.nodeType === 1);
    
    // Append to target
    nodes.forEach(node => {
        target.appendChild(node);
        if (walkFn) walkFn(node, scope);
    });
    
    // Cleanup when original scope/component is destroyed?
    // Currently SenangStart doesn't have a clear "destroy" signal for the root unless removed.
    // We'll rely on the nodes being in the DOM.
}
