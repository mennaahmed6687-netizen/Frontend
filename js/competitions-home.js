(function () {
    'use strict';

    const BASE_URL =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5184'
            : 'https://must.runasp.net';

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getImage(path) {
        if (!path) return 'img/event2.png';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/')) return BASE_URL + path;
        return BASE_URL + '/uploads/competitions/' + path;
    }

    function setupCompetitionSlider() {
        const section = document.getElementById('competitions');
        if (!section) return;

        const track = section.querySelector('.slider-track');
        const prevBtn = section.querySelector('.slider-btn.prev');
        const nextBtn = section.querySelector('.slider-btn.next');

        if (!track || !prevBtn || !nextBtn) return;

        const originalSlides = Array.from(track.querySelectorAll('.slide'));
        if (originalSlides.length === 0) return;

        track.querySelectorAll('.slide-clone').forEach(function (clone) {
            clone.remove();
        });

        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
        firstClone.classList.add('slide-clone');
        lastClone.classList.add('slide-clone');

        track.insertBefore(lastClone, originalSlides[0]);
        track.appendChild(firstClone);

        let currentIndex = 1;
        let isTransitioning = false;

        function updateSlider(useTransition = true) {
            track.style.transition = useTransition ? 'transform 0.5s ease-in-out' : 'none';
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        function moveToSlide(step) {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex += step;
            updateSlider(true);
        }

        prevBtn.onclick = function () {
            moveToSlide(-1);
        };

        nextBtn.onclick = function () {
            moveToSlide(1);
        };

        if (window._competitionSliderInterval) {
            clearInterval(window._competitionSliderInterval);
        }

        window._competitionSliderInterval = setInterval(function () {
            moveToSlide(1);
        }, 5000);

        track.ontransitionend = function () {
            const slides = track.querySelectorAll('.slide');

            if (currentIndex === slides.length - 1) {
                currentIndex = 1;
                updateSlider(false);
            } else if (currentIndex === 0) {
                currentIndex = slides.length - 2;
                updateSlider(false);
            }

            isTransitioning = false;
        };

        updateSlider(false);
    }

    async function renderCompetitions() {
        const section = document.getElementById('competitions');
        const track = section ? section.querySelector('.slider-track') : null;
        if (!track || !window.MustAPI || !window.MustAPI.getCompetitions) return;

        try {
            const competitions = await window.MustAPI.getCompetitions();
            if (!Array.isArray(competitions) || competitions.length === 0) {
                track.innerHTML = '';
                if (section.querySelector('.slider-btn.prev')) section.querySelector('.slider-btn.prev').style.display = 'none';
                if (section.querySelector('.slider-btn.next')) section.querySelector('.slider-btn.next').style.display = 'none';
                return;
            }

            if (section.querySelector('.slider-btn.prev')) section.querySelector('.slider-btn.prev').style.display = '';
            if (section.querySelector('.slider-btn.next')) section.querySelector('.slider-btn.next').style.display = '';

            track.innerHTML = '';

            competitions.forEach(function (comp, index) {
                const image = getImage(comp.imageUrl || comp.image || '');
                const registrationUrl =
                    './registerClub.html?type=competition&id=' +
                    encodeURIComponent(comp.id) +
                    '&title=' +
                    encodeURIComponent(comp.title || 'Competition');

                const dateHtml = [
                    comp.registrationDeadline
                        ? `<div class="comp-date">Deadline: ${escapeHtml(new Date(comp.registrationDeadline).toLocaleDateString())}</div>`
                        : '',
                    comp.startDate
                        ? `<div class="comp-date">Starts: ${escapeHtml(new Date(comp.startDate).toLocaleDateString())}</div>`
                        : ''
                ].join('');

                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.innerHTML = `
                    <div class="competition-card">
                        <img src="${escapeHtml(image)}"
                             class="comp-img"
                             alt="${escapeHtml(comp.title || 'Competition')}"
                             onerror="this.src='img/event2.png'">

                        <h3>${escapeHtml(comp.title || 'Competition')}</h3>

                        <p class="comp-desc">
                            ${escapeHtml((comp.description || '').slice(0, 220))}
                            ${comp.description && comp.description.length > 220 ? '...' : ''}
                        </p>

                        ${dateHtml}

                        <button class="join-btn">
                            <a href="${registrationUrl}">Registration</a>
                        </button>
                    </div>
                `;

                track.appendChild(slide);
            });

            setupCompetitionSlider();
        } catch (error) {
            console.error('Competitions home error:', error);
        }
    }

    window.initCompetitionSlider = setupCompetitionSlider;
    window.initCompetitions = renderCompetitions;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCompetitions);
    } else {
        renderCompetitions();
    }
})();
