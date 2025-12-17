document.addEventListener('DOMContentLoaded', () => {

    // ================= CONFIGURATION =================
    // UPDATE THESE NUMBERS AS YOU ADD PHOTOS
    const config = {
        mainEvents: 5,      // event-photo-1.jpg ...
        directors: 3,       // director-1.jpg ...
        houstonHub: 5,      // houston-hub-event-1.jpg ...
        austinHub: 5        // austin-hub-event-1.jpg ...
    };
    // =================================================

    // Helper function to create image grids/sliders
    function loadImages(containerId, count, prefix, isSlider = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = isSlider ? 'slide' : 'grid-item';

            const img = document.createElement('img');
            img.src = `images/${prefix}-${i}.jpg`; 
            img.alt = `${prefix.replace(/-/g, ' ')} ${i}`;
            
            // Hide image if file not found
            img.onerror = function() { 
                if(isSlider) this.parentElement.style.display = 'none'; 
                else this.style.display = 'none';
            };

            wrapper.appendChild(img);
            
            // For Directors, we might add a name label
            if (prefix === 'director') {
                const name = document.createElement('h3');
                name.textContent = `Director ${i}`;
                wrapper.appendChild(name);
                wrapper.className = 'director-card'; // Special class for directors
            }

            container.appendChild(wrapper);
        }
    }

    // Load Main Events (Slider)
    loadImages('event-slider', config.mainEvents, 'event-photo', true);
    
    // Load Directors (Grid)
    loadImages('directors-grid', config.directors, 'director');

    // Load Houston Hub (Grid or Slider - using Slider logic for consistency)
    loadImages('houston-slider', config.houstonHub, 'houston-hub-event', true);

    // Load Austin Hub (Slider)
    loadImages('austin-slider', config.austinHub, 'austin-hub-event', true);


    // --- SLIDER FUNCTIONALITY (Universal) ---
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const nextBtn = slider.querySelector('.next-btn');
        const prevBtn = slider.querySelector('.prev-btn');
        
        if(!track) return;

        let currentIndex = 0;
        
        function updateSlide() {
            // Check actual number of visible slides
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
        
        // Auto scroll
        setInterval(() => {
            if(track.children.length > 0) {
                currentIndex = (currentIndex + 1) % track.children.length;
                updateSlide();
            }
        }, 5000);
    });
});