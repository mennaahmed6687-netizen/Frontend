document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('activitiesContainer');
    const menuList = document.getElementById('activitiesMenuList');
    const clubsMenuList = document.getElementById('clubsMenuList');
    if ((!container && !menuList && !clubsMenuList) || !window.MustAPI) return;

    Promise.all([
        window.MustAPI.getActivityCategories(),
        window.MustAPI.getActivities(),
        window.MustAPI.getClubs()
    ])
        .then(function (results) {
            const categories = Array.isArray(results[0]) ? results[0] : [];
            const activities = Array.isArray(results[1]) ? results[1] : [];
            const clubs = Array.isArray(results[2]) ? results[2] : [];

            if (clubsMenuList) {
                clubsMenuList.innerHTML = clubs.length
                    ? clubs.map(function (club) {
                        const targetUrl = 'clubs.html?clubId=' + club.id + '&name=' + encodeURIComponent(club.name || '');
                        return '<a href="' + targetUrl + '">' + escapeHtml(club.name || '') + '</a>';
                    }).join('')
                    : '<a href="./clubs.html">All Clubs</a>';
            }

            if (!categories.length) {
                if (container) {
                    container.innerHTML = '<p style="text-align:center;color:#64748B;">No activity categories found.</p>';
                }
                return;
            }

            if (menuList) {
                menuList.innerHTML = categories.map(function (category) {
                    const targetUrl = 'activity-category.html?categoryId=' + category.id + '&name=' + encodeURIComponent(category.name || '');
                    return '<a href="' + targetUrl + '">' + escapeHtml(category.name || '') + '</a>';
                }).join('');
            }

            if (!container) return;

            container.innerHTML = categories.map(function (category) {
                const relatedActivities = activities.filter(function (activity) {
                    return activity.categoryId === category.id;
                });
                const coverActivity = relatedActivities[0] || null;
                let imgUrl = coverActivity ? (coverActivity.imageUrl || coverActivity.image || '') : '';
                if (imgUrl && imgUrl.startsWith('/')) {
                    imgUrl = BASE_URL + imgUrl;
                }
                if (!imgUrl) imgUrl = 'img/OIP.webp';

                let desc = coverActivity && coverActivity.description
                    ? coverActivity.description
                    : ('Explore ' + (category.name || 'activities') + ' activities.');
                if (desc.length > 120) desc = desc.slice(0, 120) + '...';

                const targetUrl = 'activity-category.html?categoryId=' + category.id + '&name=' + encodeURIComponent(category.name || '');

                return `
                    <div class="card" style="cursor:pointer;" onclick="window.location.href='${targetUrl}'">
                        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(category.name || '')}" onerror="this.src='img/OIP.webp'">
                        <h3>${escapeHtml(category.name || '')}</h3>
                        <p>${escapeHtml(desc)}</p>
                        <button onclick="event.stopPropagation(); window.location.href='${targetUrl}'">Explore</button>
                    </div>`;
            }).join('');
        })
        .catch(function (error) {
            console.error('Failed to render activity categories:', error);
        });
});

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
