document.addEventListener("DOMContentLoaded", async function () {

    const container = document.querySelector(".activities-grid");
    if (!container || !window.MustAPI) return;

    const BASE_URL = "https://mystudentactivity.runasp.net";

    function fixImage(img) {
        if (!img) return "img/OIP.webp";

        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return BASE_URL + img;

        return BASE_URL + "/uploads/activities/" + img;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    try {
        const [categories, activities] = await Promise.all([
            window.MustAPI.getActivityCategories(),
            window.MustAPI.getActivities()
        ]);

        if (!Array.isArray(categories) || !Array.isArray(activities)) {
            container.innerHTML = `<div class="empty-state">No data found</div>`;
            return;
        }

        container.innerHTML = "";

        categories.forEach(category => {

            // activities داخل نفس الكاتيجوري
            const filtered = activities.filter(
                a => a.categoryId === category.id
            );

            // لو مفيش activities
            if (filtered.length === 0) return;

            // عنوان الكاتيجوري
            const section = document.createElement("div");
            section.style.gridColumn = "1 / -1";
            section.style.margin = "20px 0 10px";
            section.innerHTML = `
                <h2 style="color: rgb(28,48,110);">
                    ${escapeHtml(category.name)}
                </h2>
            `;
            container.appendChild(section);

            // كروت الـ activities
            filtered.forEach(activity => {

                const imgUrl = fixImage(activity.imageUrl || activity.image);

                const card = document.createElement("div");
                card.className = "activity-card";

                card.innerHTML = `
                    <img src="${imgUrl}" 
                         alt="${escapeHtml(activity.title)}"
                         onerror="this.src='img/OIP.webp'">

                    <div class="activity-body">
                        <h3>${escapeHtml(activity.title)}</h3>
                        <p>${escapeHtml(activity.description || "")}</p>

                        <div class="activity-actions">
                            <a class="btn btn-secondary" href="activity-details.html?id=${activity.id}">
                                Explore
                            </a>
                            <a class="btn btn-primary" href="register.html?id=${activity.id}">
                                Register
                            </a>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="empty-state">Error loading data</div>`;
    }
});