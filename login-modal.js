/**
 * Login popup after secret phrase. Works on any page that loads components.js.
 */
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from './firebase-config.js';
import { isLoginNavVisible } from './auth-flags.js';

let initDone = false;

function injectModalCssOnce() {
    if (document.querySelector('link[data-snowdrop-login-modal]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('login-modal.css', import.meta.url).href;
    link.setAttribute('data-snowdrop-login-modal', '1');
    document.head.appendChild(link);
}

const OVERLAY_ID = 'snowdrop-login-overlay';

function ensureDom() {
    if (document.getElementById(OVERLAY_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'snowdrop-login-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'snowdrop-login-title');
    overlay.innerHTML = `
        <div class="snowdrop-login-dialog">
            <button type="button" class="snowdrop-login-close" aria-label="Close">&times;</button>
            <h2 id="snowdrop-login-title">Member login</h2>
            <p class="snowdrop-login-hint">Sign in to open the Member Hub.</p>
            <p class="snowdrop-login-err" id="snowdrop-login-err"></p>
            <input type="email" id="snowdrop-login-email" autocomplete="email" placeholder="Email" required>
            <input type="password" id="snowdrop-login-password" autocomplete="current-password" placeholder="Password" required>
            <button type="button" class="snowdrop-login-submit" id="snowdrop-login-submit">Log in</button>
            <button type="button" class="snowdrop-login-toggle" id="snowdrop-login-toggle">Don&apos;t have an account? Sign up</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.snowdrop-login-close');
    closeBtn.addEventListener('click', () => closeModal());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    const submitBtn = overlay.querySelector('#snowdrop-login-submit');
    const toggleBtn = overlay.querySelector('#snowdrop-login-toggle');
    const errEl = overlay.querySelector('#snowdrop-login-err');
    let isLogin = true;

    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        const title = overlay.querySelector('#snowdrop-login-title');
        if (isLogin) {
            title.textContent = 'Member login';
            submitBtn.textContent = 'Log in';
            toggleBtn.textContent = "Don't have an account? Sign up";
        } else {
            title.textContent = 'Create account';
            submitBtn.textContent = 'Sign up';
            toggleBtn.textContent = 'Already have an account? Log in';
        }
        errEl.classList.remove('is-visible');
        errEl.textContent = '';
    });

    submitBtn.addEventListener('click', async () => {
        const email = document.getElementById('snowdrop-login-email').value.trim();
        const password = document.getElementById('snowdrop-login-password').value;
        errEl.classList.remove('is-visible');
        errEl.textContent = '';
        if (!email || !password) {
            errEl.textContent = 'Email and password are required.';
            errEl.classList.add('is-visible');
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            sessionStorage.removeItem('snowdropPendingLoginModal');
            closeModal();
            const path = window.location.pathname || '';
            if (path.includes('blog.html')) {
                window.location.reload();
            } else {
                window.location.href = 'blog.html';
            }
        } catch (e) {
            errEl.textContent = e.message || 'Something went wrong.';
            errEl.classList.add('is-visible');
        }
    });
}

function openModal() {
    if (!isLoginNavVisible()) return;
    if (auth.currentUser) return;
    ensureDom();
    const overlay = document.getElementById(OVERLAY_ID);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const email = document.getElementById('snowdrop-login-email');
    if (email) setTimeout(() => email.focus(), 50);
}

function closeModal() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.classList.remove('is-open');
    }
    document.body.style.overflow = '';
}

function tryOpenModal() {
    if (!isLoginNavVisible()) {
        sessionStorage.removeItem('snowdropPendingLoginModal');
        return;
    }
    if (auth.currentUser) {
        sessionStorage.removeItem('snowdropPendingLoginModal');
        return;
    }
    sessionStorage.removeItem('snowdropPendingLoginModal');
    openModal();
}

export function initLoginModal() {
    if (initDone) return;
    initDone = true;

    injectModalCssOnce();
    ensureDom();

    window.addEventListener('snowdrop-login-unlocked', () => {
        tryOpenModal();
    });

    if (sessionStorage.getItem('snowdropPendingLoginModal') === '1') {
        queueMicrotask(() => tryOpenModal());
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const o = document.getElementById(OVERLAY_ID);
            if (o?.classList.contains('is-open')) {
                closeModal();
            }
        }
    });
}
