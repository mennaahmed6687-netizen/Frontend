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
        const categories = await window.MustAPI.getActivityCategories();
        const activities = await window.MustAPI.getActivities();

        if (!categories.length || !activities.length) {
            container.innerHTML = `<div class="empty-state">No data found</div>`;
            return;
        }

        container.innerHTML = "";

        categories.forEach(category => {

            // 👇 عنوان الـ Category
            const title = document.createElement("h2");
            title.style.gridColumn = "1 / -1";
            title.style.margin = "30px 0 10px";
            title.style.color = "rgb(28,48,110)";
            title.textContent = category.name;

            container.appendChild(title);

            // 👇 فلترة الـ activities حسب categoryId (ID matching)
            const filteredActivities = activities.filter(activity =>
                Number(activity.categoryId) === Number(category.id)
            );

            // لو مفيش Activities
            if (filteredActivities.length === 0) {
                const empty = document.createElement("p");
                empty.style.gridColumn = "1 / -1";
                empty.style.color = "#888";
                empty.textContent = "No activities in this category";
                container.appendChild(empty);
                return;
            }

            // 👇 عرض Activities
            filteredActivities.forEach(activity => {

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