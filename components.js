const isDonate = path.includes("donate.html");

    // --- NAVBAR HTML ---
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
            <li><a href="hope-events.html" class="${isHope ? 'active' : ''}">Hope Events</a></li>
            <li><a href="about-us.html" class="${isAbout ? 'active' : ''}">About Us</a></li>
            
            <li class="dropdown">
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