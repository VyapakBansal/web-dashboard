document.addEventListener("DOMContentLoaded", () => {
    const calendarSection = document.querySelector(".calendar");
    const calendarGrid = document.getElementById("calendar-grid");
    let allEvents = [];
    let eventsByDate = {};
    let currentMonth, currentYear;
    let eventsListNode = null;

    function formatDateTime(iso) {
        const date = new Date(iso);
        return date.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDateKey(date) {
        // Returns YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }

    function groupEventsByDate(events) {
        const map = {};
        for (const event of events) {
            const dateKey = formatDateKey(new Date(event.start));
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(event);
        }
        return map;
    }

    function clearEventsList() {
        if (eventsListNode) {
            eventsListNode.remove();
            eventsListNode = null;
        }
    }

    function showEventsForDate(dateKey) {
        clearEventsList();
        const events = eventsByDate[dateKey] || [];
        const list = document.createElement("ul");
        list.style.listStyle = "none";
        list.style.padding = "0";
        list.style.marginTop = "10px";
        if (events.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No events for this day.";
            list.appendChild(li);
        } else {
            for (const event of events) {
                const li = document.createElement("li");
                li.style.marginBottom = "8px";
                li.innerHTML = `<strong>${event.summary}</strong><br><small>${formatDateTime(event.start)}</small>`;
                list.appendChild(li);
            }
        }
        calendarSection.appendChild(list);
        eventsListNode = list;
    }

    function generateCalendarGrid(year, month) {
        console.log('Generating calendar grid for', year, month);
        calendarGrid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // Fill in days from previous month
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.classList.add("calendar-day", "other-month");
            calendarGrid.appendChild(empty);
        }
        // Fill in days of this month
        for (let d = 1; d <= daysInMonth; d++) {
            const day = document.createElement("div");
            day.className = "calendar-day";
            const dateObj = new Date(year, month, d);
            const dateKey = formatDateKey(dateObj);
            day.textContent = d;
            // Add event indicator if events exist for this day
            if (eventsByDate[dateKey]) {
                const badge = document.createElement("span");
                badge.textContent = eventsByDate[dateKey].length;
                badge.style.background = "#00d4ff";
                badge.style.color = "#fff";
                badge.style.fontSize = "0.8em";
                badge.style.borderRadius = "50%";
                badge.style.padding = "2px 7px";
                badge.style.marginLeft = "6px";
                badge.style.verticalAlign = "top";
                badge.style.fontWeight = "bold";
                badge.style.boxShadow = "0 0 4px #00d4ff";
                badge.title = eventsByDate[dateKey].length + ' event(s)';
                day.appendChild(badge);
                console.log('Badge for', dateKey, 'with', eventsByDate[dateKey].length, 'events');
            }
            day.addEventListener("click", () => {
                console.log('Clicked day', dateKey);
                showEventsForDate(dateKey);
            });
            calendarGrid.appendChild(day);
        }
    }

    async function fetchEventsAndRenderCalendar() {
        try {
            const res = await fetch("/events");
            allEvents = await res.json();
            console.log('Fetched events:', allEvents);
            eventsByDate = groupEventsByDate(allEvents);
            console.log('Events by date:', eventsByDate);
            const now = new Date();
            currentMonth = now.getMonth();
            currentYear = now.getFullYear();
            generateCalendarGrid(currentYear, currentMonth);
            // Show today's events by default
            showEventsForDate(formatDateKey(now));
        } catch (err) {
            console.error("Failed to fetch events:", err);
        }
    }

    document.getElementById("prev-month").addEventListener("click", () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        generateCalendarGrid(currentYear, currentMonth);
        clearEventsList();
    });
    document.getElementById("next-month").addEventListener("click", () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        generateCalendarGrid(currentYear, currentMonth);
        clearEventsList();
    });

    fetchEventsAndRenderCalendar();
});
