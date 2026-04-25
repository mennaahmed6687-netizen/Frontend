(function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const BASE_URL = "https://mystudentactivity.runasp.net";

    function fixImage(img) {
        if (!img) return "img/news5.jpg";

        if (img.startsWith("http")) return img;
        if (img.startsWith("/")) return BASE_URL + img;

        return BASE_URL + "/uploads/news/" + img;
    }

    fetch(`${BASE_URL}/api/News/${id}`)
        .then(res => res.json())
        .then(data => {

            let img = fixImage(data.imageUrl || data.image);

            // 🔥 مهم جدًا لكسر الكاش
            img += "?v=" + (data.id || Date.now());

            document.getElementById("newsImg").src = img;
            document.getElementById("newsTitle").innerText = data.title;
            document.getElementById("newsDesc").innerText = data.description || data.content;

        })
        .catch(err => console.error(err));

})();