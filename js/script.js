async function loadComponent(id, file) {
    const res = await fetch(file);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

loadComponent("header", "header.html");
loadComponent("footer", "footer.html");


const monthYear = document.getElementById('monthYear');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let availability = [];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// Get available dates from the Flask API
async function loadAvailability() {
    const response = await fetch('/api/availability');

    if (!response.ok) {
        throw new Error('Could not load availability.');
    }

    availability = await response.json();

    renderCalendar(currentDate);
}


// Check whether a particular date is available
function isDateAvailable(dateKey) {
    return availability.some(item => item.date === dateKey);
}

function showRequestForm(dateKey) {

    const requestForm = document.getElementById('requestForm');
    const selectedDate = document.getElementById('selectedDate');

    const selectedAvailability = availability.find(
        item => item.date === dateKey
    );

    if (!selectedAvailability) {
        return;
    }

    selectedDate.textContent = `You are requesting ${dateKey}.`;

    // Remember which availability record the customer selected
    requestForm.dataset.availabilityId = selectedAvailability.id;

    requestForm.style.display = 'block';

    requestForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


function renderCalendar(date) {
    calendarGrid.innerHTML = '';

    monthYear.textContent = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    });


    // Day names
    dayNames.forEach(day => {
        const div = document.createElement('div');
        div.classList.add('day-name');
        div.textContent = day;
        calendarGrid.appendChild(div);
    });


    const firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    ).getDay();

    const daysInMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    ).getDate();


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


        // Create YYYY-MM-DD date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNumber = String(day).padStart(2, '0');

        const dateKey = `${year}-${month}-${dayNumber}`;


        // Check database availability
        if (isDateAvailable(dateKey)) {

            dayDiv.classList.add('available');

            dayDiv.addEventListener('click', () => {
                showRequestForm(dateKey);
            });
        }


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


// Load availability when the page starts
loadAvailability().catch(error => {
    console.error(error);
});