const timeBlocks = []; // Array to store time blocks
const table = document.querySelector('#schedule-table');
const fromInput = document.getElementById('visible-from-time');
const toInput = document.getElementById('visible-to-time');


document.addEventListener('DOMContentLoaded', () => {

    fromInput.addEventListener('change', renderTable);
    toInput.addEventListener('change', renderTable);

    // Load saved blocks from local storage
    const savedBlocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
    savedBlocks.forEach(block => timeBlocks.push(block));

    renderTable(); // Initial render
});

function renderTable() {
    const fromHour = parseInt(fromInput.value.split(':')[0], 10);
    const toHour = parseInt(toInput.value.split(':')[0], 10)+1;

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

function showPopup() {
    document.querySelector('.manual-input-popup').style.display = 'block';
    document.querySelector('.popup-overlay').style.display = 'block';
}

function hidePopup() {
    if (document.querySelector('.edit-popup'))
        document.querySelector('.edit-popup').remove();
    document.querySelector('.popup-overlay').style.display = 'none';
    document.querySelector('.manual-input-popup').style.display = 'none';
    
}

function showManualPopup(dayIndex, hourLabel) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const popup = document.querySelector('.manual-input-popup');
    popup.style.display = 'block';
    document.querySelector('.popup-overlay').style.display = 'block';

    // Correctly map the day index to the day name
    const day = dayNames[dayIndex - 1] || '';

    document.getElementById('day-select').value = day;
    document.getElementById('from-time').value = hourLabel;
    document.getElementById('to-time').value = ''; // Clear to-time for new input
}

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
        <button id="cancel-edit">Cancel</button>
        <button id="delete-edit">Delete</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.querySelector('.popup-overlay').style.display = 'block';

    // Add functionality to save and cancel buttons
    document.getElementById('save-edit').addEventListener('click', () => saveEdit(block));
    document.getElementById('cancel-edit').addEventListener('click', () => hidePopup());
    document.getElementById('delete-edit').addEventListener('click', () => deleteBlock(block, popup));
}

function deleteBlock(block, popup) {
    const index = timeBlocks.indexOf(block);
    timeBlocks.splice(index, 1);
    localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));
    renderTable();
    hidePopup();
}

function removeAllListenersFromCell(cell) {
    const newCell = cell.cloneNode(true); // Clone the cell
    cell.parentNode.replaceChild(newCell, cell); // Replace the original cell with the clone
    return newCell;
}

function applyTimeBlock(block) {
    const { day, fromTime, toTime } = block;
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
                newcell = removeAllListenersFromCell(cell); // Remove existing click listeners
                newcell.addEventListener('click', () => editTimeBlock(block)); // Add click listener
                newcell.style.cursor = 'default';
            }
        }
    }
}


function addManualBlock() {
    const day = document.getElementById('day-select').value;
    const fromTime = document.getElementById('from-time').value;
    const toTime = document.getElementById('to-time').value;

    if (!day || !fromTime || !toTime) {
        alert('Please fill out all fields.');
        return;
    }

    // Save the block
    const block = { day, fromTime, toTime };
    timeBlocks.push(block);

    // Persist blocks to local storage
    localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));

    // Apply the block to the table
    applyTimeBlock(block);

    hidePopup();

    // renderTable();
}

function saveEdit(block) {
    const day = document.getElementById('edit-day').value;
    const fromTime = document.getElementById('edit-from-time').value;
    const toTime = document.getElementById('edit-to-time').value;

    // Update the block
    block.day = day;
    block.fromTime = fromTime;
    block.toTime = toTime;

    // Save to local storage
    localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));

    // Re-render the table
    renderTable();

    // Remove the popup
    // popup.remove();
    hidePopup();
}
