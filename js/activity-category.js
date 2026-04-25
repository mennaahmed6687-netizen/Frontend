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

        if (!Array.isArray(activities) || !activities.length) {
            container.innerHTML = renderCategoryFallback(categoryName);
            return;
        }

        container.innerHTML = activities.map(renderActivityCard).join('');
    } catch (error) {
        console.error('Failed to load category activities:', error);
        container.innerHTML = renderCategoryFallback(categoryName);
    }
});

const CATEGORY_API_BASE_URL =
  "https://mystudentactivity.runasp.net";

function renderActivityCard(activity) {
    let imgUrl = activity.imageUrl || activity.image || 'img/OIP.webp';
    if (imgUrl && imgUrl.startsWith('/')) {
        imgUrl = CATEGORY_API_BASE_URL + imgUrl;
    }

    const desc = (activity.description || '').length > 140
        ? activity.description.slice(0, 140) + '...'
        : (activity.description || 'Explore this activity and register now.');

    return `
        <article class="activity-card">
            <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(activity.title || '')}" onerror="this.src='img/OIP.webp'">
            <div class="activity-body">
                <h3>${escapeHtml(activity.title || '')}</h3>
                <p>${escapeHtml(desc)}</p>
                <div class="activity-actions">
                    <a class="btn btn-secondary" href="activity-details.html?id=${activity.id}">Explore</a>
                    <a class="btn btn-primary" href="registerClub.html?type=activity&id=${activity.id}&title=${encodeURIComponent(activity.title || '')}">Register</a>
                </div>
            </div>
        </article>`;
}

function renderCategoryFallback(categoryName) {
    const normalizedName = String(categoryName || '').trim().toLowerCase();
    if (normalizedName === 'sports' || normalizedName === 'sport') {
        return [
            {
                id: '',
                title: 'Football',
                description: 'Join football training and team sessions on campus and build your skills with other students.',
                image: 'Sports/img/football.PNG'
            },
            {
                id: '',
                title: 'Tennis',
                description: 'Enjoy tennis practice at the university courts whether you are a beginner or already experienced.',
                image: 'Sports/img/tennis.PNG'
            },
            {
                id: '',
                title: 'Basketball',
                description: 'Play basketball with energetic student teams and improve speed, teamwork, and court awareness.',
                image: 'Sports/img/padel.PNG'
            }
        ].map(function (activity) {
            return `
                <article class="activity-card">
                    <img src="${escapeHtml(activity.image)}" alt="${escapeHtml(activity.title)}" onerror="this.src='img/OIP.webp'">
                    <div class="activity-body">
                        <h3>${escapeHtml(activity.title)}</h3>
                        <p>${escapeHtml(activity.description)}</p>
                        <div class="activity-actions">
                            <a class="btn btn-secondary" href="Sports/sports activities.html">Explore</a>
                            <a class="btn btn-primary" href="registerClub.html?type=activity&title=${encodeURIComponent(activity.title)}">Register</a>
                        </div>
                    </div>
                </article>`;
        }).join('');
    }

    return '<div class="empty-state">No activities were added to this category yet.</div>';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
