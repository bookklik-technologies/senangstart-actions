import SenangStart from '../core/senangstart.js';
import { install } from '../directives/id.js';

install();

if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
