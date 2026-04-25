/**
 * MUST University API integration module.
 * This file contains the shared API helpers used across the frontend.
 */

const BASE_URL ="https://mystudentactivity.runasp.net"
  

function getToken() {
    return localStorage.getItem('must_token');
}

function saveToken(token) {
    localStorage.setItem('must_token', token);
}

function removeToken() {
    localStorage.removeItem('must_token');
    localStorage.removeItem('must_role');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function jsonRequest(method, path, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) Object.assign(headers, authHeaders());

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const text = await res.text();

    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (_) {
        data = text;
    }

    if (!res.ok) {
        const msg =
            (data && (data.message || data.title || JSON.stringify(data))) ||
            res.statusText;
        throw new Error(msg);
    }

    return data;
}

async function formRequest(method, path, formData, requiresAuth = false) {
    const headers = {};
    if (requiresAuth) Object.assign(headers, authHeaders());

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: formData
    });
    const text = await res.text();

    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (_) {
        data = text;
    }

    if (!res.ok) {
        const msg =
            (data && (data.message || data.title || JSON.stringify(data))) ||
            res.statusText;
        throw new Error(msg);
    }

    return data;
}

async function registerUser(firstName, lastName, email, password) {
    return jsonRequest('POST', '/api/Auth/register', {
        firstName,
        lastName,
        email,
        password
    });
}

async function verifyOtp(email, otpCode) {
    const data = await jsonRequest('POST', '/api/Auth/verify-otp', { email, otpCode });
    if (data && data.token) saveToken(data.token);
    return data;
}

async function loginUser(email, password) {
    const data = await jsonRequest('POST', '/api/Auth/login', { email, password });

    if (data && data.token) saveToken(data.token);
    else if (data && data.accessToken) saveToken(data.accessToken);
    else if (typeof data === 'string' && data.length > 20) saveToken(data);

    return data;
}

async function getEvents() {
    return jsonRequest('GET', '/api/Events');
}

async function getEventById(id) {
    return jsonRequest('GET', `/api/Events/${id}`);
}

async function createEvent(title, description, eventDate, location, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('EventDate', eventDate);
    fd.append('Location', location);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Events', fd, true);
}

async function updateEvent(id, title, description, eventDate, location, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('EventDate', eventDate);
    fd.append('Location', location);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Events/${id}`, fd, true);
}

async function deleteEvent(id) {
    return jsonRequest('DELETE', `/api/Events/${id}`, null, true);
}

async function getActivities() {
    return jsonRequest('GET', '/api/Activities');
}

async function getActivityById(id) {
    return jsonRequest('GET', `/api/Activities/${id}`);
}

async function getActivitiesByCategory(categoryId) {
    return jsonRequest('GET', `/api/Activities/Category/${categoryId}`);
}

async function getActivityCategories() {
    return jsonRequest('GET', '/api/ActivityCategories');
}

async function getActivityCategoryById(id) {
    return jsonRequest('GET', `/api/ActivityCategories/${id}`);
}

async function getClubs() {
    return jsonRequest('GET', '/api/Clubs');
}

async function createClub(name, description, file) {
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Description', description);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Clubs', fd, true);
}

async function updateClub(id, name, description, file) {
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Description', description);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Clubs/${id}`, fd, true);
}

async function deleteClub(id) {
    return jsonRequest('DELETE', `/api/Clubs/${id}`, null, true);
}

async function getCompetitions() {
    return jsonRequest('GET', '/api/Competitions');
}

async function createCompetition(title, description, registrationDeadline, startDate, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('RegistrationDeadline', registrationDeadline);
    fd.append('StartDate', startDate);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Competitions', fd, true);
}

async function updateCompetition(id, title, description, registrationDeadline, startDate, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('RegistrationDeadline', registrationDeadline);
    fd.append('StartDate', startDate);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Competitions/${id}`, fd, true);
}

async function deleteCompetition(id) {
    return jsonRequest('DELETE', `/api/Competitions/${id}`, null, true);
}

async function getNews() {
    return jsonRequest('GET', '/api/News');
}

async function getNewsById(id) {
    return jsonRequest('GET', `/api/News/${id}`);
}

async function createNews(file, title, content, createdAt) {
    const fd = new FormData();
    if (file) fd.append('File', file);
    fd.append('Title', title);
    fd.append('Content', content);
    if (createdAt) fd.append('CreatedAt', createdAt);
    return formRequest('POST', '/api/News', fd, true);
}

async function updateNews(id, file, title, content, existingImageUrl, createdAt) {
    const fd = new FormData();
    if (file) fd.append('File', file);
    fd.append('Title', title);
    fd.append('Content', content);
    if (existingImageUrl) fd.append('ExistingImageUrl', existingImageUrl);
    if (createdAt) fd.append('CreatedAt', createdAt);
    return formRequest('PUT', `/api/News/${id}`, fd, true);
}

async function deleteNews(id) {
    return jsonRequest('DELETE', `/api/News/${id}`, null, true);
}

async function sendContact(name, email, message) {
    return jsonRequest('POST', '/api/Contact', { name, email, message });
}

async function getContacts() {
    return jsonRequest('GET', '/api/Contact', null, true);
}

async function deleteContact(id) {
    return jsonRequest('DELETE', `/api/Contact/${id}`, null, true);
}

async function getSlider() {
    return jsonRequest('GET', '/api/Slider');
}

async function createSlider(file, title, subTitle, order) {
    const fd = new FormData();
    fd.append('Image', file);
    fd.append('Title', title);
    fd.append('SubTitle', subTitle);
    fd.append('Order', order);
    return formRequest('POST', '/api/Slider', fd, true);
}

async function toggleSlider(id) {
    return jsonRequest('PATCH', `/api/Slider/${id}/toggle`, null, true);
}

async function deleteSlider(id) {
    return jsonRequest('DELETE', `/api/Slider/${id}`, null, true);
}

async function getMenu() {
    return jsonRequest('GET', '/api/Menu');
}

async function getMenuById(id) {
    return jsonRequest('GET', `/api/Menu/${id}`);
}

async function createMenu(name, url, order, parentId = null) {
    return jsonRequest('POST', '/api/Menu', { name, url, order, parentId }, true);
}

async function updateMenu(id, name, url, order, parentId = null) {
    return jsonRequest('PUT', `/api/Menu/${id}`, { name, url, order, parentId }, true);
}

async function deleteMenu(id) {
    return jsonRequest('DELETE', `/api/Menu/${id}`, null, true);
}

async function getSettings() {
    return jsonRequest('GET', '/api/Settings');
}

async function updateSettings(settingsObj) {
    return jsonRequest('PUT', '/api/Settings', settingsObj, true);
}

window.MustAPI = {
    getToken,
    saveToken,
    removeToken,
    registerUser,
    verifyOtp,
    loginUser,
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getActivities,
    getActivityById,
    getActivitiesByCategory,
    getActivityCategories,
    getActivityCategoryById,
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    sendContact,
    getContacts,
    deleteContact,
    getSlider,
    createSlider,
    toggleSlider,
    deleteSlider,
    getMenu,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getSettings,
    updateSettings,
    getClubs,
    createClub,
    updateClub,
    deleteClub,
    getCompetitions,
    createCompetition,
    updateCompetition,
    deleteCompetition
};

window.joinClub = async function(clubId, participantData = {}) {
    if (!getToken()) {
        alert('Please login first');
        return;
    }

    return jsonRequest('POST', '/api/Participants/JoinClub', { itemId: clubId, ...participantData }, true)
        .then(res => {
            alert('Joined club successfully!');
            return res;
        })
        .catch(err => {
            alert(`Failed to join club: ${err.message}`);
            throw err;
        });
};

window.registerActivity = async function(activityId, participantData = {}) {
    if (!getToken()) {
        alert('Please login first');
        return;
    }

    return jsonRequest('POST', '/api/Participants/RegisterActivity', { itemId: activityId, ...participantData }, true)
        .then(res => {
            alert('Registered for activity successfully!');
            return res;
        })
        .catch(err => {
            alert(`Failed to register for activity: ${err.message}`);
            throw err;
        });
};

window.registerCompetition = async function(competitionId, participantData = {}) {
    if (!getToken()) {
        alert('Please login first');
        return;
    }

    return jsonRequest(
        'POST',
        '/api/Participants/RegisterCompetition',
        { itemId: competitionId, ...participantData },
        true
    )
        .then(res => {
            alert('Registered for competition successfully!');
            return res;
        })
        .catch(err => {
            alert(`Failed to register for competition: ${err.message}`);
            throw err;
        });
};

window.registerEvent = async function(eventId, participantData = {}) {
    if (!getToken()) {
        alert('Please login first');
        return;
    }

    return jsonRequest('POST', '/api/Participants/RegisterEvent', { itemId: eventId, ...participantData }, true)
        .then(res => {
            alert('Registered for event successfully!');
            return res;
        })
        .catch(err => {
            alert(`Failed to register for event: ${err.message}`);
            throw err;
        });
};

window.logout = function() {
    removeToken();
    window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const loginBtns = document.querySelectorAll('a[href*="login.html"]');
    const signupBtns = document.querySelectorAll('a[href*="signup.html"]');
    const navIcons = document.querySelector('.nav-icons');

    if (token) {
        loginBtns.forEach(btn => {
            btn.style.display = 'none';
        });
        signupBtns.forEach(btn => {
            btn.style.display = 'none';
        });

        const role = (localStorage.getItem('must_role') || '').toLowerCase();
        const dashboardBtn = document.getElementById('mustDashboardBtn');

        if (role === 'admin' && !dashboardBtn && navIcons) {
            const newDashboardBtn = document.createElement('a');
            newDashboardBtn.id = 'mustDashboardBtn';
            newDashboardBtn.href = 'admin/index.html';
            newDashboardBtn.className = 'btn-login';
            newDashboardBtn.innerHTML = '&#127968;';
            newDashboardBtn.title = 'Dashboard';
            newDashboardBtn.setAttribute('aria-label', 'Dashboard');
            navIcons.appendChild(newDashboardBtn);
        } else if (role !== 'admin' && dashboardBtn) {
            dashboardBtn.remove();
        }

        if (!document.getElementById('mustLogoutBtn') && navIcons) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'mustLogoutBtn';
            logoutBtn.href = '#';
            logoutBtn.className = 'btn-login';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', event => {
                event.preventDefault();
                logout();
            });
            navIcons.appendChild(logoutBtn);
        }
    } else {
        loginBtns.forEach(btn => {
            btn.style.display = 'inline-block';
        });
        signupBtns.forEach(btn => {
            btn.style.display = 'inline-block';
        });

        const dashboardBtn = document.getElementById('mustDashboardBtn');
        if (dashboardBtn) dashboardBtn.remove();

        const logoutBtn = document.getElementById('mustLogoutBtn');
        if (logoutBtn) logoutBtn.remove();
    }

    document.querySelectorAll('a').forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        const href = link.getAttribute('href');
        if (!href) return;

        if (!href.startsWith('#')) {
            if (text === 'home') link.href = 'index.html';
            else if (text.includes('activities')) link.href = 'index.html';
            else if (text.includes('events')) link.href = 'allEvents.html';
            else if (text.includes('news')) link.href = 'allNews.html';
            else if (text.includes('clubs')) link.href = 'clubs.html';
            else if (text.includes('contact')) link.href = 'index.html';
        }

        if (href === '#') {
            link.addEventListener('click', event => {
                if (!link.querySelector('.fa-angle-down')) {
                    event.preventDefault();
                }
            });
        }
    });
});
