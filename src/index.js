/**
 * SenangStart Actions v0.1.0
 * Declarative UI framework for humans and AI agents
 * 
 * @license MIT
 * @author Bookklik
 * @module senangstart-actions
 */

import SenangStart from './core/senangstart.js';

// Import and install all directives
import { install as installText } from './directives/text.js';
import { install as installHtml } from './directives/html.js';
import { install as installShow } from './directives/show.js';
import { install as installModel } from './directives/model.js';
import { install as installRef } from './directives/ref.js';
import { install as installInit } from './directives/init.js';
import { install as installEffect } from './directives/effect.js';
import { install as installData } from './directives/data.js';
import { install as installId } from './directives/id.js';
import { install as installFor } from './directives/for.js';
import { install as installIf } from './directives/if.js';
import { install as installTeleport } from './directives/teleport.js';
import { install as installBind } from './directives/bind.js';
import { install as installOn } from './directives/on.js';
import { install as installCloak } from './directives/cloak.js';
import { install as installTransition } from './directives/transition.js';

// Install all
installText();
installHtml();
installShow();
installModel();
installRef();
installInit();
installEffect();
installData();
installId();
installFor();
installIf();
installTeleport();
installBind();
installOn();
installCloak();
installTransition();

// Auto-start
if (typeof window !== 'undefined') {
    window.SenangStart = SenangStart;
}
SenangStart.start();

export default SenangStart;
