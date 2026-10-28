import { handleFor as renderFor } from '../directives/for.js';
import { handleIf as renderIf } from '../directives/if.js';
import { handleTeleport as renderTeleport } from '../directives/teleport.js';

let walkFn = null;

export function setWalkFunction(walk) {
    walkFn = walk;
}

export function handleFor(templateEl, expr, scope) {
    return renderFor(templateEl, expr, scope, walkFn);
}

export function handleIf(templateEl, expr, scope) {
    return renderIf(templateEl, expr, scope, walkFn);
}

export function handleTeleport(templateEl, expr, scope) {
    return renderTeleport(templateEl, expr, scope, walkFn);
}
