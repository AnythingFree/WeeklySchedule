const timeBlocks = []; // Array to store time blocks

document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('#schedule-table');
    const fromInput = document.getElementById('visible-from-time');
    const toInput = document.getElementById('visible-to-time');
    
    function renderTable() {
        const fromHour = parseInt(fromInput.value.split(':')[0], 10);
        const toHour = parseInt(toInput.value.split(':')[0], 10);

        table.innerHTML = ''; // Clear existing rows

        for (let i = fromHour; i < toHour; i++) {
            const displayHour = `${i}:00`;
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

        // Reapply saved blocks
        timeBlocks.forEach(block => applyTimeBlock(block));
    
    } 

    fromInput.addEventListener('change', renderTable);
    toInput.addEventListener('change', renderTable);

    // Load saved blocks from local storage
    const savedBlocks = JSON.parse(localStorage.getItem('timeBlocks')) || [];
    savedBlocks.forEach(block => timeBlocks.push(block));

    
    renderTable(); // Initial render
});

function showPopup() {
    document.querySelector('.manual-input-popup').style.display = 'block';
    document.querySelector('.popup-overlay').style.display = 'block';
}

function hidePopup() {
    document.querySelector('.popup-overlay').style.display = 'none';
    document.querySelector('.manual-input-popup').style.display = 'none';
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
                    cell.classList.add('highlighted');
                } else if (i === toHour - 1) {
                    cell.textContent = `End: ${toTime}`;
                    cell.classList.add('highlighted');
                } else {
                    cell.textContent = '';
                    cell.classList.add('highlighted');
                }
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


