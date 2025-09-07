document.addEventListener("DOMContentLoaded", () => {
    // ---------------- CLOCK + DATE ----------------
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById("current-time").textContent = time;
        document.getElementById("current-date").textContent = date;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ---------------- CALENDAR GENERATION ----------------
    function generateCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendarGrid = document.getElementById("calendar-grid");
        calendarGrid.innerHTML = "";

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.classList.add("calendar-day", "other-month");
            calendarGrid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const day = document.createElement("div");
            day.className = "calendar-day";
            if (d === now.getDate()) day.classList.add("today");
            day.textContent = d;
            calendarGrid.appendChild(day);
        }

        document.getElementById("calendar-month-year").textContent = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    generateCalendar();

    // ---------------- POSTER GENERATION ----------------
    function generateMoviePoster(title, width = 200, height = 300) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add some geometric shapes for visual interest
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, 20);
        ctx.fillRect(0, height - 20, width, 20);

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        
        // Word wrap for long titles
        const words = title.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width - 20 && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);

        // Draw text lines
        const startY = height / 2 - (lines.length * 10);
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + (index * 20));
        });

        // Add a film strip effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < height; i += 40) {
            ctx.fillRect(0, i, 10, 20);
            ctx.fillRect(width - 10, i, 10, 20);
        }

        return canvas.toDataURL();
    }

    // ---------------- OMDB API (Alternative) ----------------
    async function fetchPoster(title) {
        try {
            // OMDB API key
            const apiKey = 'bcc89d7d';
            const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
            const data = await response.json();
            
            if (data.Poster && data.Poster !== 'N/A') {
                return data.Poster;
            }
            
            // Fallback to generated poster if no poster found
            return generateMoviePoster(title);
        } catch (error) {
            console.error("Poster fetch error:", error);
            return generateMoviePoster(title);
        }
    }

    // ---------------- DASHBOARD STATE ----------------
    let nowWatching = [];
    try {
        const saved = localStorage.getItem('nowWatching');
        if (saved) {
            nowWatching = JSON.parse(saved);
        } else {
            nowWatching = [{
                title: "Brooklyn Nine-Nine",
                season: 4,
                episode: 10,
                totalSeasons: 8,
                episodesInSeason: 22,
                isMovie: false,
                url: "https://hdtodayz.to/tv/watch-brooklyn-ninenine-hd-39530"
            }];
        }
    } catch (e) {
        nowWatching = [{
            title: "Brooklyn Nine-Nine",
            season: 4,
            episode: 10,
            totalSeasons: 8,
            episodesInSeason: 22,
            isMovie: false,
            url: "https://hdtodayz.to/tv/watch-brooklyn-ninenine-hd-39530"
        }];
    }

    let watchlist = [
        { title: "Sherlock", url: "https://www.netflix.com/title/70202589" },
        { title: "The Brutalist", url: "https://www.imdb.com/title/tt14849194/" },
        { title: "Gotham", url: "https://www.netflix.com/title/80020542" },
        { title: "My Fault", url: "https://www.primevideo.com/detail/0KRGHGZKQFJ8Q1QF8Q1QF8Q1QF" }
    ];

    function saveNowWatching() {
        localStorage.setItem('nowWatching', JSON.stringify(nowWatching));
    }

    function saveWatchlist() {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }

    // ---------------- UI UPDATE FUNCTIONS ----------------
    async function renderNowWatching() {
        const info = nowWatching[nowWatching.length - 1];
        const poster = await fetchPoster(info.title);
        document.getElementById("current-title").textContent = info.title;
        document.getElementById("current-description").textContent = info.isMovie
            ? "Movie currently being watched."
            : `Season ${info.season} - Episode ${info.episode}`;
        const posterImg = document.getElementById("current-poster");
        posterImg.src = poster;
        posterImg.style.display = 'block';
        // Add error handler for poster
        posterImg.onerror = () => {
            posterImg.src = generateMoviePoster(info.title);
        };
        // Make poster clickable if URL exists (always set, not just on error)
        if (info.url) {
            posterImg.style.cursor = 'pointer';
            posterImg.onclick = () => {
                window.open(info.url, '_blank');
            };
        } else {
            posterImg.style.cursor = 'default';
            posterImg.onclick = null;
        }
    }

    async function renderWatchlist() {
        const container = document.getElementById("watchlist-items");
        container.innerHTML = "";
        
        for (const item of watchlist) {
            const poster = await fetchPoster(item.title);
            const node = document.createElement("div");
            node.className = "watchlist-item";
            node.draggable = true;
            node.dataset.title = item.title;
            node.innerHTML = `
                <div class="watchlist-poster">
                    <img src="${poster}" alt="${item.title}" class="mini-poster" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="watchlist-info">
                    <h4>${item.title}</h4>
                </div>
                <div class="watchlist-actions">
                    <button class="btn watch-now-btn" data-title="${item.title}" data-url="${item.url ? item.url : ''}">Watch Now</button>
                    <button class="btn remove-btn" data-title="${item.title}">Remove</button>
                </div>`;
            
            // Add error handler for mini poster
            const miniPoster = node.querySelector('.mini-poster');
            miniPoster.onerror = () => {
                miniPoster.src = generateMoviePoster(item.title, 50, 75);
            };
            
            node.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", item.title);
            });
            container.appendChild(node);
        }
    }

    // ---------------- DRAG AND DROP ----------------
    const nowWatchSection = document.querySelector(".now-watching-content");
    nowWatchSection.addEventListener("dragover", e => e.preventDefault());
    nowWatchSection.addEventListener("drop", async e => {
        const title = e.dataTransfer.getData("text/plain");
        // Find the dragged show in the watchlist
        const dragged = watchlist.find(w => w.title === title);
        if (dragged) {
            // Push the dragged show to nowWatching (it becomes current)
            nowWatching.push({
                title: dragged.title,
                season: 1,
                episode: 1,
                totalSeasons: 1,
                isMovie: true,
                url: dragged.url || ""
            });
            saveNowWatching();
            // Remove from watchlist
            watchlist = watchlist.filter(w => w.title !== title);
            saveWatchlist();
            await renderNowWatching();
            await renderWatchlist();
        }
    });

    // ---------------- WATCH NOW BUTTONS ----------------
    document.getElementById("watchlist-items").addEventListener("click", async (e) => {
        if (e.target.classList.contains("watch-now-btn")) {
            const url = e.target.getAttribute("data-url");
            if (url) {
                window.open(url, "_blank");
            } else {
                alert("No website link available for this show/movie.");
            }
            return;
        }
        
        if (e.target.classList.contains("remove-btn")) {
            const title = e.target.dataset.title;
            watchlist = watchlist.filter(w => w.title !== title);
            await renderWatchlist();
        }
    });

    // ---------------- MODAL HANDLING ----------------
    const addShowModal = document.getElementById("add-show-modal");
    const addToWatchlistBtn = document.getElementById("add-to-watchlist");
    const closeAddModal = document.getElementById("close-add-modal");
    const cancelAddBtn = document.getElementById("cancel-add");
    const addShowForm = document.getElementById("add-show-form");

    addToWatchlistBtn?.addEventListener("click", () => {
        try {
            addShowModal.classList.add("active");
        } catch (err) {
            console.error('Error opening Add Show modal:', err);
        }
    });

    closeAddModal?.addEventListener("click", () => {
        try {
            addShowModal.classList.remove("active");
        } catch (err) {
            console.error('Error closing Add Show modal:', err);
        }
    });

    cancelAddBtn?.addEventListener("click", () => {
        try {
            addShowModal.classList.remove("active");
        } catch (err) {
            console.error('Error canceling Add Show modal:', err);
        }
    });

    // Show/hide series fields in Add Show modal
    const showTypeSelect = document.getElementById('show-type');
    const seriesFields = document.getElementById('series-fields');
    if (showTypeSelect && seriesFields) {
        showTypeSelect.addEventListener('change', function() {
            if (this.value === 'tv') {
                seriesFields.style.display = '';
            } else {
                seriesFields.style.display = 'none';
            }
        });
    }

    addShowForm?.addEventListener("submit", async (e) => {
        try {
            e.preventDefault();
            const formData = new FormData(e.target);
            const title = formData.get("title");
            const type = formData.get("type");
            const link = formData.get("link");
            let newItem = { title, url: link };
            if (type === 'tv') {
                newItem.isMovie = false;
                newItem.season = parseInt(formData.get('season')) || 1;
                newItem.episode = parseInt(formData.get('episode')) || 1;
                newItem.totalSeasons = parseInt(formData.get('totalSeasons')) || 1;
                newItem.episodesInSeason = parseInt(formData.get('episodesInSeason')) || 1;
            } else {
                newItem.isMovie = true;
            }
            watchlist.push(newItem);
            saveWatchlist();
            stats.watchlistCount = watchlist.length;
            saveStats();
            updateStatsUI();
            await renderWatchlist();
            addShowModal.classList.remove("active");
            e.target.reset();
            if (seriesFields) seriesFields.style.display = 'none';
            console.log('Added new item to watchlist:', newItem);
        } catch (err) {
            console.error('Error adding show/movie to watchlist:', err);
        }
    });

    // ---------------- NOTIFICATIONS STATE ----------------
    let notifications = [];
    try {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            notifications = JSON.parse(saved);
        } else {
            notifications = [
                { icon: 'fa-tv', title: 'New Episodes Available', text: 'The Bear Season 3 - Episode 5 is now streaming', badge: 3 },
                { icon: 'fa-star', title: 'Recommendations', text: 'Based on your viewing history, you might like...', badge: 5 },
                { icon: 'fa-clock', title: 'Reminders', text: 'Don\'t forget to continue watching Breaking Bad', badge: 1 }
            ];
        }
    } catch (e) {
        notifications = [
            { icon: 'fa-tv', title: 'New Episodes Available', text: 'The Bear Season 3 - Episode 5 is now streaming', badge: 3 },
            { icon: 'fa-star', title: 'Recommendations', text: 'Based on your viewing history, you might like...', badge: 5 },
            { icon: 'fa-clock', title: 'Reminders', text: 'Don\'t forget to continue watching Breaking Bad', badge: 1 }
        ];
    }

    function saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    function renderNotifications() {
        const container = document.querySelector('.messages-content');
        container.innerHTML = '';
        if (notifications.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'message-item';
            empty.innerHTML = '<div class="message-info"><div><h4>No Notifications</h4><p>You\'re all caught up!</p></div></div>';
            container.appendChild(empty);
            return;
        }
        for (const n of notifications) {
            const node = document.createElement('div');
            node.className = 'message-item';
            node.innerHTML = `
                <div class="message-info">
                    <i class="fas ${n.icon} message-icon"></i>
                    <div>
                        <h4>${n.title}</h4>
                        <p>${n.text}</p>
                    </div>
                </div>
                <div class="message-badge">${n.badge}</div>
            `;
            node.addEventListener('click', function() {
                notifications = notifications.filter(notification => notification !== n);
                saveNotifications();
                renderNotifications();
            });
            container.appendChild(node);
        }
    }

    // Notification timer persistence
    function getNotificationState() {
        const state = localStorage.getItem('notificationState');
        return state ? JSON.parse(state) : { lastTime: Date.now(), index: 0 };
    }
    function setNotificationState(state) {
        localStorage.setItem('notificationState', JSON.stringify(state));
    }

    function getRandomNotification() {
        const pool = [
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'You have a new connection request', badge: 1 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'You have a new follower', badge: 1 },
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'A job matching your profile was posted', badge: 2 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'Someone liked your post', badge: 1 },
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'You received a new message', badge: 1 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'You have a new comment', badge: 1 },
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'Content: New endorsement received', badge: 1 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'Content: Story view from a new user', badge: 1 },
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'Content: Profile view alert', badge: 1 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'Content: Mentioned in a comment', badge: 1 },
            { icon: 'fa-linkedin', title: 'LinkedIn', text: 'Content: New group invitation', badge: 1 },
            { icon: 'fa-instagram', title: 'Instagram', text: 'Content: Tagged in a photo', badge: 1 }
        ];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    let notificationTimer = null;
    function startNotificationTimer() {
        if (notificationTimer) clearInterval(notificationTimer);
        let state = getNotificationState();
        // Calculate time until next notification
        const interval = 20 * 60 * 1000; // 20 minutes
        let now = Date.now();
        let timeSinceLast = now - state.lastTime;
        let timeToNext = interval - (timeSinceLast % interval);
        // Add missed notifications if any
        let missed = Math.floor(timeSinceLast / interval);
        for (let i = 0; i < missed; i++) {
            notifications.push(getRandomNotification());
        }
        if (missed > 0) {
            saveNotifications();
            renderNotifications();
            state.lastTime = now - (timeSinceLast % interval);
            setNotificationState(state);
        }
        // Schedule next notification
        notificationTimer = setTimeout(function tick() {
            notifications.push(getRandomNotification());
            saveNotifications();
            renderNotifications();
            state.lastTime = Date.now();
            setNotificationState(state);
            notificationTimer = setTimeout(tick, interval);
        }, timeToNext);
    }

    async function fetchNotifications() {
        // Do not clear notifications on page load
        if (!Array.isArray(notifications)) notifications = [];
        renderNotifications();
        startNotificationTimer();
    }

    // ---------------- STATS STATE ----------------
    let stats = {
        showsWatched: 17,
        showsWatchedThisMonth: 10,
        hoursWatched: 42,
        hoursWatchedThisMonth: 42,
        watchlistCount: watchlist.length,
        lastMonth: new Date().getMonth(),
    };
    try {
        const saved = localStorage.getItem('stats');
        if (saved) {
            stats = JSON.parse(saved);
        }
        // Force-update hours watched
        stats.hoursWatched = 42;
        stats.hoursWatchedThisMonth = 42;
        saveStats();
    } catch (e) {}

    function saveStats() {
        localStorage.setItem('stats', JSON.stringify(stats));
    }

    function updateStatsUI() {
        document.getElementById('shows-watched').textContent = stats.showsWatched;
        document.getElementById('hours-watched').textContent = stats.hoursWatched;
        document.getElementById('watchlist-count').textContent = stats.watchlistCount;
        // Update monthly changes
        const month = new Date().getMonth();
        if (stats.lastMonth !== month) {
            stats.showsWatchedThisMonth = 0;
            stats.hoursWatchedThisMonth = 0;
            stats.lastMonth = month;
            saveStats();
        }
        // Find the stat-change elements
        const statChanges = document.querySelectorAll('.stat-change');
        if (statChanges.length >= 3) {
            statChanges[0].textContent = `+${stats.showsWatchedThisMonth} this month`;
            statChanges[1].textContent = `+${stats.hoursWatchedThisMonth} this month`;
            statChanges[2].textContent = stats.watchlistCount === 0 ? 'No shows' : 'Updated';
        }
    }

    // ---------------- INIT ----------------
    renderNowWatching();
    renderWatchlist();
    fetchNotifications();
    updateStatsUI();

    document.getElementById("watch-now-current").addEventListener("click", function() {
        const info = nowWatching[nowWatching.length - 1];
        if (info.url) {
            window.open(info.url, "_blank");
        } else {
            alert("No website link available for this show/movie.");
        }
    });

    // Update stats on Mark as Finished
    const origAddToFinished = document.getElementById("add-to-finished").onclick;
    document.getElementById("add-to-finished").addEventListener("click", function() {
        if (nowWatching.length > 0) {
            const finished = nowWatching[nowWatching.length - 1];
            // Count episodes for series or 1 for movie
            let episodes = finished.isMovie ? 1 : (finished.totalSeasons || 1) * (finished.episodesInSeason || 1);
            stats.showsWatched++;
            stats.showsWatchedThisMonth++;
            stats.hoursWatched += episodes * 25 / 60;
            stats.hoursWatchedThisMonth += episodes * 25 / 60;
            saveStats();
            updateStatsUI();
        }
        if (typeof origAddToFinished === 'function') origAddToFinished();
    });

    // Update stats on drag from watchlist to now watching
    const origDrop = nowWatchSection.ondrop;
    nowWatchSection.addEventListener("drop", async e => {
        const title = e.dataTransfer.getData("text/plain");
        const dragged = watchlist.find(w => w.title === title);
        if (dragged) {
            stats.watchlistCount = watchlist.length - 1;
            saveStats();
            updateStatsUI();
        }
        if (typeof origDrop === 'function') origDrop(e);
    });

    // Update stats on add/remove from watchlist
    const origRenderWatchlist = renderWatchlist;
    renderWatchlist = async function() {
        stats.watchlistCount = watchlist.length;
        saveStats();
        updateStatsUI();
        await origRenderWatchlist.apply(this, arguments);
    };

    // Update stats on add to watchlist
    const origAddShowForm = addShowForm?.onsubmit;
    addShowForm?.addEventListener("submit", async (e) => {
        setTimeout(() => {
            stats.watchlistCount = watchlist.length;
            saveStats();
            updateStatsUI();
        }, 0);
        if (typeof origAddShowForm === 'function') origAddShowForm(e);
    });

    // On page load
    updateStatsUI();

    // Modal logic for Change Now Watching
    const changeNowModal = document.getElementById('change-now-modal');
    const changeNowForm = document.getElementById('change-now-form');
    const closeChangeNowModal = document.getElementById('close-change-now-modal');
    const cancelChangeNowBtn = document.getElementById('cancel-change-now');
    const nowTypeSelect = document.getElementById('now-type');
    const nowSeriesFields = document.getElementById('now-series-fields');

    // Open modal on Change Show button
    const changeCurrentBtn = document.getElementById('change-current');
    if (changeCurrentBtn) {
        changeCurrentBtn.addEventListener('click', () => {
            changeNowModal.classList.add('active');
        });
    }
    // Close modal
    closeChangeNowModal?.addEventListener('click', () => changeNowModal.classList.remove('active'));
    cancelChangeNowBtn?.addEventListener('click', () => changeNowModal.classList.remove('active'));
    // Show/hide series fields
    nowTypeSelect?.addEventListener('change', function() {
        if (this.value === 'tv') {
            nowSeriesFields.style.display = '';
        } else {
            nowSeriesFields.style.display = 'none';
        }
    });
    // Handle submit
    changeNowForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const title = formData.get('title');
        const type = formData.get('type');
        const link = formData.get('link');
        let newEntry = { title, url: link };
        if (type === 'tv') {
            newEntry.isMovie = false;
            newEntry.season = parseInt(formData.get('season')) || 1;
            newEntry.episode = parseInt(formData.get('episode')) || 1;
            newEntry.totalSeasons = parseInt(formData.get('totalSeasons')) || 1;
            newEntry.episodesInSeason = parseInt(formData.get('episodesInSeason')) || 1;
        } else {
            newEntry.isMovie = true;
        }
        nowWatching.push(newEntry);
        saveNowWatching();
        await renderNowWatching();
        changeNowModal.classList.remove('active');
        e.target.reset();
        if (nowSeriesFields) nowSeriesFields.style.display = 'none';
    });

    // Update Mark All Read button logic
    const markAllReadBtn = document.getElementById("mark-all-read");
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener("click", function() {
            notifications = [];
            saveNotifications();
            renderNotifications();
            // Reset timer state
            setNotificationState({ lastTime: Date.now(), index: 0 });
            startNotificationTimer();
        });
    }

    // ---------------- QUICK ACTIONS ----------------
    // 1. Random Pick
    const randomPickBtn = document.getElementById('random-pick');
    if (randomPickBtn) {
        randomPickBtn.addEventListener('click', () => {
            const destinations = [
                // Social Media
                'https://www.linkedin.com',
                'https://www.reddit.com',
                'https://www.instagram.com',
                'https://www.facebook.com',
                'https://www.youtube.com',
                'https://www.pinterest.com',
                'https://twitter.com',
                // Articles
                'https://www.nytimes.com/section/technology',
                'https://www.bbc.com/news',
                'https://medium.com',
                'https://www.hackernoon.com',
                'https://news.ycombinator.com',
                'https://en.wikipedia.org/wiki/Special:Random',
                // Movie/Series Launches
                'https://www.imdb.com/chart/moviemeter/',
                'https://www.rottentomatoes.com/browse/movies_in_theaters/',
                'https://www.netflix.com/latest',
                'https://www.primevideo.com/',
                'https://www.hotstar.com/in',
                'https://www.disneyplus.com/',
                'https://www.hulu.com/hub/new-this-month',
            ];
            const url = destinations[Math.floor(Math.random() * destinations.length)];
            window.open(url, '_blank');
        });
    }

    // 2. Continue Watching
    const continueWatchingBtn = document.getElementById('continue-watching');
    if (continueWatchingBtn) {
        continueWatchingBtn.addEventListener('click', () => {
            const nowWatchingSection = document.querySelector('.now-watching');
            if (nowWatchingSection) {
                nowWatchingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                nowWatchingSection.classList.add('highlight-now-watching');
                setTimeout(() => nowWatchingSection.classList.remove('highlight-now-watching'), 1500);
            }
        });
    }

    // 3. Discover
    const discoverBtn = document.getElementById('discover-new');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', async () => {
            // Fetch recommendations from backend
            let recommendations = [];
            try {
                const res = await fetch('/api/recommendations');
                if (res.ok) {
                    recommendations = await res.json();
                } else {
                    throw new Error('Failed to fetch from backend');
                }
            } catch (e) {
                // Fallback mock data
                recommendations = [
                    { title: 'The Bear', genre: 'Drama', url: 'https://www.hulu.com/series/the-bear' },
                    { title: 'Fallout', genre: 'Sci-Fi', url: 'https://www.primevideo.com/detail/0QGQGQGQGQGQGQGQGQGQGQ' },
                    { title: 'Ripley', genre: 'Thriller', url: 'https://www.netflix.com/title/81464239' }
                ];
            }
            // Show modal
            let modal = document.getElementById('discover-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'discover-modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.7)';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.zIndex = '9999';
                modal.innerHTML = `<div style="background:#222;padding:32px 24px;border-radius:16px;max-width:400px;width:90%;color:#fff;position:relative;">
                    <button id="close-discover-modal" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;">&times;</button>
                    <h3 style="margin-bottom:16px;">Discover New Shows</h3>
                    <div id="discover-list"></div>
                </div>`;
                document.body.appendChild(modal);
                modal.querySelector('#close-discover-modal').onclick = () => modal.remove();
            }
            const list = modal.querySelector('#discover-list');
            list.innerHTML = '';
            recommendations.forEach(rec => {
                const item = document.createElement('div');
                item.style.marginBottom = '18px';
                item.innerHTML = `<strong>${rec.title}</strong> <span style="color:#aaa;">(${rec.genre})</span><br><button class="btn add-discover-watchlist">Add to Watchlist</button> <a href="${rec.url}" target="_blank" class="btn" style="margin-left:8px;">Details</a>`;
                item.querySelector('.add-discover-watchlist').onclick = () => {
                    watchlist.push({ title: rec.title, url: rec.url });
                    saveWatchlist();
                    renderWatchlist();
                    modal.remove();
                };
                list.appendChild(item);
            });
            modal.style.display = 'flex';
        });
    }

    // 4. Listen to Spotify
    const spotifyBtn = document.getElementById('my-reviews');
    if (spotifyBtn) {
        spotifyBtn.addEventListener('click', () => {
            // Try to open Spotify client
            window.location.href = 'spotify://';
            // Fallback to web after short delay
            setTimeout(() => {
                window.open('https://open.spotify.com', '_blank');
            }, 1200);
        });
    }

    // Manage List Modal
    const manageListBtn = document.getElementById('manage-watchlist');
    if (manageListBtn) {
        manageListBtn.addEventListener('click', () => {
            let modal = document.getElementById('manage-list-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'manage-list-modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(0,0,0,0.7)';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
                modal.style.zIndex = '9999';
                modal.innerHTML = `<div style="background:#222;padding:32px 24px;border-radius:16px;max-width:500px;width:95%;color:#fff;position:relative;max-height:80vh;overflow-y:auto;">
                    <button id="close-manage-list-modal" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#fff;font-size:1.5rem;cursor:pointer;">&times;</button>
                    <h3 style="margin-bottom:16px;">Manage Watchlist</h3>
                    <div id="manage-list-items"></div>
                </div>`;
                document.body.appendChild(modal);
                modal.querySelector('#close-manage-list-modal').onclick = () => modal.remove();
            }
            const list = modal.querySelector('#manage-list-items');
            list.innerHTML = '';
            watchlist.forEach((item, idx) => {
                const entry = document.createElement('div');
                entry.style.marginBottom = '18px';
                entry.style.padding = '12px';
                entry.style.background = '#191a2e';
                entry.style.borderRadius = '8px';
                entry.innerHTML = `
                    <strong>${item.title}</strong> <span style="color:#aaa;">${item.isMovie ? '(Movie)' : '(Series)'}</span><br>
                    <label>Link: <input type="text" value="${item.url || ''}" class="edit-link" style="width:220px;"></label>
                    <button class="btn remove-manage-item" style="margin-left:8px;">Remove</button>
                    <button class="btn save-manage-item" style="margin-left:8px;">Save</button>
                `;
                entry.querySelector('.remove-manage-item').onclick = () => {
                    watchlist.splice(idx, 1);
                    saveWatchlist();
                    stats.watchlistCount = watchlist.length;
                    saveStats();
                    updateStatsUI();
                    renderWatchlist();
                    modal.remove();
                };
                entry.querySelector('.save-manage-item').onclick = () => {
                    item.url = entry.querySelector('.edit-link').value;
                    saveWatchlist();
                    renderWatchlist();
                    modal.remove();
                };
                list.appendChild(entry);
            });
            modal.style.display = 'flex';
        });
    }
});