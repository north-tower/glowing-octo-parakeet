/* NakuruHub auth gate — add to every page of the site:  <script src="/nakuruhub-auth-gate.js"></script>
   Browsing is open to everyone. Login is only asked when someone COMMITS to something. */

const NH_LOGIN_URL = "/login"; // where you place nakuruhub-login.html

function nhUser() {
  try {
    return JSON.parse(localStorage.getItem("nh_user") || sessionStorage.getItem("nh_user") || "null");
  } catch { return null; }
}

function nhLogout() {
  localStorage.removeItem("nh_user");
  sessionStorage.removeItem("nh_user");
  location.reload();
}

/* Wrap any action that needs an account.
   If logged in -> runs it. If a guest -> sends to login, then returns to this same page. */
function requireLogin(action) {
  if (nhUser()) return action();
  const back = location.pathname + location.search;
  location.href = NH_LOGIN_URL + "?next=" + encodeURIComponent(back);
}

/* ---- Examples: guests can browse, but these need login ---- */
// document.querySelector("#placeOrder").onclick = () => requireLogin(() => placeOrder());
// document.querySelector("#saveItem").onclick   = () => requireLogin(() => saveItem(id));
// document.querySelector("#listItem").onclick   = () => requireLogin(() => openListingForm());
// document.querySelector("#contactSeller").onclick = () => requireLogin(() => showSellerPhone());
