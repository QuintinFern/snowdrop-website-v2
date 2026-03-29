/**
 * Detect secret phrase via typing or paste (Ctrl+V). Capture phase on window + document.
 */
import { LOGIN_UNLOCK_PHRASE, unlockLoginNavFromSecret } from './auth-flags.js';

const PHRASE = LOGIN_UNLOCK_PHRASE;
const MAX_BUF = 96;
let buffer = '';

function checkUnlock() {
    const flat = buffer.replace(/\r\n/g, '\n');
    if (flat.includes(PHRASE) || buffer.includes(PHRASE)) {
        buffer = '';
        try {
            unlockLoginNavFromSecret();
            sessionStorage.setItem('snowdropPendingLoginModal', '1');
        } catch {
            /* sessionStorage blocked */
        }
        window.dispatchEvent(new CustomEvent('snowdrop-login-unlocked'));
        return true;
    }
    return false;
}

function feedText(str) {
    if (str == null || str === '') return;
    const t = String(str);
    for (let i = 0; i < t.length; i++) {
        buffer = (buffer + t[i]).slice(-MAX_BUF);
        if (checkUnlock()) break;
    }
}

function onPaste(e) {
    const cd = e.clipboardData;
    if (!cd) return;
    const text =
        cd.getData('text/plain') ||
        cd.getData('text/unicode') ||
        cd.getData('Text') ||
        '';
    if (text) feedText(text);
}

function attach() {
    const opts = true;

    window.addEventListener(
        'keydown',
        (e) => {
            if (e.isComposing) return;
            if (e.metaKey || e.altKey) return;
            if (e.ctrlKey || e.metaKey) {
                return;
            }
            if (e.key.length === 1) {
                feedText(e.key);
                return;
            }
            if ((e.code === 'Digit3' || e.code === 'Numpad3') && e.shiftKey) {
                feedText('#');
            }
        },
        opts
    );

    window.addEventListener('paste', onPaste, opts);
    document.addEventListener('paste', onPaste, opts);

    document.addEventListener(
        'beforeinput',
        (e) => {
            if (e.inputType === 'insertFromPaste' && e.data) {
                feedText(e.data);
            }
        },
        opts
    );
}

attach();
