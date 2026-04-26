document.addEventListener('DOMContentLoaded', async function () {

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    const categoryName = params.get('name') || 'Activities';

    const titleEl = document.getElementById('categoryTitle');
    const subtitleEl = document.getElementById('categorySubtitle');
    const container = document.getElementById('categoryActivities');

    titleEl.textContent = categoryName;
    subtitleEl.textContent = 'Browse available activities and register directly.';

    if (!categoryId || !window.MustAPI) {
        container.innerHTML = '<div class="empty-state">Category not found.</div>';
        return;
    }

    try {
        const activities = await window.MustAPI.getActivitiesByCategory(categoryId);

        if (!Array.isArray(activities) || activities.length === 0) {
            container.innerHTML = renderCategoryFallback(categoryName);
            return;
        }

        container.innerHTML = activities.map(renderActivityCard).join('');

    } catch (error) {
        console.error('Failed to load activitycategory:', error);
        container.innerHTML = renderCategoryFallback(categoryName);
    }
});


// ================= BASE URL =================
const BASE_URL = "https://mystudentactivity.runasp.net";


// ================= FIX IMAGE (activitycategory) =================
function fixActivityCategoryImage(img) {

    if (!img) return "img/OIP.webp";

    img = img.trim();

    if (img.startsWith("http")) return img;

    // 🔥 مهم: activitycategory folder
    if (img.startsWith("/")) {
        return BASE_URL + img + "?v=" + Date.now();
    }

    return BASE_URL + "/uploads/activitycategory/" + img + "?v=" + Date.now();
}


// ================= ESCAPE HTML =================
function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}


// ================= RENDER CARD =================
function renderActivityCard(activity) {

    const imgUrl = fixActivityCategoryImage(activity.imageUrl || activity.image);

    const desc = (activity.description || '').length > 140
        ? activity.description.slice(0, 140) + '...'
        : (activity.description || 'Explore this activity and register now.');

    return `
        <article class="activity-card">

            <img src="${imgUrl}" 
                 alt="${escapeHtml(activity.title || '')}" 
                 onerror="this.src='img/OIP.webp'">

            <div class="activity-body">

                <h3>${escapeHtml(activity.title || '')}</h3>

                <p>${escapeHtml(desc)}</p>

                <div class="activity-actions">

                    <a class="btn btn-secondary"
                       href="activity-details.html?id=${activity.id}">
                       Explore
                    </a>

                    <a class="btn btn-primary"
                       href="registerClub.html?type=activity&id=${activity.id}&title=${encodeURIComponent(activity.title || '')}">
                       Register
                    </a>

                </div>

            </div>

        </article>
    `;
}


// ================= FALLBACK =================
function renderCategoryFallback(categoryName) {

    const name = String(categoryName || '').trim().toLowerCase();

    if (name === 'sports') {

        return [
            {
                title: 'Football',
                description: 'Join football training sessions.',
                image: 'Sports/img/football.PNG'
            },
            {
                title: 'Tennis',
                description: 'Practice tennis with students.',
                image: 'Sports/img/tennis.PNG'
            },
            {
                title: 'Basketball',
                description: 'Play basketball matches.',
                image: 'Sports/img/padel.PNG'
            }
        ].map(function (a) {

            return `
                <article class="activity-card">

                    <img src="${escapeHtml(a.image)}" 
                         alt="${escapeHtml(a.title)}" 
                         onerror="this.src='img/OIP.webp'">

                    <div class="activity-body">

                        <h3>${escapeHtml(a.title)}</h3>

                        <p>${escapeHtml(a.description)}</p>

                        <div class="activity-actions">

                            <a class="btn btn-secondary" href="Sports/sports activities.html">
                                Explore
                            </a>

                            <a class="btn btn-primary" href="#">
                                Register
                            </a>

                        </div>

                    </div>

                </article>
            `;
        }).join('');
    }

    return '<div class="empty-state">No activities found in this category.</div>';
}
