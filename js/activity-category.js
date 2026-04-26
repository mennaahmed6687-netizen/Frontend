async function loadActivitiesGroupedByCategory() {
    const tableBody = document.getElementById("activitiesTable");
    if (!tableBody || !window.MustAPI) return;

    try {
        const activities = await window.MustAPI.getActivities();
        const categories = await window.MustAPI.getActivityCategories();

        console.log("Activities:", activities);
        console.log("Categories:", categories);

        if (!Array.isArray(activities) || !Array.isArray(categories)) {
            tableBody.innerHTML = "<tr><td colspan='6'>No data found</td></tr>";
            return;
        }

        let html = "";

        categories.forEach(category => {

            const categoryName = category.name || category.title || "Category";

            html += `
                <tr style="background:#f3f4f6;">
                    <td colspan="6">
                        <strong>📌 ${escapeHtml(categoryName)}</strong>
                    </td>
                </tr>
            `;

            const filtered = activities.filter(a =>
                String(a.categoryId) === String(category.id)
            );

            console.log("Category:", categoryName, "Activities:", filtered.length);

            if (!filtered.length) {
                html += `
                    <tr>
                        <td colspan="6" style="text-align:center;color:#888;">
                            No activities in this category
                        </td>
                    </tr>
                `;
                return;
            }

            filtered.forEach(activity => {

                let imgUrl = activity.imageUrl || activity.image || "";
                if (imgUrl && imgUrl.startsWith("/")) {
                    imgUrl = "https://mystudentactivity.runasp.net" + imgUrl;
                }
                if (!imgUrl) imgUrl = "img/OIP.webp";

                html += `
                    <tr>
                        <td>${activity.id}</td>

                        <td>
                            <img src="${imgUrl}"
                                 onerror="this.outerHTML='—'">
                        </td>

                        <td><strong>${escapeHtml(activity.title || "")}</strong></td>

                        <td>${escapeHtml((activity.description || "").substring(0, 80))}</td>

                        <td>${escapeHtml(categoryName)}</td>

                        <td>
                            <div class="actions">
                                <button class="btn btn-sm btn-edit" onclick="editActivity(${activity.id})">
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button class="btn btn-sm btn-delete" onclick="deleteActivity(${activity.id})">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        });

        tableBody.innerHTML = html;

    } catch (err) {
        console.error("Grouped Activities error:", err);
        tableBody.innerHTML = "<tr><td colspan='6'>Error loading data</td></tr>";
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

loadActivitiesGroupedByCategory();