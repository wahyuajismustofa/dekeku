import { includeElement} from "./dom/include.js";
import { updateCartBadge } from "./utils/cart.js";


document.addEventListener('DOMContentLoaded', async () => {
  await includeElement();
  updateCartBadge();
});