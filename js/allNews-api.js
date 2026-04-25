(function () {
    'use strict';

    const container = document.getElementById("newsContainer");
    if (!container) return;

    const BASE_URL = "https://mystudentactivity.runasp.net";

    function fixImage(img) {
        if (!img) return "img/news5.jpg";

        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return BASE_URL + img;

        return BASE_URL + "/uploads/news/" + img;
    }

    // ================= LOAD NEWS =================
    function loadNews() {

        fetch(`${BASE_URL}/api/News`)
            .then(res => res.json())
            .then(data => {

                if (!Array.isArray(data) || data.length === 0) {
                    container.innerHTML = '<p style="text-align:center">No News</p>';
                    return;
                }

                container.innerHTML = "";

                data.forEach(item => {

                    let img = fixImage(item.imageUrl || item.image);
                    img += "?v=" + (item.id || Date.now());

                    const card = document.createElement("div");
                    card.className = "card";
                    card.style.cursor = "pointer";

                    card.innerHTML = `
                        <img src="${img}" onerror="this.src='img/news5.jpg'">
                        <h3>${item.title || ''}</h3>
                    `;

                    // 🔥 هنا أهم جزء
                    card.addEventListener("click", () => openNewsModal(item.id));

                    container.appendChild(card);
                });

            })
            .catch(err => console.error(err));
    }

    // ================= OPEN MODAL =================
    function openNewsModal(id) {

        fetch(`${BASE_URL}/api/News/${id}`)
            .then(res => res.json())
            .then(data => {

                let img = fixImage(data.imageUrl || data.image);

                // 🔥 كسر الكاش
                img += "?v=" + Date.now();

                document.getElementById("newsModalImg").src = img;
                document.getElementById("newsModalTitle").innerText = data.title || "";
                document.getElementById("newsModalDesc").innerText =
                    data.description || data.content || "";

                const modal = document.getElementById("newsModal");
                if (modal) modal.style.display = "flex";

            })
            .catch(err => console.error(err));
    }

    // ================= CLOSE =================
    window.closeNewsModal = function () {
        const modal = document.getElementById("newsModal");
        if (modal) modal.style.display = "none";
    };

    loadNews();

})();