document.addEventListener('DOMContentLoaded', () => {

    // ================= CONFIGURATION =================
    // CHANGE THESE NUMBERS when you add new files!
    const numberOfEventPhotos = 5;  // Do you have event-photo-5.jpg? Set this to 5.
    const numberOfDirectors = 3;    // Do you have director-3.jpg? Set this to 3.
    // =================================================


    // --- 1. HANDLE EVENT SLIDER ---
    const sliderTrack = document.getElementById('event-slider');
    
    if (sliderTrack) {
        // Generate images automatically based on the number above
        for (let i = 1; i <= numberOfEventPhotos; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';
            
            const img = document.createElement('img');
            img.src = `images/event-photo-${i}.jpg`; // Looks for event-photo-1.jpg, etc.
            img.alt = `Event Photo ${i}`;
            
            // Error handling: if image doesn't exist, hide it
            img.onerror = function() { this.parentElement.style.display = 'none'; };

            slide.appendChild(img);
            sliderTrack.appendChild(slide);
        }

        // Slider Functionality
        let currentIndex = 0;
        const slides = document.getElementsByClassName('slide');
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');

        function updateSlider() {
            // Move the track to show the current slide
            // Note: This is a simple logic assuming 1 slide visible at a time
            // For responsive multi-slide, we use percentages
            const percentage = -(currentIndex * 100); 
            sliderTrack.style.transform = `translateX(${percentage}%)`;
        }

        if(nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                // If we are at the end, loop back to start
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider();
            });

            prevBtn.addEventListener('click', () => {
                // If we are at start, loop to end
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider();
            });
        }
        
        // Auto-scroll every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        }, 5000);
    }


    // --- 2. HANDLE DIRECTORS GRID ---
    const directorsGrid = document.getElementById('directors-grid');

    if (directorsGrid) {
        for (let i = 1; i <= numberOfDirectors; i++) {
            const card = document.createElement('div');
            card.className = 'director-card';

            const img = document.createElement('img');
            img.src = `images/director-${i}.jpg`; // Looks for director-1.jpg
            img.alt = `Director ${i}`;
            img.onerror = function() { this.style.display = 'none'; };

            const name = document.createElement('h3');
            name.textContent = `Director ${i}`; // You can't guess names from files, so default placeholder

            card.appendChild(img);
            card.appendChild(name);
            directorsGrid.appendChild(card);
        }
    }
});