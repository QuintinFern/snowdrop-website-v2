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
            
            <!--
                About Us is a single link for now. The Austin/Houston hub submenu was
                removed along with public access to those pages (see hub-gate.js);
                restore the .nav-dropdown markup here when the hub pages are updated.
            -->
            <li><a href="about-us.html" class="${isAbout ? 'active' : ''}">About Us</a></li>

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
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }
}
