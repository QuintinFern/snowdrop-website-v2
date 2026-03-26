import { auth, onAuthStateChanged, signOut } from './firebase-config.js';

export function loadComponents() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const isHome = path === 'index.html' || path === '';
    const isHope = path === 'hope-events.html';
    const isAbout = path === 'about-us.html';
    const isDonate = path === 'donate.html';
    const isCareers = path === 'careers.html';

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
        </ul>
    </div>
    `;

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
    const hamburger = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

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
    onAuthStateChanged(auth, (user) => {
        const careersLink = document.getElementById('nav-careers');
        const authItem = document.getElementById('nav-auth-item');

        if (user) {
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
            }
        }
    });
}