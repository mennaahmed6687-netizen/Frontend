document.addEventListener("DOMContentLoaded", async function () {

    const container = document.querySelector(".activities-grid");
    if (!container || !window.MustAPI) return;

    const BASE_URL = "https://mystudentactivity.runasp.net";

    function fixImage(img) {
        if (!img) return "img/OIP.webp";

        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return BASE_URL + img;

        return BASE_URL + "/uploads/activity-categories/" + img;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    try {
        const categories = await window.MustAPI.getActivityCategories();

        if (!Array.isArray(categories) || categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    No Activity Categories Found
                </div>
            `;
            return;
        }

        container.innerHTML = "";

        categories.forEach(category => {

            const imgUrl = fixImage(category.imageUrl || category.image);

            const desc = category.description
                ? category.description.length > 120
                    ? category.description.slice(0, 120) + "..."
                    : category.description
                : "Explore activities in this category.";

            const categoryUrl =
                `activity-category.html?categoryId=${category.id}&name=${encodeURIComponent(category.name || "")}`;

            const card = document.createElement("div");
            card.className = "activity-card";

            card.innerHTML = `
                <img src="${imgUrl}" 
                     alt="${escapeHtml(category.name)}"
                     onerror="this.src='img/OIP.webp'">

                <div class="activity-body">
                    <h3>${escapeHtml(category.name)}</h3>
                    <p>${escapeHtml(desc)}</p>

                    <div class="activity-actions">
                        <a class="btn btn-secondary" href="${categoryUrl}">
                            Explore
                        </a>

                        <a class="btn btn-primary" href="${categoryUrl}">
                            View
                        </a>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading categories:", err);

        container.innerHTML = `
            <div class="empty-state">
                Failed to load categories
            </div>
        `;
    }
});