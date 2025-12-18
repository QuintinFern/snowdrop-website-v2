document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE MENU LOGIC ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // ================= IMAGE COUNTERS & TITLES =================
    const config = {
        mainEvents: 5,      
        directors: 6,   // Updated to 6
        houstonHub: 5,      
        austinHub: 5        
    };

    // Specific titles for the directors
    const directorTitles = [
        "President",
        "Vice President",
        "Treasurer",
        "Secretary",
        "Director",
        "Director"
    ];

    function loadImages(containerId, count, prefix, isSlider = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = isSlider ? 'slide' : 'director-card'; // Default class

            const img = document.createElement('img');
            img.src = `images/${prefix}-${i}.jpg`; 
            img.alt = `${prefix.replace(/-/g, ' ')} ${i}`;
            
            // Error handling: Hide if image missing
            img.onerror = function() { 
                if(isSlider) this.parentElement.style.display = 'none'; 
                else this.src = 'images/logo-primary.png'; // Fallback for directors if photo missing
            };

            wrapper.appendChild(img);

            // Special Logic for Directors
            if (prefix === 'director') {
                // 1. Add Name Placeholder
                const name = document.createElement('h3');
                name.textContent = "Board Member"; // You can change this to real names later
                
                // 2. Add Title (from the list above)
                const title = document.createElement('p');
                title.textContent = directorTitles[i-1]; 
                title.style.color = "#2a80a6";
                title.style.fontWeight = "bold";

                wrapper.appendChild(name);
                wrapper.appendChild(title);
            } else {
                // For regular grids (if you add any later)
                if(!isSlider) wrapper.className = 'grid-item';
            }

            container.appendChild(wrapper);
        }
    }

    loadImages('event-slider', config.mainEvents, 'event-photo', true);
    loadImages('directors-grid', config.directors, 'director');
    loadImages('houston-slider', config.houstonHub, 'houston-hub-event', true);
    loadImages('austin-slider', config.austinHub, 'austin-hub-event', true);


    // --- SLIDER LOGIC ---
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const nextBtn = slider.querySelector('.next-btn');
        const prevBtn = slider.querySelector('.prev-btn');
        
        if(!track) return;

        let currentIndex = 0;
        
        function updateSlide() {
            const visibleSlides = track.children.length;
            if (visibleSlides === 0) return;
            const percentage = -(currentIndex * 100); 
            track.style.transform = `translateX(${percentage}%)`;
        }

        if(nextBtn) {
            nextBtn.addEventListener('click', () => {
                const total = track.children.length;
                currentIndex = (currentIndex + 1) % total;
                updateSlide();
            });
        }

        if(prevBtn) {
            prevBtn.addEventListener('click', () => {
                const total = track.children.length;
                currentIndex = (currentIndex - 1 + total) % total;
                updateSlide();
            });
        }
        
        setInterval(() => {
            if(track.children.length > 0) {
                currentIndex = (currentIndex + 1) % track.children.length;
                updateSlide();
            }
        }, 5000);
    });
});