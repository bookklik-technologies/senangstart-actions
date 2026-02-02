import SenangStart from '../core/senangstart.js';
import { install } from '../directives/show.js';
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

export default SenangStart;
