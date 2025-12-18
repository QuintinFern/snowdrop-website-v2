document.addEventListener('DOMContentLoaded', () => {

    // Note: Mobile menu logic is now handled in components.js

    // ================= IMAGE COUNTERS & CONFIGURATION =================
    const config = {
        mainEvents: 5,      
        directors: 6,       
        houstonHub: 5,      
        austinHub: 5,
        // NEW: Config for the header background sliders
        // This assumes you have images named 'collage-about-us-1.jpg' through '4.jpg'
        aboutHeader: 4,     
        hopeHeader: 4       
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

    // ================= IMAGE LOADER FUNCTION =================
    function loadImages(containerId, count, prefix, isSlider = false) {
        const container = document.getElementById(containerId);
        if (!container) return; // Exit if element doesn't exist on this page

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            // If it's a slider, use 'slide' class. If it's grid, use 'director-card' or 'grid-item'
            wrapper.className = isSlider ? 'slide' : 'director-card'; 

            const img = document.createElement('img');
            img.src = `images/${prefix}-${i}.jpg`; 
            img.alt = `${prefix.replace(/-/g, ' ')} ${i}`;
            
            // Error handling: Hide if image missing
            img.onerror = function() { 
                if(isSlider) this.parentElement.style.display = 'none'; 
                else this.src = 'images/logo-primary.png'; // Fallback for directors
            };

            wrapper.appendChild(img);

            // Special Logic for Directors
            if (prefix === 'director') {
                const name = document.createElement('h3');
                name.textContent = "Board Member"; 
                
                const title = document.createElement('p');
                title.textContent = directorTitles[i-1] || "Member"; 
                title.style.color = "#2a80a6";
                title.style.fontWeight = "bold";

                wrapper.appendChild(name);
                wrapper.appendChild(title);
            } 

            container.appendChild(wrapper);
        }
    }

    // ================= INITIALIZE SECTIONS =================
    // Load existing sections
    loadImages('event-slider', config.mainEvents, 'event-photo', true);
    loadImages('directors-grid', config.directors, 'director');
    loadImages('houston-slider', config.houstonHub, 'houston-hub-event', true);
    loadImages('austin-slider', config.austinHub, 'austin-hub-event', true);

    // NEW: Load images for the new header backgrounds
    // This uses your existing collage images (collage-about-us-1.jpg, etc.)
    loadImages('about-header-slider', config.aboutHeader, 'collage-about-us', true);
    loadImages('hope-header-slider', config.hopeHeader, 'collage-hope-events', true);


    // ================= SLIDER LOGIC =================
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const nextBtn = slider.querySelector('.next-btn');
        const prevBtn = slider.querySelector('.prev-btn');
        
        if(!track) return;

        let currentIndex = 0;
        
        function updateSlide() {
            const visibleSlides = track.children.length; // Count actual loaded slides
            if (visibleSlides === 0) return;
            
            const percentage = -(currentIndex * 100); 
            track.style.transform = `translateX(${percentage}%)`;
        }

        // Manual Buttons (if they exist)
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
        
        // Auto-Play
        setInterval(() => {
            if(track.children.length > 0) {
                currentIndex = (currentIndex + 1) % track.children.length;
                updateSlide();
            }
        }, 5000); // Change slide every 5 seconds
    });
});