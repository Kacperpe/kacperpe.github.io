// calendar.js - renders a 3-month calendar based on timetable entries in localStorage
(function () {
    const STORAGE_KEY = "timetableEvents_v1";
    const LEGACY_KEY = "timetableEvents_v2";

    function initCalendar() {
        const calendarPrevEl = document.getElementById("calendarPrev");
        const calendarCurrEl = document.getElementById("calendarCurr");
        const calendarNextEl = document.getElementById("calendarNext");
        const calTitle = document.getElementById("calTitle");
        const calTitlePrev = document.getElementById("calTitlePrev");
        const calTitleCurr = document.getElementById("calTitleCurr");
        const calTitleNext = document.getElementById("calTitleNext");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const todayBtn = document.getElementById("todayBtn");
        const eventsContainer = document.getElementById("eventsContainer");

        if (!calendarPrevEl || !calendarCurrEl || !calendarNextEl || !calTitle || !eventsContainer) {
            return;
        }

        let viewDate = new Date();

        function loadEvents() {
            try {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
                if (Array.isArray(current) && current.length > 0) return current;
                const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
                return Array.isArray(legacy) ? legacy : [];
            } catch (error) {
                return [];
            }
        }

        function toIsoLocal(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return year + "-" + month + "-" + day;
        }

        function groupEventsByDate(events) {
            const map = new Map();
            for (const eventItem of events) {
                if (!eventItem || !eventItem.date) continue;
                if (!map.has(eventItem.date)) map.set(eventItem.date, []);
                map.get(eventItem.date).push(eventItem);
            }
            return map;
        }

        function startOfWeekDate(date) {
            const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const day = (copy.getDay() + 6) % 7;
            copy.setDate(copy.getDate() - day);
            return copy;
        }

        function renderMonth(container, year, month, byDate) {
            const firstOfMonth = new Date(year, month, 1);
            const start = startOfWeekDate(firstOfMonth);
            container.innerHTML = "";

            for (let i = 0; i < 42; i += 1) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                const iso = toIsoLocal(date);
                const dayEl = document.createElement("div");
                dayEl.className = "cal-day";

                if (date.getMonth() !== month) {
                    dayEl.classList.add("other-month");
                }
                if (iso === toIsoLocal(new Date())) {
                    dayEl.classList.add("today");
                }
                if (byDate.has(iso)) {
                    dayEl.classList.add("has-event");
                }

                const num = document.createElement("div");
                num.className = "date-num";
                num.textContent = String(date.getDate());
                dayEl.appendChild(num);

                dayEl.addEventListener("click", function () {
                    showEventsFor(iso, byDate.get(iso) || []);
                });
                container.appendChild(dayEl);
            }
        }

        function showEventsFor(dateIso, list) {
            if (!list.length) {
                eventsContainer.innerHTML = "<div>Brak wydarzen dla " + dateIso + ".</div>";
                return;
            }

            eventsContainer.innerHTML = "";
            for (const eventItem of list) {
                const item = document.createElement("div");
                item.className = "event-item";
                item.innerHTML = [
                    "<strong>" + escapeHtml(eventItem.title || "Wydarzenie") + "</strong>",
                    "<div>" + escapeHtml(eventItem.location || "") + "</div>",
                    "<div>" + escapeHtml(eventItem.notes || "") + "</div>"
                ].join("");
                eventsContainer.appendChild(item);
            }
        }

        function render() {
            const byDate = groupEventsByDate(loadEvents());
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();

            const prevDate = new Date(year, month - 1, 1);
            const nextDate = new Date(year, month + 1, 1);

            calTitle.textContent = viewDate.toLocaleString("pl-PL", { month: "long", year: "numeric" });
            calTitlePrev.textContent = prevDate.toLocaleString("pl-PL", { month: "short", year: "numeric" });
            calTitleCurr.textContent = viewDate.toLocaleString("pl-PL", { month: "short", year: "numeric" });
            calTitleNext.textContent = nextDate.toLocaleString("pl-PL", { month: "short", year: "numeric" });

            renderMonth(calendarPrevEl, prevDate.getFullYear(), prevDate.getMonth(), byDate);
            renderMonth(calendarCurrEl, year, month, byDate);
            renderMonth(calendarNextEl, nextDate.getFullYear(), nextDate.getMonth(), byDate);
        }

        function escapeHtml(value) {
            if (!value) return "";
            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
                render();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
                render();
            });
        }
        if (todayBtn) {
            todayBtn.addEventListener("click", function () {
                viewDate = new Date();
                render();
            });
        }

        window.addEventListener("storage", function (event) {
            if (event.key === STORAGE_KEY || event.key === LEGACY_KEY) {
                render();
            }
        });

        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCalendar);
    } else {
        initCalendar();
    }
})();
