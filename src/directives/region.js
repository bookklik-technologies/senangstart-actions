import { cleanupTree } from '../reactive.js';

export function createRegion(templateEl, label) {
    const parent = templateEl.parentNode;
    const start = document.createTextNode('');
    const anchor = document.createComment(label);
    parent.insertBefore(start, templateEl);
    parent.insertBefore(anchor, templateEl);
    templateEl.remove();

    const clear = () => {
        while (start.nextSibling && start.nextSibling !== anchor) {
            const node = start.nextSibling;
            cleanupTree(node);
            node.remove();
        }
    };
    anchor.__ssOnCleanup = [() => {
        clear();
        start.remove();
    }];
    return { parent, anchor, clear };
}
