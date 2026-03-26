<<<<<<< HEAD
<<<<<<< HEAD
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

export function loadComponents() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const isHome = path === 'index.html' || path === '';
    const isHope = path === 'hope-events.html';
    const isAbout = path === 'about-us.html';
    const isDonate = path === 'donate.html';
    const isCareers = path === 'careers.html';
=======
=======
>>>>>>> parent of a39c51c (3262026 Update)
// components.js
import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

export function loadComponents() {
    const path = window.location.pathname;
    const isHome = path.includes("index.html") || path === "/" || path.endsWith("/");
    const isHope = path.includes("hope-events.html");
    const isAbout = path.includes("about-us.html");
    const isCareers = path.includes("careers.html");
    const isContact = path.includes("#contact");
<<<<<<< HEAD
>>>>>>> parent of a39c51c (3262026 Update)
=======
>>>>>>> parent of a39c51c (3262026 Update)

    const navbarHTML = `
    <div class="container nav-container">
        <div class="logo">
            <img src="images/logo-primary.png" alt="Snowdrop United Logo" style="height: 40px; margin-right: 10px;">
            <span>Snowdrop United</span>
        </div>
        
        <div class="hamburger" id="mobile-menu-btn">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>

        <ul class="nav-links" id="nav-links">
            <li><a href="index.html" class="${isHome ? 'active' : ''}">Home</a></li>
            <li><a href="hope-events.html" class="${isHope ? 'active' : ''}">Hope Events</a></li>
            <li><a href="about-us.html" class="${isAbout ? 'active' : ''}">About Us</a></li>
            
<<<<<<< HEAD
<<<<<<< HEAD
            <li class="dropdown" id="hubs-dropdown">
                <a href="#" class="dropbtn">Our Hubs ▾</a>
                <div class="dropdown-content">
                    <a href="houston-hub.html">Houston Hub</a>
                    <a href="austin-hub.html">Austin Hub</a>
                </div>
            </li>

            <li><a href="donate.html" class="${isDonate ? 'active' : ''}">Donate</a></li>
            <li id="nav-careers" style="display: none;"><a href="careers.html" class="${isCareers ? 'active' : ''}">Careers</a></li>
            <li id="nav-auth-item"><a href="login.html">Login</a></li>
=======
            <li id="nav-careers" style="display: none;">
                <a href="careers.html" class="${isCareers ? 'active' : ''}">Careers</a>
            </li>

=======
            <li id="nav-careers" style="display: none;">
                <a href="careers.html" class="${isCareers ? 'active' : ''}">Careers</a>
            </li>

>>>>>>> parent of a39c51c (3262026 Update)
            <li><a href="#main-footer" class="${isContact ? 'active' : ''}">Contact</a></li>
            
            <li id="nav-auth-item">
                <a href="login.html" style="color: #2a80a6; font-weight: 600;">Login</a>
            </li>
            
            <li><a href="https://square.link/u/DPaykecu" class="btn-nav">Donate</a></li>
<<<<<<< HEAD
>>>>>>> parent of a39c51c (3262026 Update)
=======
>>>>>>> parent of a39c51c (3262026 Update)
        </ul>
    </div>
    `;

<<<<<<< HEAD
<<<<<<< HEAD
    const footerHTML = `
    <div class="container">
        <p>&copy; ${new Date().getFullYear()} Snowdrop United. All Rights Reserved.</p>
        <div class="social-links" style="margin-top: 10px;">
            <a href="#" style="color: white; margin: 0 10px;">Instagram</a>
            <a href="#" style="color: white; margin: 0 10px;">Facebook</a>
        </div>
    </div>
    `;

    const navElement = document.getElementById('main-navbar');
    if (navElement) navElement.innerHTML = navbarHTML;

    const footerElement = document.getElementById('main-footer');
    if (footerElement) footerElement.innerHTML = footerHTML;

    // --- MOBILE MENU LOGIC ---
=======
=======
>>>>>>> parent of a39c51c (3262026 Update)
    // --- FOOTER HTML ---
    const footerHTML = `
    <div class="container footer-content">
        <div class="footer-info">
            <h3>Snowdrop United</h3>
            <p>Spreading Hope</p>
            <p class="ein-text">Non-Profit EIN: <strong>883572911</strong></p>
 <div class="social-icons">
    <a href="https://www.facebook.com/snowdropunited" target="_blank" class="social-icon">
        <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook">
    </a>
    <a href="https://www.instagram.com/snowdropunited" target="_blank" class="social-icon">
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

    // Inject into HTML
    const navElement = document.getElementById('main-navbar');
    const footerElement = document.getElementById('main-footer');

    if (navElement) navElement.innerHTML = navbarHTML;
    if (footerElement) footerElement.innerHTML = footerHTML;

    // Re-initialize Mobile Menu Logic
    initMobileMenu();

    // === NEW: AUTHENTICATION CHECK ===
    handleAuthStatus();
}

function initMobileMenu() {
<<<<<<< HEAD
>>>>>>> parent of a39c51c (3262026 Update)
=======
>>>>>>> parent of a39c51c (3262026 Update)
    const hamburger = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }
<<<<<<< HEAD
<<<<<<< HEAD

    // --- MOBILE DROPDOWN FIX ---
    const dropbtn = document.querySelector('.dropbtn');
    if (dropbtn && window.innerWidth <= 768) {
        dropbtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownContent = document.querySelector('.dropdown-content');
            dropdownContent.classList.toggle('show-mobile-dropdown');
        });
    }

    // --- AUTH STATUS ---
=======
}

function handleAuthStatus() {
>>>>>>> parent of a39c51c (3262026 Update)
=======
}

function handleAuthStatus() {
>>>>>>> parent of a39c51c (3262026 Update)
    onAuthStateChanged(auth, (user) => {
        const careersLink = document.getElementById('nav-careers');
        const authItem = document.getElementById('nav-auth-item');

        if (user) {
<<<<<<< HEAD
<<<<<<< HEAD
            if (careersLink) careersLink.style.display = 'block';
            if (authItem) {
                authItem.innerHTML = `<button id="btn-logout" style="background:none; border:none; color: var(--primary-color); font-weight:600; font-family:inherit; font-size:1rem; cursor:pointer;">Logout</button>`;
                document.getElementById('btn-logout').addEventListener('click', () => {
                    signOut(auth).then(() => window.location.href = "index.html");
                });
            }
        } else {
            if (careersLink) careersLink.style.display = 'none';
            if (authItem) {
                authItem.innerHTML = `<a href="login.html">Login</a>`;
=======
=======
>>>>>>> parent of a39c51c (3262026 Update)
            // --- USER IS LOGGED IN ---
            
            // 1. Show Careers Link
            if (careersLink) careersLink.style.display = 'block';

            // 2. Change "Login" to "Logout"
            if (authItem) {
                authItem.innerHTML = `<button id="btn-logout" style="background:none; border:none; color: #2a80a6; font-weight:600; font-family:inherit; font-size:1rem; cursor:pointer;">Logout</button>`;
                
                // Add Logout Click Event
                document.getElementById('btn-logout').addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = "index.html";
                    });
                });
            }

        } else {
            // --- USER IS LOGGED OUT ---
            
            // 1. Hide Careers Link
            if (careersLink) careersLink.style.display = 'none';

            // 2. Ensure "Login" is shown
            if (authItem) {
                authItem.innerHTML = `<a href="login.html" style="color: #2a80a6; font-weight: 600;">Login</a>`;
<<<<<<< HEAD
>>>>>>> parent of a39c51c (3262026 Update)
=======
>>>>>>> parent of a39c51c (3262026 Update)
            }
        }
    });
}