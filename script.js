const timeBlocks = []; // Array to store time blocks
const table = document.querySelector('#schedule-table');
const fromInput = document.getElementById('visible-from-time');
const toInput = document.getElementById('visible-to-time');

document.addEventListener('DOMContentLoaded', async () => {
    fromInput.addEventListener('change', renderTable);
    toInput.addEventListener('change', renderTable);

    // Load saved blocks from the database
    await loadTimeBlocks();
    renderTable(); // Initial render
});

// ===================== LOAD SAVE DELETE TIME BLOCKS =========================
async function loadTimeBlocks() {
    try {
        const response = await fetch('/.netlify/functions/timeBlocks');
        if (!response.ok) throw new Error('Failed to fetch time blocks');

        timeBlocks.length = 0; // if we are reloading the array, we need an empty array
        const fetchedBlocks = await response.json();
        fetchedBlocks.forEach(block => {
            const timeBlock = {
                id: block.id,
                day: block.day,
                fromTime: formatTime(block.start_time),
                toTime: formatTime(block.end_time),
            };
            timeBlocks.push(timeBlock); // Push to the global array
        });
    } catch (error) {
        console.error('Error loading time blocks:', error);
    }
}

async function saveTimeBlock(block) {
    try {
        const response = await fetch('/.netlify/functions/timeBlocks', {
            method: block.id ? 'PUT' : 'POST', // Use PUT to update, POST to create
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(block),
        });
        if (!response.ok) throw new Error('Failed to save time block');

        // Reload timeBlocks after saving
        await loadTimeBlocks();
        renderTable();
    } catch (error) {
        console.error('Error saving time block:', error);
    }
}

async function deleteTimeBlock(id) {
    try {
        const response = await fetch(`/.netlify/functions/timeBlocks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete time block');

        // Reload timeBlocks after deletion
        await loadTimeBlocks();
        renderTable();
    } catch (error) {
        console.error('Error deleting time block:', error);
    }
}

// =================== RENDER TABLE ===================================
function renderTable() {
    const fromHour = parseInt(fromInput.value.split(':')[0], 10);
    const toHour = parseInt(toInput.value.split(':')[0], 10) + 1;

    table.innerHTML = ''; // Clear existing rows

    for (let i = fromHour; i < toHour; i++) {
        const displayHour = `${i.toString().padStart(2, '0')}:00`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class='hour-label'>${displayHour}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        table.appendChild(row);
    }

    // Make all cells clickable
    Array.from(table.rows).forEach((row, rowIndex) => {
        if (rowIndex >= 0) { // Skip header row
            Array.from(row.cells).forEach((cell, cellIndex) => {
                if (cellIndex > 0) { // Skip hour label column
                    cell.addEventListener('click', () => showManualPopup(cellIndex, row.cells[0].textContent));
                }
            });
        }
    });

    // Reapply saved blocks
    timeBlocks.forEach(block => applyTimeBlock(block));
}


function removeAllListenersFromCell(cell) {
    const newCell = cell.cloneNode(true); // Clone the cell
    cell.parentNode.replaceChild(newCell, cell); // Replace the original cell with the clone
    return newCell;
}

function applyTimeBlock(block) {
    const { id, day, fromTime, toTime } = block;
    const fromHour = parseInt(fromTime.split(':')[0], 10);
    const toHour = parseInt(toTime.split(':')[0], 10);
    const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(day) + 1;

    for (let i = fromHour; i < toHour; i++) {
        const rowIndex = i - parseInt(document.getElementById('visible-from-time').value.split(':')[0], 10) + 1;
        const row = document.querySelector(`#schedule-table tr:nth-child(${rowIndex})`);
        if (row) {
            const cell = row.cells[dayIndex];
            if (cell) {
                if (i === fromHour) {
                    cell.textContent = `Start: ${fromTime}`;
                } else if (i === toHour - 1) {
                    cell.textContent = `End: ${toTime}`;
                } else {
                    cell.textContent = '';
                }
                cell.classList.add('highlighted');
                const newCell = removeAllListenersFromCell(cell);
                newCell.addEventListener('click', () => editTimeBlock(block));
                newCell.style.cursor = 'default';
            }
        }
    }
}

// ======================= CREATE TIME BLOCK =====================
function showManualPopup(dayIndex, hourLabel) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const popup = document.querySelector('.manual-input-popup');
    popup.style.display = 'block';
    document.querySelector('.popup-overlay').style.display = 'block';

    const day = dayNames[dayIndex - 1] || '';
    document.getElementById('day-select').value = day;
    document.getElementById('from-time').value = hourLabel;
    document.getElementById('to-time').value = '';
}

function addManualBlock() {
    const day = document.getElementById('day-select').value;
    const fromTime = document.getElementById('from-time').value;
    const toTime = document.getElementById('to-time').value;

    if (!day || !fromTime || !toTime) {
        alert('Please fill out all fields.');
        return;
    }

    const block = { day, fromTime, toTime };
    saveTimeBlock(block); // Save directly to the database
    hidePopup();
}

// ================== EDIT TIME BLOCK (WHEN USER CLICKS ON THE BLOCK) ===========================
function editTimeBlock(block) {
    const popup = document.createElement('div');
    popup.classList.add('edit-popup');
    popup.innerHTML = `
        <label>Day:</label>
        <select id="edit-day">
            ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                .map(day => `<option value="${day}" ${block.day === day ? 'selected' : ''}>${day}</option>`)
                .join('')}
        </select>
        <label>From:</label>
        <input type="time" id="edit-from-time" value="${block.fromTime}">
        <label>To:</label>
        <input type="time" id="edit-to-time" value="${block.toTime}">
        <div class="button-container-edit">
        <button id="save-edit">Save</button>
        <button id="delete-edit">Delete</button>
        <button id="cancel-edit">Cancel</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.querySelector('.popup-overlay').style.display = 'block';

    // Add functionality to save, cancel, delete buttons
    document.getElementById('save-edit').addEventListener('click', () => saveEdit(block));
    document.getElementById('cancel-edit').addEventListener('click', () => hidePopup());
    document.getElementById('delete-edit').addEventListener('click', () => deleteBlock(block));
}

function hidePopup() {
    if (document.querySelector('.edit-popup'))
        document.querySelector('.edit-popup').remove();
    document.querySelector('.popup-overlay').style.display = 'none';
    document.querySelector('.manual-input-popup').style.display = 'none';
    
}

function saveEdit(block) {
    block.day = document.getElementById('edit-day').value;
    block.fromTime = document.getElementById('edit-from-time').value;
    block.toTime = document.getElementById('edit-to-time').value;
    saveTimeBlock(block);
    hidePopup();
}

function deleteBlock(block) {
    deleteTimeBlock(block.id);
    hidePopup();
}

// ==================== DELETE ALL ENTRIES (BUTTON) =======================================
function deleteAll() {
    if (confirm("Are you sure you want to delete all time blocks?")) {
        timeBlocks.forEach(block => deleteTimeBlock(block.id));
    }
}

// ================ HELPER FUNC ==================
function formatTime(timeString) {
    return timeString.split(':').slice(0, 2).join(':');
}
