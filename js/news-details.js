/**
 * news-details.js
 * 
 * Fetches specific news details from GET /api/News/{id}
 * and populates news-details.html.
 */

(function() {
    'use strict';

    const BASE_URL =
       "http://mystudentactivity.runasp.net";
    const API_URL = `${BASE_URL}/api/News`;

    // 1. Get ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    const newsImg = document.getElementById('newsImg');
    const newsTitle = document.getElementById('newsTitle');
    const newsDate = document.getElementById('newsDate');
    const newsContent = document.getElementById('newsContent');

    if (!newsId) {
        if (newsTitle) newsTitle.innerText = 'News not found';
        if (newsContent) newsContent.innerText = 'No news ID provided in the URL.';
        return;
    }

    // 2. Fetch specific news
    async function fetchNewsDetails() {
        try {
            const response = await fetch(`${API_URL}/${newsId}`);
            
            if (!response.ok) {
                throw new Error('News item not found or server error');
            }

            const item = await response.json();
            renderNews(item);

        } catch (error) {
            console.error('Error fetching news details:', error);
            if (newsTitle) newsTitle.innerText = 'Error';
            if (newsContent) newsContent.innerText = 'Could not load news content. Please try again later.';
        }
    }

    // 3. Render news data safely
    function renderNews(item) {
        if (!item) return;

        // Populate elements
        if (newsTitle) newsTitle.innerText = item.title || 'No Title';
        
        if (newsContent) {
            newsContent.textContent = item.content || item.description || 'No content available.';
        }

        if (newsDate) {
            const dateObj = item.createdAt ? new Date(item.createdAt) : null;
            newsDate.innerText = dateObj ? dateObj.toLocaleDateString() : 'N/A';
        }

        if (newsImg) {
            let imgSrc = item.imageUrl || item.image || 'img/news5.jpg';
            
            // Fix image path if it starts with "/"
            if (imgSrc.startsWith('/')) {
                imgSrc = BASE_URL + imgSrc;
            }
            
            newsImg.src = imgSrc;
        }

        // Set page title
        document.title = `${item.title || 'News Details'} - MUST Student Activities`;
    }

    // Initialize
    fetchNewsDetails();

})();
