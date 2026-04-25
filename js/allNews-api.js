(function () {
    'use strict';

    const container = document.querySelector('.news-container');
    if (!container || !window.MustAPI) return;

    const BASE_URL =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5184'
            : 'https://must.runasp.net';

    function fixImage(img) {
        if (!img) return 'img/news5.jpg';

        img = img.trim();

        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return BASE_URL + img;

        return BASE_URL + '/uploads/news/' + img;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function initAllNews() {
        window.MustAPI.getNews()
            .then(function (data) {
                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = '<p style="text-align:center">No News Available</p>';
                    return;
                }

                container.innerHTML = '';

                const fragment = document.createDocumentFragment();

                data.forEach(function (item, index) {
                    let img = fixImage(item.imageUrl || item.image);
                    img += '?v=' + (item.id || index);

                    const date = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : '';

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.cursor = 'pointer';

                    card.innerHTML = `
                        <img src="${img}"
                             alt="${escapeHtml(item.title)}"
                             onerror="this.src='img/news5.jpg'">

                        <div class="card-content">
                            <div class="meta">
                                <span><i class="fa-regular fa-user"></i> MUST Admin</span>
                                ${date ? `<span><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}
                            </div>

                            <h3>${escapeHtml(item.title)}</h3>
                        </div>
                    `;

                    card.addEventListener('click', function () {
                        window.location.href = `news-details.html?id=${item.id}`;
                    });

                    fragment.appendChild(card);
                });

                container.appendChild(fragment);
            })
            .catch(function (err) {
                console.error('News API error:', err);
                container.innerHTML = '<p style="text-align:center">Failed to load news.</p>';
            });
    }

    initAllNews();
})();
