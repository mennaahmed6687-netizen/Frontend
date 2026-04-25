/**
 * index-api.js  –  API integration for index.html (homepage)
 *
 * Connects:
 *   • Contact form   → POST /api/Contact
 *   • Events section → GET  /api/Events  (replaces static JS array)
 *   • News section   → GET  /api/News    (replaces static JS array)
 *   • Slider section → GET  /api/Slider  (optional hero carousel update)
 *
 * HOW TO USE:
 *   Add just before </body> in index.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/index-api.js"></script>
 *   (Keep the existing <script src="js/script.js"></script> as well)
 */

(function () {
    'use strict';

    const API_BASE_URL =
       "http://mystudentactivity.runasp.net";
    const EVENT_PLACEHOLDER =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">' +
            '<rect width="1200" height="800" fill="#eef2f7"/>' +
            '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="42">No event image</text>' +
            '</svg>'
        );

    // ════════════════════════════════════════
    // CONTACT FORM
    // ════════════════════════════════════════
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name    = document.getElementById('name').value.trim();
            const email   = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill all required fields');
                return;
            }

            try {
                await MustAPI.sendContact(name, email, message);
                alert('Message sent successfully ✅');
                form.reset();
            } catch (err) {
                console.error('Contact error:', err);
                alert('Failed to send message: ' + err.message);
            }
        });
    }

    function normalizeMenuLabel(value) {
        return String(value || '').trim().toLowerCase();
    }

    function buildMenuHref(item) {
        const rawUrl = String((item && item.url) || '').trim();
        if (rawUrl) return rawUrl;

        const label = normalizeMenuLabel(item && item.name);
        if (label === 'activities') return '#activity';
        if (label === 'events') return '#events';
        if (label === 'news') return '#news';
        if (label === 'competitions' || label === 'competition') return '#competitions';
        if (label === 'clubs') return '#clubs';
        if (label === 'contact us' || label === 'contact') return '#contact';

        return '#';
    }

    function buildMenuItemMarkup(item) {
        const href = buildMenuHref(item);
        const subMenus = Array.isArray(item && item.subMenus) ? item.subMenus : [];
        const name = esc(item && item.name ? item.name : 'Menu');

        if (!subMenus.length) {
            return '<li class="menu-item menu-item-api"><a href="' + esc(href) + '">' + name + '</a></li>';
        }

        return '<li class="menu-item menu-item-api">' +
            '<a href="' + esc(href) + '">' + name + '</a>' +
            '<div class="mega-menu"><div class="mega-column">' +
            subMenus.map(function (subItem) {
                return '<a href="' + esc(buildMenuHref(subItem)) + '">' + esc(subItem && subItem.name ? subItem.name : 'Sub Menu') + '</a>';
            }).join('') +
            '</div></div></li>';
    }

    function mergeSubMenusIntoExistingItem(menuItemElement, apiItem) {
        if (!menuItemElement || !apiItem) return;

        const subMenus = Array.isArray(apiItem.subMenus) ? apiItem.subMenus : [];
        if (!subMenus.length) return;

        let megaMenu = menuItemElement.querySelector('.mega-menu');
        let megaColumn = megaMenu ? megaMenu.querySelector('.mega-column') : null;

        if (!megaMenu) {
            megaMenu = document.createElement('div');
            megaMenu.className = 'mega-menu';
            megaColumn = document.createElement('div');
            megaColumn.className = 'mega-column';
            megaMenu.appendChild(megaColumn);
            menuItemElement.appendChild(megaMenu);
        } else if (!megaColumn) {
            megaColumn = document.createElement('div');
            megaColumn.className = 'mega-column';
            megaMenu.appendChild(megaColumn);
        }

        const existingSubNames = new Set(
            Array.from(megaColumn.querySelectorAll('a'))
                .map(function (link) { return normalizeMenuLabel(link.textContent); })
                .filter(Boolean)
        );

        subMenus.forEach(function (subItem) {
            const subName = normalizeMenuLabel(subItem && subItem.name);
            if (!subName || existingSubNames.has(subName)) return;

            const link = document.createElement('a');
            link.href = buildMenuHref(subItem);
            link.textContent = subItem.name || 'Sub Menu';
            megaColumn.appendChild(link);
            existingSubNames.add(subName);
        });
    }

    function initDynamicMenu() {
        if (!window.MustAPI || !window.MustAPI.getMenu) return;

        const menuList = document.querySelector('.slider-menu');
        if (!menuList) return;

        window.MustAPI.getMenu()
            .then(function (items) {
                if (!Array.isArray(items) || !items.length) return;

                const existingItemsByName = new Map();
                Array.from(menuList.querySelectorAll(':scope > .menu-item'))
                    .forEach(function (menuItem) {
                        const link = menuItem.querySelector(':scope > a');
                        const name = normalizeMenuLabel(link && link.textContent);
                        if (name) existingItemsByName.set(name, menuItem);
                    });

                const dynamicItems = items.filter(function (item) {
                    if (!item || !item.name) return false;

                    const existingItem = existingItemsByName.get(normalizeMenuLabel(item.name));
                    if (existingItem) {
                        mergeSubMenusIntoExistingItem(existingItem, item);
                        return false;
                    }

                    return true;
                });

                if (!dynamicItems.length) return;

                menuList.insertAdjacentHTML(
                    'beforeend',
                    dynamicItems.map(buildMenuItemMarkup).join('')
                );
            })
            .catch(function (err) {
                console.error('Menu API error:', err);
            });
    }

    initContactForm();
    initDynamicMenu();

    // ════════════════════════════════════════
    // EVENTS  (index.html shows first 3)
// ════════════════════════════════════════
// EVENTS  (عرض أول 3 فقط)
// ════════════════════════════════════════
function initEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    MustAPI.getEvents()
        .then(function (data) {

            if (!Array.isArray(data) || data.length === 0) {
                console.log('Events: no data from API');
                container.innerHTML = `<div style="text-align:center;padding:30px;">No events</div>`;
                return;
            }

            // 🔥 أول 3 فقط
            const top3 = data.slice(0, 3);

            // حفظهم للمودال
            window._apiEvents = top3;

            container.innerHTML = '';

            const fragment = document.createDocumentFragment();

            top3.forEach(function (event, index) {

                const date = event.eventDate ? new Date(event.eventDate) : null;

                const day = date ? String(date.getDate()).padStart(2, '0') : '--';

                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const month = date ? monthNames[date.getMonth()] : '--';

                const baseUrl = API_BASE_URL;

                let img = event.imageUrl || event.image || '';
                let hasRealImage = Boolean(img);

                if (!hasRealImage) {
                    img = EVENT_PLACEHOLDER;
                } else if (img.startsWith('/')) {
                    img = baseUrl + img;
                } else if (!img.startsWith('http')) {
                    img = baseUrl + '/uploads/events/' + img;
                }

                if (hasRealImage) {
                    img = img + '?v=' + (event.id || Date.now());
                }

                const card = document.createElement('div');
                card.className = 'event-card';
                card.style.cursor = 'pointer';

                card.innerHTML = `
                    <div class="image-box">
                        <img src="${img}" alt="${event.title || ''}"
                             onerror="this.onerror=null;this.src='${EVENT_PLACEHOLDER}'">

                        <div class="date-box">
                            <div class="day">${day}</div>
                            <div class="month">${month}</div>
                        </div>
                    </div>

                    <div class="event-info">
                        <div class="meta">
                            <span>📅 ${date ? date.toLocaleDateString() : 'TBA'}</span>
                            ${event.location ? `<span>📍 ${event.location}</span>` : ''}
                        </div>

                        <h3>${event.title || ''}</h3>
                        <p>${(event.description || '').slice(0, 100)}</p>
                    </div>
                `;

                card.addEventListener('click', () => openApiEventModal(index));

                fragment.appendChild(card);
            });

            container.appendChild(fragment);

            console.log('Top 3 Events loaded');
        })
        .catch(function (err) {
            console.error('Events API error:', err);
        });
}

// INIT
window.initEvents = initEvents;
initEvents();

/** ================= MODAL ================= */
window.openApiEventModal = function (index) {
    const events = window._apiEvents;
    if (!events || !events[index]) return;

    const event = events[index];

    const date = event.eventDate
        ? new Date(event.eventDate).toLocaleDateString()
        : 'TBA';

    const baseUrl = API_BASE_URL;

    let img = event.imageUrl || event.image || '';
    let hasRealImage = Boolean(img);

    if (!hasRealImage) {
        img = EVENT_PLACEHOLDER;
    } else if (img.startsWith('/')) {
        img = baseUrl + img;
    } else if (!img.startsWith('http')) {
        img = baseUrl + '/uploads/events/' + img;
    }

    if (hasRealImage) {
        img = img + '?v=' + (event.id || Date.now());
    }

    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalTime = document.getElementById('modalTime');
    const modalLocation = document.getElementById('modalLocation');
    const modal = document.getElementById('eventModal');

    if (modalImg) {
        modalImg.src = img;
        modalImg.onerror = function () {
            this.onerror = null;
            this.src = EVENT_PLACEHOLDER;
        };
    }

    if (modalTitle) modalTitle.innerText = event.title || '';
    if (modalDesc) modalDesc.innerText = event.description || '';
    if (modalTime) modalTime.innerText = '📅 ' + date;
    if (modalLocation) modalLocation.innerText = event.location ? '📍 ' + event.location : '';

    if (modal) modal.style.display = 'flex';
};

/** CLOSE MODAL */
window.closeModal = function () {
    const modal = document.getElementById('eventModal');
    if (modal) modal.style.display = 'none';
};


    // ════════════════════════════════════════
    // NEWS  (index.html shows first 3)
    // ════════════════════════════════════════
(function () {
    'use strict';

    const container = document.getElementById("newsContainer");
    if (!container) return;

    window._apiNews = [];

    const BASE_URL = API_BASE_URL;

    // ================= IMAGE FIX =================
    function fixImage(img) {
        if (!img) return "img/news5.jpg";

        img = img.trim();

        if (img.startsWith("http")) return img;

        if (img.startsWith("/")) {
            return BASE_URL + img;
        }

        return BASE_URL + "/uploads/news/" + img;
    }

    // ================= LOAD NEWS =================
    function loadNews() {

        MustAPI.getNews()
            .then(data => {

                if (!Array.isArray(data)) return;

                // 🔥 أول 3 فقط
                const top3 = data.slice(0, 3);

                window._apiNews = top3;

                container.innerHTML = "";

                const fragment = document.createDocumentFragment();

                top3.forEach((item, index) => {

                    let img = fixImage(item.imageUrl || item.image);
                    img = img + "?v=" + (item.id || index);

                    const card = document.createElement("div");
                    card.className = "card events";
                    card.style.cursor = "pointer";

                    card.innerHTML = `
                        <img src="${img}"
                             alt="${item.title || ''}"
                             onerror="this.onerror=null;this.src='img/news5.jpg';"
                             style="width:100%;height:200px;object-fit:cover;">

                        <div class="card-content">
                            <div class="meta">
                                <span><i class="fa-regular fa-user"></i> MUST Admin</span>
                                <span><i class="fa-regular fa-calendar"></i>
                                    ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>

                            <h3>${item.title || ''}</h3>
                        </div>
                    `;

                    card.addEventListener("click", () => openApiNewsModal(index));

                    fragment.appendChild(card);
                });

                container.appendChild(fragment);

                console.log("Top 3 News loaded");
            })
            .catch(err => console.error("News error:", err));
    }

    // ================= MODAL =================
    window.openApiNewsModal = function (index) {

        const item = window._apiNews[index];
        if (!item) return;

        let img = fixImage(item.imageUrl || item.image);
        img = img + "?v=" + (item.id || 0);

        const modalImg = document.getElementById("newsImg");
        if (modalImg) {
            modalImg.src = img;
            modalImg.onerror = function () {
                this.src = "img/news5.jpg";
            };
        }

        const title = document.getElementById("newsTitle");
        const desc = document.getElementById("newsDesc");
        const date = document.getElementById("newsDate");

        if (title) title.innerText = item.title || "";
        if (desc) desc.innerText = item.description || item.content || "";
        if (date) date.innerText = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "";

        const modal = document.getElementById("newsModal");
        if (modal) modal.style.display = "flex";
    };

    // ================= INIT =================
    window.initNews = loadNews;
    window.closeNewsModal = function () {
        const modal = document.getElementById("newsModal");
        if (modal) modal.style.display = "none";
    };
    loadNews();

})();
    // ════════════════════════════════════════
    // SLIDER (optional – load from API if available)
    // ════════════════════════════════════════
    function initSlider() {
        // Replace any static slides with the API-managed slider content
        MustAPI.getSlider()
            .then(function (data) {
                const container = document.querySelector('.content-container');
                if (!container) return;

                const controls = container.querySelector('.carousel-controls');
                if (!controls) return;

                Array.from(container.querySelectorAll('.carousel-slide')).forEach(function (slideEl) {
                    slideEl.remove();
                });

                const slides = (Array.isArray(data) ? data : [])
                    .filter(function (s) { return !!(s.imageUrl || s.image); })
                    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

                controls.style.display = slides.length > 1 ? 'flex' : 'none';

                if (slides.length === 0) {
                    if (typeof window.currentSlide === 'number') {
                        window.currentSlide = 0;
                    }
                    console.log('Slider API returned no slides');
                    return;
                }

                slides.forEach(function (slide) {
                    let imgPath = slide.imageUrl || slide.image;
                    if (imgPath) {
                        const fullImageUrl = imgPath.startsWith('http') ? imgPath : BASE_URL + imgPath;

                        const div = document.createElement('div');
                        div.className = 'carousel-slide';
                        div.style.backgroundImage = `url('${fullImageUrl}')`;
                        container.insertBefore(div, controls);
                    }
                });

                const mergedSlides = container.querySelectorAll('.carousel-slide');
                mergedSlides.forEach(function (slideEl) { slideEl.classList.remove('active'); });
                if (mergedSlides[0]) {
                    mergedSlides[0].classList.add('active');
                }

                if (typeof window.currentSlide === 'number') {
                    window.currentSlide = 0;
                }
                if (typeof window.showSlide === 'function') {
                    window.showSlide(0);
                }

                console.log('Slider loaded from API:', slides.length, 'slides');
            })
            .catch(function (err) {
                console.error('Slider API error:', err);
            });
    }
    initSlider();

    // ════════════════════════════════════════
    // ACTIVITIES  (index.html #activitiesContainer)
    // ════════════════════════════════════════
    function initActivities() {
        const container = document.getElementById('activitiesContainer');
        if (!container || !window.MustAPI) return;

        fetch(`${API_BASE_URL}/api/Activities`)
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data) {
                console.log('[index-api] Activities API response:', data);
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('[index-api] No activities returned from API');
                    return;
                }

                container.innerHTML = '';

                data.forEach(function(activity) {
                    // Fix image URL — prepend base URL if path is relative
                    var imgUrl = activity.imageUrl || activity.image || '';
                    if (imgUrl && imgUrl.startsWith('/')) {
                        imgUrl = API_BASE_URL + imgUrl;
                    }
                    if (!imgUrl) imgUrl = 'img/OIP.webp';

                    var desc = (activity.description || '').length > 120
                        ? activity.description.slice(0, 120) + '\u2026'
                        : (activity.description || '');

                    container.innerHTML += `
                        <div class="card" style="cursor:pointer;" onclick="window.location.href='activity-details.html?id=${activity.id}'">
                            <img src="${imgUrl}" alt="${escHtml(activity.title || '')}" onerror="this.src='img/OIP.webp'">
                            <h3>${escHtml(activity.title || '')}</h3>
                            <p>${escHtml(desc)}</p>
                            <button onclick="event.stopPropagation(); window.location.href='activity-details.html?id=${activity.id}'">Explore</button>
                        </div>`;
                });

                console.log('[index-api] Activities rendered:', data.length);
            })
            .catch(function(err) {
                console.error('[index-api] Activities fetch error:', err);
            });
    }
    window.initActivities = initActivities;
    initActivities();
(function () {
    'use strict';

    const BASE_URL = API_BASE_URL;

    // ───────────────────────────────
    // HELPER (IMAGE FIX)
    // ───────────────────────────────
    function getImage(path, fallback = 'img/event2.png') {
        if (!path) return fallback;

        if (path.startsWith('http')) return path;

        return BASE_URL + path;
    }

    // ═══════════════════════════════
 (function () {
    'use strict';

    const BASE_URL = API_BASE_URL;

    const grid = document.getElementById('clubsContainer');

    // ───────────────────────────────
    // LOAD CLUBS
    // ───────────────────────────────
    async function loadClubs() {
        try {
            const res = await fetch(`${BASE_URL}/api/Clubs`);

            if (!res.ok) {
                console.error("API Error:", res.status);
                return;
            }

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                console.log("No clubs found");
                return;
            }

            grid.innerHTML = '';

            data.forEach(club => {

                // ───── IMAGE FIX ─────
                let imgSrc = club.imageUrl;

                if (!imgSrc) {
                    imgSrc = 'img/event2.png';
                } else if (!imgSrc.startsWith('http')) {
                    imgSrc = BASE_URL + imgSrc;
                }

                const url =
                    `./registerClub.html?type=club&id=${club.id}&title=${encodeURIComponent(club.name || '')}`;

                grid.innerHTML += `
                    <div class="club-card">

                        <img src="${imgSrc}"
                             alt="${escapeHtml(club.name)}"
                             class="club-img"
                             onerror="this.src='img/event2.png'">

                        <h3>${escapeHtml(club.name)}</h3>

                        <p>
                            ${escapeHtml((club.description || '').slice(0, 180))}
                            ${club.description && club.description.length > 180 ? '…' : ''}
                        </p>

                        <button class="join-btn">
                            <a href="${url}">Registration</a>
                        </button>

                    </div>
                `;
            });

            console.log("Clubs loaded:", data.length);

        } catch (err) {
            console.error("Clubs error:", err);
        }
    }

    // ───────────────────────────────
    // ESCAPE HTML
    // ───────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ───────────────────────────────
    // START
    // ───────────────────────────────
    window.initClubs = loadClubs;
    loadClubs();

})();

    // ───────────────────────────────
    // INIT
    // ───────────────────────────────
  


    // ═══════════════════════════════
    // COMPETITIONS
    // ═══════════════════════════════
    function initCompetitions() {

        const track = document.getElementById('competitionsContainer') ||
                      document.querySelector('#competitions .slider-track');

        if (!track) return;

        MustAPI.getCompetitions()
            .then(function (data) {

                if (!Array.isArray(data) || data.length === 0) return;

                track.innerHTML = '';

                data.forEach(function (comp) {

                    const imgSrc = getImage(comp.imageUrl);

                    const registrationUrl =
                        './registerClub.html?type=competition&id=' +
                        encodeURIComponent(comp.id) +
                        '&title=' +
                        encodeURIComponent(comp.title || comp.name || 'Competition');

                    const dateStr = comp.startDate
                        ? '📅 Starts: ' + new Date(comp.startDate).toLocaleDateString()
                        : (comp.endDate
                            ? '🏁 Deadline: ' + new Date(comp.endDate).toLocaleDateString()
                            : '');

                    track.innerHTML += `
                        <div class="slide">

                            <div class="competition-card">

                                <img src="${esc(imgSrc)}"
                                     class="comp-img"
                                     onerror="this.src='img/event2.png'">

                                <h3>${esc(comp.title || comp.name)}</h3>

                                <p class="comp-desc">
                                    ${esc((comp.description || '').slice(0, 180))}
                                    ${comp.description && comp.description.length > 180 ? '…' : ''}
                                </p>

                                ${dateStr ? `<div class="comp-date">${esc(dateStr)}</div>` : ''}

                                <button class="join-btn">
                                    <a href="${registrationUrl}">Registration</a>
                                </button>

                            </div>

                        </div>
                    `;
                });

                if (typeof window.initCompetitionSlider === 'function') {
                    window.initCompetitionSlider();
                }

                console.log("Competitions loaded:", data.length);

            })
            .catch(err => console.error("Competitions API error:", err));
    }

    // ═══════════════════════════════
    // ESCAPE HTML
    // ═══════════════════════════════
    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ═══════════════════════════════
    // START
    // ═══════════════════════════════
  
    window.initCompetitions = initCompetitions;
    initCompetitions();

})();


    // ════════════════════════════════════════
    // AUTO-REFRESH LIVE DATA (5 seconds)
    // ════════════════════════════════════════
    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
})();
