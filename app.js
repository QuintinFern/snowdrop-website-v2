document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('event-grid');

    if (typeof events !== 'undefined' && grid) {
        events.forEach(event => {
            // Create Card
            const card = document.createElement('div');
            card.className = 'event-card';

            // Create Image
            const img = document.createElement('img');
            img.src = event.image;
            img.alt = event.title;
            img.className = 'event-image';
            
            // Handle missing images
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/400x300?text=Event+Image'; 
            };

            // Create Info
            const info = document.createElement('div');
            info.className = 'event-info';
            
            const title = document.createElement('h3');
            title.textContent = event.title;

            const desc = document.createElement('p');
            desc.textContent = event.description;

            // Assemble
            info.appendChild(title);
            info.appendChild(desc);
            card.appendChild(img);
            card.appendChild(info);
            grid.appendChild(card);
        });
    }
});