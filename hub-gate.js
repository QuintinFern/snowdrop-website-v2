/**
 * Temporary gate for austin-hub.html and houston-hub.html.
 *
 * Their content is out of date, so the pages are unlinked from the navbar,
 * marked noindex, and closed to the public. A signed-in member can still open
 * them directly to review/update the copy before they go public again.
 *
 * TO REPUBLISH:
 *   1. Set HUB_PAGES_PUBLIC = true below.
 *   2. Restore the About Us submenu markup in components.js.
 *   3. Remove the <meta name="robots" content="noindex, nofollow"> tags and the
 *      gate <script> blocks from both hub pages, and drop them from robots.txt.
 *
 * NOTE: this is a static site, so the gate runs in the browser. It keeps the
 * pages out of search results and out of the hands of ordinary visitors, but
 * the raw HTML is still served by the host — do not put anything confidential
 * on these pages.
 */
import { auth, onAuthStateChanged } from './firebase-config.js';

export const HUB_PAGES_PUBLIC = false;

const REDIRECT_TO = 'index.html';
const GATE_CLASS = 'is-gated';

function reveal(showBanner) {
    document.documentElement.classList.remove(GATE_CLASS);
    if (!showBanner || document.querySelector('.gated-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'gated-banner';
    banner.setAttribute('role', 'status');
    banner.textContent =
        'Preview only — this page is out of date and is not published on the public site.';
    document.body.prepend(banner);
}

function block() {
    // replace() so the gated URL does not land in the back-button history.
    window.location.replace(REDIRECT_TO);
}

if (HUB_PAGES_PUBLIC) {
    reveal(false);
} else {
    onAuthStateChanged(auth, (user) => {
        if (user) reveal(true);
        else block();
    });
}
