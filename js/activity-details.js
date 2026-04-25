document.addEventListener('DOMContentLoaded', async function () {
    const DETAILS_API_BASE_URL =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5184'
            : 'https://must.runasp.net';

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id || !window.MustAPI) {
        console.error('No Activity ID provided in URL.');
        return;
    }

    try {
        const activity = await window.MustAPI.getActivityById(id);
        const titleEl = document.getElementById('detailTitle');
        const descEl = document.getElementById('detailDesc');
        const imgEl = document.getElementById('detailImg');
        const durationEl = document.getElementById('detailDuration');
        const playersEl = document.getElementById('detailPlayers');
        const categoryEl = document.getElementById('detailCategory');

        if (titleEl) titleEl.innerText = activity.title || 'No Title';
        if (descEl) descEl.innerText = activity.description || 'No Description available.';
        if (durationEl) durationEl.innerText = activity.duration ? ('Duration: ' + activity.duration) : '';
        if (playersEl) playersEl.innerText = activity.playersCount ? ('Players: ' + activity.playersCount) : '';
        if (categoryEl) categoryEl.innerText = activity.categoryName ? ('Category: ' + activity.categoryName) : '';

        if (imgEl) {
            let imgUrl = activity.imageUrl || activity.image || 'img/OIP.webp';
            if (imgUrl && imgUrl.startsWith('/')) {
                imgUrl = DETAILS_API_BASE_URL + imgUrl;
            }
            imgEl.src = imgUrl;
            imgEl.alt = activity.title || 'Activity Image';
            imgEl.onerror = function () { imgEl.src = 'img/OIP.webp'; };
        }

        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function () {
                window.location.href = 'registerClub.html?type=activity&id=' + encodeURIComponent(id) + '&title=' + encodeURIComponent(activity.title || '');
            });
        }
    } catch (error) {
        console.error('Error fetching activity details:', error);
    }
});
