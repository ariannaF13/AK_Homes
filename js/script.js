


async function loadComponent(id, file){
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}


loadComponent("header", "header.html")
loadComponent("footer", "footer.html")




const monthYear = document.getElementById('monthYear');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function renderCalendar(date) {
    calendarGrid.innerHTML = '';
    monthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Day names
    dayNames.forEach(day => {
        const div = document.createElement('div');
        div.classList.add('day-name');
        div.textContent = day;
        calendarGrid.appendChild(div);
    });

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Empty slots before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day');
        calendarGrid.appendChild(emptyDiv);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${day}`;
        if (events[dateKey]) {
            const dot = document.createElement('div');
            dot.classList.add('event-dot');
            dayDiv.appendChild(dot);
        }

        dayDiv.addEventListener('click', () => {
            const eventText = prompt(`Enter request for ${day}/${date.getMonth()+1}/${date.getFullYear()}:`, events[dateKey] || '');
            if (eventText !== null) {
                if (eventText.trim() === '') {
                    delete events[dateKey];
                } else {
                    events[dateKey] = eventText.trim();
                }
                localStorage.setItem('calendarEvents', JSON.stringify(events));
                renderCalendar(currentDate);
            }
        });

        calendarGrid.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);