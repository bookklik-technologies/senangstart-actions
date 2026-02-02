import SenangStart from '../core/senangstart.js';
import { install } from '../directives/model.js';

install();

if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
