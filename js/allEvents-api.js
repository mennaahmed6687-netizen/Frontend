(function () {
    'use strict';

    const container = document.getElementById('eventsContainer');
    if (!container || !window.MustAPI) return;

    const BASE_URL =
      "https://mystudentactivity.runasp.net";
    const EVENT_PLACEHOLDER =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">' +
            '<rect width="1200" height="800" fill="#eef2f7"/>' +
            '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="42">No event image</text>' +
            '</svg>'
        );

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    window._apiEvents = [];

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getEventImage(imagePath) {
        if (!imagePath) return EVENT_PLACEHOLDER;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/')) return BASE_URL + imagePath;
        return BASE_URL + '/uploads/events/' + imagePath;
    }

    function renderEvents() {
        MustAPI.getEvents()
            .then(function (data) {
                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = '<div style="text-align:center;padding:30px;">No events</div>';
                    return;
                }

                window._apiEvents = data;
                container.innerHTML = '';

                const fragment = document.createDocumentFragment();

                data.forEach(function (event, index) {

                    console.log("IMAGE:", event.imageUrl, event.image);
                    
                    const date = event.eventDate ? new Date(event.eventDate) : null;
                    const day = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const month = date ? monthNames[date.getMonth()] : '--';
                    const dateLabel = date ? date.toLocaleDateString() : 'TBA';

                    // 🔥 الحل هنا (منع الكاش)
                    const sourceImage = event.imageUrl || event.image || '';
                    const image = sourceImage
                        ? getEventImage(sourceImage) + '?v=' + Date.now()
                        : EVENT_PLACEHOLDER;

                    const card = document.createElement('div');
                    card.className = 'event-card';
                    card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <div class="image-box">
                            <img src="${image}" alt="${escapeHtml(event.title || '')}" onerror="this.onerror=null;this.src='${EVENT_PLACEHOLDER}'">
                            <div class="date-box">
                                <div class="day">${day}</div>
                                <div class="month">${month}</div>
                            </div>
                        </div>
                        <div class="event-info">
                            <div class="meta">
                                <span>${dateLabel}</span>
                                ${event.location ? `<span>${escapeHtml(event.location)}</span>` : ''}
                            </div>
                            <h3>${escapeHtml(event.title || '')}</h3>
                            <p>${escapeHtml((event.description || '').slice(0, 120))}</p>
                        </div>
                    `;

                    card.addEventListener('click', function () {
                        window.openApiEventModal(index);
                    });

                    fragment.appendChild(card);
                });

                container.appendChild(fragment);
                console.log('All Events loaded:', data.length);
            })
            .catch(function (err) {
                console.error('Events API error:', err);
                container.innerHTML = '<div style="text-align:center;padding:30px;">Failed to load events</div>';
            });
    }

    window.openApiEventModal = function (index) {
        const event = window._apiEvents[index];
        if (!event) return;

        const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBA';
        const modal = document.getElementById('eventModal');
        const modalImg = document.getElementById('modalImg');
        const modalTitle = document.getElementById('modalTitle');
        const modalDesc = document.getElementById('modalDesc');
        const modalTime = document.getElementById('modalTime');
        const modalLocation = document.getElementById('modalLocation');

        // 🔥 برضه هنا منع الكاش
        const sourceImage = event.imageUrl || event.image || '';
        if (modalImg) {
            modalImg.src = sourceImage
                ? getEventImage(sourceImage) + '?v=' + Date.now()
                : EVENT_PLACEHOLDER;
            modalImg.onerror = function () {
                this.onerror = null;
                this.src = EVENT_PLACEHOLDER;
            };
        }

        if (modalTitle) modalTitle.innerText = event.title || '';
        if (modalDesc) modalDesc.innerText = event.description || '';
        if (modalTime) modalTime.innerText = date;
        if (modalLocation) modalLocation.innerText = event.location || '';
        if (modal) modal.style.display = 'flex';
    };

    window.closeModal = function () {
        const modal = document.getElementById('eventModal');
        if (modal) modal.style.display = 'none';
    };

    renderEvents();
})();
