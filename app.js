document.addEventListener('DOMContentLoaded', () => {

    // --- MOBILE MENU LOGIC ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Toggle Nav
            navLinks.classList.toggle('nav-active');
            
            // Hamburger Animation
            hamburger.classList.toggle('toggle');

            // Animate Links Fade In
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // ================= IMAGE COUNTERS =================
    const config = {
        mainEvents: 5,      
        directors: 3,       
        houstonHub: 5,      
        austinHub: 5        
    };

    function loadImages(containerId, count, prefix, isSlider = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = isSlider ? 'slide' : 'grid-item';

            const img = document.createElement('img');
            img.src = `images/${prefix}-${i}.jpg`; 
            img.alt = `${prefix.replace(/-/g, ' ')} ${i}`;
            
            img.onerror = function() { 
                if(isSlider) this.parentElement.style.display = 'none'; 
                else this.style.display = 'none';
            };

            wrapper.appendChild(img);
            if (prefix === 'director') {
                const name = document.createElement('h3');
                name.textContent = `Director ${i}`;
                wrapper.appendChild(name);
                wrapper.className = 'director-card';
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

// CSS Animation for Links (Injecting style here for simplicity)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes navLinkFade {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}
`;
document.head.appendChild(styleSheet);