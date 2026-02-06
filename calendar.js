// calendar.js â€” reads events from localStorage key 'timetableEvents_v1'
(function(){
    const STORAGE_KEY = 'timetableEvents_v1';

    function initCalendar(){
        const calendarPrevEl = document.getElementById('calendarPrev');
        const calendarCurrEl = document.getElementById('calendarCurr');
        const calendarNextEl = document.getElementById('calendarNext');
        const calTitle = document.getElementById('calTitle');
        const calTitlePrev = document.getElementById('calTitlePrev');
        const calTitleCurr = document.getElementById('calTitleCurr');
        const calTitleNext = document.getElementById('calTitleNext');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const todayBtn = document.getElementById('todayBtn');
        const eventsContainer = document.getElementById('eventsContainer');

        // If required elements are missing, do nothing â€” allows the script to be loaded on pages without the calendar
        if(!calendarPrevEl || !calendarCurrEl || !calendarNextEl || !calTitle || !eventsContainer) return;

        let viewDate = new Date(); // current month view

        function loadEvents(){
            try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
            catch(e){ return []; }
        }

        function groupEventsByDate(events){
            const map = new Map();
            for(const ev of events){
                // expect ev.date in YYYY-MM-DD format
                if(!ev || !ev.date) continue;
                const key = ev.date;
                if(!map.has(key)) map.set(key, []);
                map.get(key).push(ev);
            }
            return map;
        }

        function startOfWeekDate(d){
            const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const day = (copy.getDay() + 6) % 7; // convert Sun(0) -> 6, Mon(1) ->0
            copy.setDate(copy.getDate() - day);
            return copy;
        }

        function renderMonth(containerEl, year, month, byDate){
            // first visible day for that month: monday of week containing the 1st
            const firstOfMonth = new Date(year, month, 1);
            const start = startOfWeekDate(firstOfMonth);
            containerEl.innerHTML = '';
            const days = 42;
            for(let i=0;i<days;i++){
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const iso = d.toISOString().slice(0,10);
                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day';
                if(d.getMonth() !== month) dayEl.classList.add('other-month');
                if(iso === (new Date()).toISOString().slice(0,10)) dayEl.classList.add('today');

                const num = document.createElement('div');
                num.className = 'date-num';
                num.textContent = d.getDate();
                dayEl.appendChild(num);

                if(byDate.has(iso)){
                    dayEl.classList.add('has-event');
                    dayEl.dataset.eventCount = byDate.get(iso).length;
                }

                dayEl.dataset.date = iso;
                dayEl.addEventListener('click', ()=> showEventsFor(iso, byDate.get(iso) || []));
                containerEl.appendChild(dayEl);
            }
        }

        function render(){
            const events = loadEvents();
            const byDate = groupEventsByDate(events);

            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            // main header still shows current month label
            calTitle.textContent = viewDate.toLocaleString('pl-PL', { month:'long', year:'numeric' });

            // set mini titles for each month
            const prevDate = new Date(year, month-1, 1);
            const nextDate = new Date(year, month+1, 1);
            calTitlePrev.textContent = prevDate.toLocaleString('pl-PL', { month:'short', year:'numeric' });
            calTitleCurr.textContent = viewDate.toLocaleString('pl-PL', { month:'short', year:'numeric' });
            calTitleNext.textContent = nextDate.toLocaleString('pl-PL', { month:'short', year:'numeric' });

            // render three months
            renderMonth(calendarPrevEl, prevDate.getFullYear(), prevDate.getMonth(), byDate);
            renderMonth(calendarCurrEl, year, month, byDate);
            renderMonth(calendarNextEl, nextDate.getFullYear(), nextDate.getMonth(), byDate);
        }

        function showEventsFor(dateIso, list){
            if(!list || list.length===0){
                eventsContainer.innerHTML = `<div>Brak wydarzeĹ„ dla ${dateIso}</div>`;
                return;
            }
            eventsContainer.innerHTML = '';
            for(const ev of list){
                const el = document.createElement('div');
                el.className = 'event-item';
                el.innerHTML = `<strong>${escapeHtml(ev.title||'Wydarzenie')}</strong><div style="opacity:.9">${escapeHtml(ev.location||'')}</div><div style="opacity:.8;font-size:.9rem">${escapeHtml(ev.notes||'')}</div>`;
                eventsContainer.appendChild(el);
            }
        }

        function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        if(prevBtn) prevBtn.addEventListener('click', ()=>{ viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); render(); });
        if(nextBtn) nextBtn.addEventListener('click', ()=>{ viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); render(); });
        if(todayBtn) todayBtn.addEventListener('click', ()=>{ viewDate = new Date(); render(); });

        // initial render
        render();

        // also re-render when storage changes in other tabs
        window.addEventListener('storage', (e)=>{ if(e.key === STORAGE_KEY) render(); });
    }

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCalendar);
    else initCalendar();

})();
