(function () {
    const container = document.getElementById('newsContainer');
    if (!container || !window.MustAPI) return;

    const BASE_URL = "https://mystudentactivity.runasp.net";

    let newsCache = [];

    function fixImage(img) {
        if (!img) return 'img/news5.jpg';

        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return BASE_URL + img;

        return BASE_URL + '/uploads/news/' + img;
    }

    function openModal(item) {
        const modal = document.getElementById('newsModal');
        const img = document.getElementById('newsModalImg');
        const title = document.getElementById('newsModalTitle');
        const desc = document.getElementById('newsModalDesc');
        const date = document.getElementById('newsModalDate');

        // 🔥 fetch أحدث نسخة من السيرفر
        fetch(`${BASE_URL}/api/News/${item.id}`)
            .then(res => res.json())
            .then(data => {

                let image = fixImage(data.imageUrl || data.image);
                image += "?v=" + Date.now(); // منع الكاش

                img.src = image;
                title.innerText = data.title || '';
                desc.innerText = data.description || data.content || '';
                date.innerText = data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString()
                    : '';

                modal.style.display = "flex";
            })
            .catch(err => console.error(err));
    }

    function closeModal() {
        document.getElementById('newsModal').style.display = "none";
    }

    window.closeNewsModal = closeModal;

    function loadNews() {
        window.MustAPI.getNews()
            .then(data => {
                if (!Array.isArray(data)) return;

                newsCache = data;
                container.innerHTML = '';

                const fragment = document.createDocumentFragment();

                data.forEach(item => {

                    let img = fixImage(item.imageUrl || item.image);
                    img += "?v=" + item.id;

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.cursor = 'pointer';

                    card.innerHTML = `
                        <img src="${img}" onerror="this.src='img/news5.jpg'">
                        <div class="card-content">
                            <h3>${item.title || ''}</h3>
                        </div>
                    `;

                    // 🔥 مهم: فتح المودال مش تحويل صفحة
                    card.addEventListener('click', function () {
                        openModal(item);
                    });

                    fragment.appendChild(card);
                });

                container.appendChild(fragment);
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = "<p>Failed to load news</p>";
            });
    }

    loadNews();
})();