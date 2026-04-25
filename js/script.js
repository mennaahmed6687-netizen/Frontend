/* ─────────────────────────────────────────────────────────────────
   ORIGINAL UI CODE – guarded against missing elements
   ───────────────────────────────────────────────────────────────── */

(function initAlumniSlider() {
    const track = document.querySelector(".alumni-track");
    const cards = document.querySelectorAll(".alumni-card");
    const next  = document.querySelector(".arrow.right");
    const prev  = document.querySelector(".arrow.left");

    if (!track || !next || !prev || cards.length === 0) return;

    let index = 0;
    const visibleCards = 3;
    const cardWidth = 345;

    function updateSlider() {
        track.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    next.onclick = () => {
        index++;
        if (index > cards.length - visibleCards) index = 0;
        updateSlider();
    };

    prev.onclick = () => {
        index--;
        if (index < 0) index = cards.length - visibleCards;
        updateSlider();
    };

    setInterval(() => {
        index++;
        if (index > cards.length - visibleCards) index = 0;
        updateSlider();
    }, 4000);
})();

(function initAwardsSlider() {
    const awardsTrack  = document.querySelector(".awards-track");
    const awardsSlides = document.querySelectorAll(".awards-slide");
    const awardsNext   = document.querySelector(".awards-right");
    const awardsPrev   = document.querySelector(".awards-left");
    const awardsDots   = document.querySelectorAll(".awards-dots .dot");

    if (!awardsTrack || !awardsNext || !awardsPrev || awardsSlides.length === 0) return;

    let awardsIndex = 0;

    function updateAwardsSlider() {
        awardsTrack.style.transform = `translateX(-${awardsIndex * 100}%)`;
        if (awardsDots.length) {
            awardsDots.forEach(dot => dot.classList.remove("active"));
            if (awardsDots[awardsIndex]) awardsDots[awardsIndex].classList.add("active");
        }
    }

    awardsNext.addEventListener("click", () => {
        awardsIndex = (awardsIndex + 1) % awardsSlides.length;
        updateAwardsSlider();
    });

    awardsPrev.addEventListener("click", () => {
        awardsIndex = (awardsIndex - 1 + awardsSlides.length) % awardsSlides.length;
        updateAwardsSlider();
    });

    awardsDots.forEach(dot => {
        dot.addEventListener("click", () => {
            awardsIndex = Number(dot.dataset.index);
            updateAwardsSlider();
        });
    });

    setInterval(() => {
        awardsIndex = (awardsIndex + 1) % awardsSlides.length;
        updateAwardsSlider();
    }, 5000);
})();

document.addEventListener("DOMContentLoaded", function () {
    const eventCards = document.querySelectorAll(".must-event-card");
    if (eventCards.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity    = "1";
                    entry.target.style.transform  = "translateY(0)";
                }
            });
        });
        eventCards.forEach(card => {
            card.style.opacity   = "0";
            card.style.transform = "translateY(40px)";
            card.style.transition = "0.6s";
            observer.observe(card);
        });
    }
});

(function initSocialLinks() {
    const socialLinks = document.querySelectorAll(".social-fixed a");
    socialLinks.forEach(link => {
        link.addEventListener("click", function () {
            socialLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });
})();


/* ─────────────────────────────────────────────────────────────────
   API INTEGRATION  (index.html only – guarded by element checks)
   BASE URL: dynamic
   ───────────────────────────────────────────────────────────────── */

const BASE_URL =
 "https://mystudentactivity.runasp.net";

// ── Token helpers ──────────────────────────────────────────────
function getToken()        { return localStorage.getItem('must_token'); }
function saveToken(t)      { localStorage.setItem('must_token', t); }
function removeToken()     { localStorage.removeItem('must_token'); }
function authHeaders()     { const t = getToken(); return t ? { 'Authorization': `Bearer ${t}` } : {}; }

// ── Generic request helpers ────────────────────────────────────
async function jsonReq(method, path, body, auth) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) Object.assign(headers, authHeaders());
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(BASE_URL + path, opts);
    const text = await res.text();
    let data   = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) throw new Error((data && (data.message || data.title || JSON.stringify(data))) || res.statusText);
    return data;
}

async function formReq(method, path, fd, auth) {
    const headers = {};
    if (auth) Object.assign(headers, authHeaders());
    const res  = await fetch(BASE_URL + path, { method, headers, body: fd });
    const text = await res.text();
    let data   = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) throw new Error((data && (data.message || data.title || JSON.stringify(data))) || res.statusText);
    return data;
}

// ── Auth ───────────────────────────────────────────────────────
async function loginUser(email, password) {
    const data = await jsonReq('POST', '/api/Auth/login', { email, password });
    if (data) {
        if (data.token)        saveToken(data.token);
        else if (data.accessToken) saveToken(data.accessToken);
        else if (typeof data === 'string' && data.length > 20) saveToken(data);
    }
    return data;
}
async function registerUser(firstName, lastName, email, password) {
    return jsonReq('POST', '/api/Auth/register', { firstName, lastName, email, password });
}
async function verifyOtp(email, otpCode) {
    const data = await jsonReq('POST', '/api/Auth/verify-otp', { email, otpCode });
    if (data && data.token) saveToken(data.token);
    return data;
}

// ── Events ─────────────────────────────────────────────────────
async function getEvents()  { return jsonReq('GET', '/api/Events'); }

// ── News ───────────────────────────────────────────────────────
async function getNews()    { return jsonReq('GET', '/api/News'); }

// ── Contact ────────────────────────────────────────────────────
async function sendContact(name, email, message) {
    return jsonReq('POST', '/api/Contact', { name, email, message });
}

// ── Slider ─────────────────────────────────────────────────────
async function getSlider()  { return jsonReq('GET', '/api/Slider'); }

// ── Utility ────────────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── CONTACT FORM integration ───────────────────────────────────
(function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Remove the old emailjs listener by cloning the form (safe – no HTML change)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name    = document.getElementById('name') ? document.getElementById('name').value.trim() : '';
        const email   = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
        const message = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

        if (!name || !email || !message) {
            alert('Please fill all required fields'); return;
        }
        try {
            await sendContact(name, email, message);
            alert('Message sent successfully ✅');
            newForm.reset();
        } catch (err) {
            console.error('Contact form error:', err);
            alert('Failed to send: ' + err.message);
        }
    });
})();

// Homepage events are owned by index-api.js to avoid duplicate rendering
// and conflicting modal handlers on the same #eventsContainer section.

// ── NEWS (index.html homepage section) ────────────────────────
(function initIndexNews() {
    const nc = document.querySelector('#news .news-container');
    if (!nc) return;

    getNews()
        .then(function (data) {
            if (!Array.isArray(data) || data.length === 0) {
                console.log('News: using static fallback.'); return;
            }
            window._apiNews = data;
            nc.innerHTML = '';
            data.slice(0, 3).forEach(function (item, i) {
                const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
                // News imageUrl is a relative path – prepend BASE_URL
                const img  = item.imageUrl ? (BASE_URL + item.imageUrl) : (item.image || 'img/news5.jpg');
                nc.innerHTML += `
                <div class="card" onclick="openApiNewsModal(${i})" style="cursor:pointer;">
                    <img src="${escHtml(img)}" alt="${escHtml(item.title)}" onerror="this.src='img/news5.jpg'" style="width:100%;height:200px;object-fit:cover;">
                    <div class="card-content">
                        <div class="meta">
                            <span><i class="fa-regular fa-user"></i> MUST Admin</span>
                            ${date ? `<span><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}
                        </div>
                        <h3>${escHtml(item.title)}</h3>
                    </div>
                </div>`;
            });
            console.log('News loaded from API:', data.length);
        })
        .catch(err => console.error('News error:', err));
})();

window.openApiNewsModal = function (index) {
    const item = window._apiNews && window._apiNews[index];
    if (!item) return;
    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
    const get  = id => document.getElementById(id);
    const niSrc = item.imageUrl ? (BASE_URL + item.imageUrl) : (item.image || 'img/news5.jpg');
    if (get('newsImg'))    get('newsImg').src           = niSrc;
    if (get('newsTitle'))  get('newsTitle').innerText   = item.title || '';
    if (get('newsAuthor')) get('newsAuthor').innerText  = 'MUST Admin';
    if (get('newsDate'))   get('newsDate').innerText    = date;
    if (get('newsDesc'))   get('newsDesc').innerText    = item.content || item.description || item.body || '';
    if (get('newsModal'))  get('newsModal').style.display = 'flex';
};
function closeNewsModal() {
    document.getElementById("newsModal").style.display = "none";
}

// ── SLIDER (index.html hero carousel) ─────────────────────────
(function initIndexSlider() {
    getSlider()
        .then(function (data) {
            if (!Array.isArray(data) || data.length === 0) return;
            const active = data.filter(s => s.isActive !== false);
            if (active.length === 0) return;

            const cc = document.querySelector('.content-container');
            if (!cc) return;

            cc.querySelectorAll('.carousel-slide').forEach(el => el.remove());
            const controls = cc.querySelector('.carousel-controls');

            active.forEach(function (slide, i) {
                const div = document.createElement('div');
                div.className = 'carousel-slide' + (i === 0 ? ' active' : '');
                // imageUrl is a relative path – prepend BASE_URL
                const sImgUrl = slide.imageUrl ? (BASE_URL + slide.imageUrl) : (slide.image || '');
                if (sImgUrl) div.style.backgroundImage = `url('${sImgUrl}')`;
                cc.insertBefore(div, controls);
            });
            console.log('Slider loaded from API:', active.length, 'slides');
        })
        .catch(err => console.error('Slider error:', err));
})();


/* expose for other inline scripts if needed */
window.MustAPI = {
    getToken, saveToken, removeToken,
    loginUser, registerUser, verifyOtp,
    getEvents, getNews, getSlider,
    sendContact,
};

// ── AUTH STATE MANAGEMENT ─────────────────────────────────────
window.logout = function() {
    localStorage.removeItem("must_token");
    localStorage.removeItem("must_role");
    window.location.href = "login.html";
};

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("must_token");
    const loginBtns = document.querySelectorAll('a[href*="login.html"]');
    const signupBtns = document.querySelectorAll('a[href*="signup.html"]');
    const navIcons = document.querySelector('.nav-icons');

    if (token) {
        // Logged in
        loginBtns.forEach(btn => btn.style.display = 'none');
        signupBtns.forEach(btn => btn.style.display = 'none');

        const role = (localStorage.getItem('must_role') || '').toLowerCase();

        if (role === 'admin' && !document.getElementById('mustDashboardBtn') && navIcons) {
            const dashboardBtn = document.createElement('a');
            dashboardBtn.id = 'mustDashboardBtn';
            dashboardBtn.href = 'admin/index.html';
            dashboardBtn.className = 'btn-login';
            dashboardBtn.innerHTML = '&#127968;';
            dashboardBtn.title = 'Dashboard';
            dashboardBtn.setAttribute('aria-label', 'Dashboard');
            navIcons.appendChild(dashboardBtn);
        } else if (role !== 'admin') {
            const dashboardBtn = document.getElementById('mustDashboardBtn');
            if (dashboardBtn) dashboardBtn.remove();
        }

        if (!document.getElementById('mustLogoutBtn') && navIcons) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'mustLogoutBtn';
            logoutBtn.href = '#';
            logoutBtn.className = 'btn-login';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            navIcons.appendChild(logoutBtn);
        }
    } else {
        // Not logged in
        loginBtns.forEach(btn => btn.style.display = 'inline-block');
        signupBtns.forEach(btn => btn.style.display = 'inline-block');
        const dashboardBtn = document.getElementById('mustDashboardBtn');
        if (dashboardBtn) dashboardBtn.remove();
        const logoutBtn = document.getElementById('mustLogoutBtn');
        if (logoutBtn) logoutBtn.remove();
    }
});

// ── ACTIVITIES (index.html homepage section) ──────────────────
async function loadActivities() {
    const container = document.getElementById('activitiesContainer');
    if (!container) return; // Not on index.html, skip

    try {
        const response = await fetch(`${BASE_URL}/api/Activities`);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        console.log('[Activities] API response:', data);

        if (!Array.isArray(data) || data.length === 0) {
            console.warn('[Activities] Empty or invalid response from API');
            return;
        }

        container.innerHTML = '';

        data.forEach(function(activity) {
            // Fix image URL — prepend base if relative
            let imgUrl = activity.imageUrl || activity.image || '';
            if (imgUrl && imgUrl.startsWith('/')) {
                imgUrl = BASE_URL + imgUrl;
            }
            if (!imgUrl) imgUrl = 'img/OIP.webp';

            const desc = (activity.description || '').length > 120
                ? activity.description.slice(0, 120) + '\u2026'
                : (activity.description || '');

            container.innerHTML += `
                <div class="card" style="cursor:pointer;" onclick="window.location.href='activity-details.html?id=${activity.id}'">
                    <img src="${imgUrl}" alt="${activity.title || ''}" onerror="this.src='img/OIP.webp'">
                    <h3>${activity.title || ''}</h3>
                    <p>${desc}</p>
                    <button onclick="event.stopPropagation(); window.location.href='activity-details.html?id=${activity.id}'">Explore</button>
                </div>
            `;
        });

        console.log('[Activities] Rendered', data.length, 'cards into #activitiesContainer');
    } catch (err) {
        console.error('[Activities] Fetch error:', err);
    }
}

// Call immediately (DOM is already ready when this script loads)
// and then poll every 5 seconds for real-time sync with Admin Dashboard
loadActivities();

// ── ACTIVITIES (sports activities.html section) ────────────────
(function initActivities() {
    const container = document.querySelector('.sports-grid');
    if (!container) return; // Only execute if container exists

    async function loadActivities() {
        try {
            // MUST fetch WITHOUT token using async/await
            const data = await jsonReq('GET', '/api/Activities', null, false);
            if (!Array.isArray(data)) return;

            // Clear container before rendering
            container.innerHTML = "";

            // Loop through all activities
            data.forEach(activity => {
                // Fix image URL mapping
                let imgUrl = activity.image || 'img/football.PNG';
                if (imgUrl.startsWith('/uploads')) {
                    imgUrl = BASE_URL + imgUrl;
                }

                // Map data correctly into existing UI cards
                const durationHtml = activity.duration ? `<strong>Duration:</strong> ${escHtml(activity.duration)}<br>` : '';
                const playersHtml = activity.playersCount !== undefined ? `<strong>Players:</strong> ${escHtml(String(activity.playersCount))}` : '';
                
                container.innerHTML += `
                    <div class="sport-card">
                        <img src="${escHtml(imgUrl)}" alt="${escHtml(activity.title)}" class="sport-img" onerror="this.src='img/football.PNG'">
                        <div class="sport-content">
                            <h3>${escHtml(activity.title)}</h3>
                            <p>
                                ${escHtml(activity.description)}<br><br>
                                ${durationHtml}
                                ${playersHtml}
                            </p>
                            <a href="Register Team.html?id=${activity.id}" class="btn-register">Register Now</a>
                        </div>
                    </div>
                `;
            });
        } catch (err) {
            console.error('Error loading activities:', err);
        }
    }

    // Call on load
    loadActivities();
})();
