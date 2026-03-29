document.addEventListener('DOMContentLoaded', () => {

    // Note: Mobile menu logic is now handled in components.js

    // ================= IMAGE COUNTERS & CONFIGURATION =================
    const config = {
        mainEvents: 5,      
        directors: 6,       
        houstonHub: 7,      
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

	//Specific titles for Houston Hub
const houstonHubTitles = [
    "President",
    "Vice President",
    "Secretary",
    "Community Outreach Director",
    "Health and Safety Director",
    "Marketing Director",
    "Fundraising Director"
];

// Names for Board of Directors
const directorNames = [
    "Alexis Prevette", // President
    "Kishen Misra",    // Vice President
    "Quintin Fernandez",  // Treasurer
    "James L",  // Secretary
    "Kevin Phan", // Replace with actual
    "Adam Vivas"  // Replace with actual
];

// Names for Houston Hub
const houstonHubNames = [
    "Jay Mital",       // President
    "Awais Jaffer",      // Vice President
    "Rushil Vyas",  // Secretary
    "Zhijun Gong", // Community Outreach Director
    "Mason Nguyen",    // Health and Safety Director
    "Daphne Seraphim",          // Marketing Director
    "Joseph Le"         // Fundraising Director
];


    // ================= IMAGE LOADER FUNCTION =================
    function loadImages(containerId, count, prefix, isSlider = false, namesArray = [], titlesArray = []) {
        const container = document.getElementById(containerId);
        if (!container) return; // Exit if element doesn't exist

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = isSlider ? 'slide' : 'director-card';

            const img = document.createElement('img');
            img.src = `images/${prefix}-${i}.jpg`;
            img.alt = `${prefix.replace(/-/g, ' ')} ${i}`;

            // Fallback if image is missing
            img.onerror = function() {
                if (isSlider) this.parentElement.style.display = 'none';
                else this.src = 'images/logo-primary.png';
            };

            wrapper.appendChild(img);

            // Add name and title for directors/Houston Hub
            if (prefix === 'director' || prefix === 'houston-hub') {
                const name = document.createElement('h3');
                name.textContent = namesArray[i - 1] || "Member";

                const title = document.createElement('p');
                title.textContent = titlesArray[i - 1] || "Member";
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
    loadImages('directors-grid', config.directors, 'director', false, directorNames, directorTitles);
    loadImages('houston-hub-grid', config.houstonHub, 'houston-hub', false, houstonHubNames, houstonHubTitles);
    loadImages('houston-slider', config.houstonHub, 'houston-hub-event', true);
    loadImages('austin-slider', config.austinHub, 'austin-hub-event', true);

    // NEW: Load images for the new header backgrounds
    // This uses your existing collage images (collage-about-us-1.jpg, etc.)
    loadImages('about-header-slider', config.aboutHeader, 'collage-about-us', true);
    loadImages('hope-header-slider', config.hopeHeader, 'collage-hope-events', true);


 // ================= SMOOTH INFINITE SLIDER LOGIC =================
const sliders = document.querySelectorAll('.slider-container');

sliders.forEach(slider => {
    const track = slider.querySelector('.slider-track');
    const nextBtn = slider.querySelector('.next-btn');
    const prevBtn = slider.querySelector('.prev-btn');

    if (!track || track.children.length === 0) return;

    let slides = Array.from(track.children);
    let currentIndex = 0;

    // Clone first slide and append it
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    slides = Array.from(track.children);

    function updateSlide() {
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
        currentIndex++;
        updateSlide();
    }

    function prevSlide() {
        if (currentIndex === 0) return;
        currentIndex--;
        updateSlide();
    }

    // When transition ends, reset if we're on clone
    track.addEventListener('transitionend', () => {
        if (currentIndex === slides.length - 1) {
            track.style.transition = "none";
            currentIndex = 0;
            track.style.transform = `translateX(0%)`;
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play
    setInterval(() => {
        nextSlide();
    }, 5000);
});
});