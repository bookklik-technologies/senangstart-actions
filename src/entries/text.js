import SenangStart from '../core/senangstart.js';
import { install } from '../directives/text.js';

install();

if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
