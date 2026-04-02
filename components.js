// components.js
import './secret-unlock.js';
import { initLoginModal } from './login-modal.js';
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';
import { isLoginNavVisible } from './auth-flags.js';

export function loadComponents() {
    const path = window.location.pathname;
    const isHome = path.includes("index.html") || path === "/" || path.endsWith("/");
    const isHope = path.includes("hope-events.html");
    const isAbout = path.includes("about-us.html");
    const isCareers = path.includes("careers.html");
    const isContact = path.includes("#contact");
    const isAustinHub = path.includes("austin-hub.html");
    const isHoustonHub = path.includes("houston-hub.html");
    const hubNavActive = isAustinHub || isHoustonHub;
    const isMemberHub = path.includes("blog.html");
    const loginNav = isLoginNavVisible();

    const navbarHTML = `
    <div class="container nav-container">
        <div class="logo">
            <img src="images/logo-primary.png" alt="Snowdrop United Logo">
            <span>Snowdrop United</span>
        </div>
        
        <div class="hamburger" id="mobile-menu-btn">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>

        <ul class="nav-links" id="nav-links">
            <li><a href="index.html" class="${isHome ? 'active' : ''}">Home</a></li>
            
            <li class="nav-dropdown ${isAbout || hubNavActive ? 'active' : ''}">
                <div class="nav-about-row">
                    <a href="about-us.html" class="nav-about-link ${isAbout ? 'active' : ''}">About Us</a>
                    <button type="button" class="nav-dropdown-toggle" id="hub-dropdown-btn" aria-label="Show Austin and Houston hubs" aria-expanded="false" aria-haspopup="true" aria-controls="hub-dropdown-menu">
                        <span class="dropdown-chevron" aria-hidden="true">▾</span>
                    </button>
                </div>
                <ul class="nav-dropdown-menu" id="hub-dropdown-menu" role="menu">
                    <li role="none"><a href="austin-hub.html" role="menuitem" class="${isAustinHub ? 'active' : ''}">Austin Hub</a></li>
                    <li role="none"><a href="houston-hub.html" role="menuitem" class="${isHoustonHub ? 'active' : ''}">Houston Hub</a></li>
                </ul>
            </li>
            
            <li><a href="hope-events.html" class="${isHope ? 'active' : ''}">Hope Events</a></li>
            
            <li id="nav-careers" style="display: none;">
                <a href="careers.html" class="${isCareers ? 'active' : ''}">Careers</a>
            </li>

            <li id="nav-member-hub" style="display: none;">
                <a href="blog.html" class="${isMemberHub ? 'active' : ''}">Member Hub</a>
            </li>

            <li><a href="#main-footer" class="${isContact ? 'active' : ''}">Contact</a></li>
            
            <li id="nav-auth-item" style="${loginNav ? '' : 'display: none;'}">
                ${loginNav ? `<a href="login.html" style="color: #2a80a6; font-weight: 600;">Login</a>` : ''}
            </li>
            
            <li><a href="https://square.link/u/DPaykecu" class="btn-nav">Donate</a></li>
        </ul>
    </div>
    `;

    const footerHTML = `
    <div class="container footer-content">
        <div class="footer-info">
            <h3>Snowdrop United</h3>
            <p>Spreading Hope</p>
            <p class="ein-text">Non-Profit EIN: <strong>883572911</strong></p>
            <div class="social-icons">
                <a href="https://www.facebook.com/snowdropunited" target="_blank" rel="noopener noreferrer" class="social-icon">
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook">
                </a>
                <a href="https://www.instagram.com/snowdropunited" target="_blank" rel="noopener noreferrer" class="social-icon">
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram">
                </a>
            </div>
        </div>
        <div class="footer-links">
            <a href="mailto:info@snowdropunited.org" class="btn btn-email">&#9993; info@snowdropunited.org</a>
            <a href="https://square.link/u/DPaykecu" class="btn btn-secondary">Donate Now</a>
        </div>
    </div>
    <div class="footer-bottom"><p>&copy; ${new Date().getFullYear()} Snowdrop United.</p></div>
    `;

    const navElement = document.getElementById('main-navbar');
    const footerElement = document.getElementById('main-footer');

    if (navElement) navElement.innerHTML = navbarHTML;
    if (footerElement) footerElement.innerHTML = footerHTML;

    initMobileMenu();
    initHubDropdown();
    handleAuthStatus();
    applyAuthNavState(auth.currentUser);
    initLoginModal();
}

function applyAuthNavState(user) {
    const careersLink = document.getElementById('nav-careers');
    const authItem = document.getElementById('nav-auth-item');
    const memberHubLink = document.getElementById('nav-member-hub');

    const showLogin = isLoginNavVisible();

    if (!showLogin) {
        if (careersLink) careersLink.style.display = 'none';
        if (memberHubLink) memberHubLink.style.display = 'none';
        if (authItem) {
            authItem.style.display = 'none';
            authItem.innerHTML = '';
        }
        return;
    }

    if (user) {
        if (careersLink) careersLink.style.display = 'block';
        if (memberHubLink) memberHubLink.style.display = '';
        if (authItem) {
            authItem.style.display = '';
            authItem.innerHTML = `<button id="btn-logout" type="button" style="background:none;border:none;color:#2a80a6;font-weight:600;font-family:inherit;font-size:1rem;cursor:pointer;">Logout</button>`;
            const btn = document.getElementById('btn-logout');
            if (btn) {
                btn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = 'index.html';
                    });
                });
            }
        }
    } else {
        if (careersLink) careersLink.style.display = 'none';
        if (memberHubLink) memberHubLink.style.display = 'none';
        if (authItem) {
            authItem.style.display = '';
            authItem.innerHTML = `<a href="login.html" style="color: #2a80a6; font-weight: 600;">Login</a>`;
        }
    }
}

window.addEventListener('snowdrop-login-unlocked', () => {
    applyAuthNavState(auth.currentUser);
});

function handleAuthStatus() {
    onAuthStateChanged(auth, applyAuthNavState);
}

function initMobileMenu() {
    const hamburger = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
            document.querySelectorAll('.nav-dropdown.open').forEach((el) => {
                el.classList.remove('open');
            });
            const hubBtn = document.getElementById('hub-dropdown-btn');
            if (hubBtn) hubBtn.setAttribute('aria-expanded', 'false');
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }
}

function initHubDropdown() {
    const dropdown = document.querySelector('.nav-dropdown');
    const toggle = document.getElementById('hub-dropdown-btn');
    if (!dropdown || !toggle) return;

    const mq = window.matchMedia('(max-width: 768px)');

    toggle.addEventListener('click', (e) => {
        if (!mq.matches) return;
        e.preventDefault();
        e.stopPropagation();
        const open = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
        if (!mq.matches || !dropdown.classList.contains('open')) return;
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    mq.addEventListener('change', () => {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    });
}
