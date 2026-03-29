/**
 * Global secret phrase listener (loads early via components.js import).
 * Uses capture + paste so typing ###… works in inputs and paste still unlocks.
 */
import { LOGIN_UNLOCK_PHRASE, unlockLoginNavFromSecret } from './auth-flags.js';

const PHRASE = LOGIN_UNLOCK_PHRASE;
const MAX_BUF = 72;
let buffer = '';

function checkUnlock() {
    if (buffer.includes(PHRASE) || buffer.endsWith(PHRASE)) {
        buffer = '';
        try {
            unlockLoginNavFromSecret();
        } catch {
            /* sessionStorage not available (rare) */
        }
        window.dispatchEvent(new CustomEvent('snowdrop-login-unlocked'));
        return true;
    }
    return false;
}

function feedText(str) {
    if (!str) return;
    for (let i = 0; i < str.length; i++) {
        buffer = (buffer + str[i]).slice(-MAX_BUF);
        if (checkUnlock()) break;
    }
}

function attach() {
    window.addEventListener(
        'keydown',
        (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.isComposing) return;
            if (e.key.length === 1) {
                feedText(e.key);
                return;
            }
            if ((e.code === 'Digit3' || e.code === 'Numpad3') && e.shiftKey) {
                feedText('#');
            }
        },
        true
    );

    window.addEventListener(
        'paste',
        (e) => {
            const text = e.clipboardData?.getData('text/plain') ?? '';
            if (text) feedText(text);
        },
        true
    );
}

attach();
