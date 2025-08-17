import { includeElement} from "./dom/include.js";
import { updateCartBadge } from "./utils/cart.js";
import { dekekuFunction as _dF } from "./dekeku.js";


document.addEventListener('DOMContentLoaded', async () => {
  await includeElement();
  updateCartBadge();
  _dF.initDekeku();
});