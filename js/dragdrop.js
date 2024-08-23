document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const stopsList = document.getElementById('stops').querySelector('ul');
    const output = document.getElementById('output');
    const generateButton = document.getElementById('generate');
    const inputButton = document.getElementById('input');

    // Create the grid
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < 1000; j++) {
            const cell = document.createElement('div');
            cell.dataset.x = j;
            cell.dataset.y = i;
            grid.appendChild(cell);
        }
    }

    // Load stops from timetable.json
    function loadStops(data) {
        stopsList.innerHTML = ''; // Clear existing stops
        grid.querySelectorAll('.highlight').forEach(cell => {
            cell.classList.remove('highlight');
            cell.style.backgroundColor = '#333';
            cell.innerHTML = '';
        });

        Object.keys(data).forEach(line => {
            data[line].forEach(stop => {
                const stopItem = document.createElement('li');
                stopItem.textContent = stop.name;
                stopItem.draggable = true;
                stopItem.dataset.line = line;
                stopItem.dataset.name = stop.name;
                stopItem.dataset.x = stop.x;
                stopItem.dataset.y = stop.y;
                stopItem.style.backgroundColor = line === 'line1' ? 'yellow' : 'orange';
                stopsList.appendChild(stopItem);

                // Place stop on the grid
                const cell = grid.querySelector(`div[data-x="${stop.x}"][data-y="${stop.y}"]`);
                if (cell) {
                    cell.classList.add('highlight');
                    cell.style.backgroundColor = stopItem.style.backgroundColor;

                    // Create or update the stop name label
                    let stopLabel = cell.querySelector('.stop-name');
                    if (!stopLabel) {
                        stopLabel = document.createElement('div');
                        stopLabel.classList.add('stop-name');
                        cell.appendChild(stopLabel);
                    }
                    stopLabel.textContent = stop.name;
                    stopLabel.style.color = 'white';
                    stopLabel.style.fontWeight = 'bold';
                }
            });
        });
    }

    // Handle drag and drop
    let draggedItem = null;

    stopsList.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
    });

    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    grid.addEventListener('drop', (e) => {
        if (draggedItem) {
            const x = e.target.dataset.x;
            const y = e.target.dataset.y;
            draggedItem.dataset.x = x;
            draggedItem.dataset.y = y;
            e.target.classList.add('highlight');
            e.target.style.backgroundColor = draggedItem.style.backgroundColor;

            // Create or update the stop name label
            let stopLabel = e.target.querySelector('.stop-name');
            if (!stopLabel) {
                stopLabel = document.createElement('div');
                stopLabel.classList.add('stop-name');
                e.target.appendChild(stopLabel);
            }
            stopLabel.textContent = draggedItem.dataset.name;
            stopLabel.style.color = 'white';
            stopLabel.style.fontWeight = 'bold';
        }
    });

    // Allow dragging of stops already placed on the grid
    grid.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('highlight')) {
            draggedItem = stopsList.querySelector(`li[data-name="${e.target.querySelector('.stop-name').textContent}"]`);
        }
    });

    // Generate new timetable.json
    generateButton.addEventListener('click', () => {
        const newTimetable = {};

        stopsList.querySelectorAll('li').forEach(stop => {
            const line = stop.dataset.line;
            if (!newTimetable[line]) {
                newTimetable[line] = [];
            }
            newTimetable[line].push({
                name: stop.dataset.name,
                x: parseInt(stop.dataset.x),
                y: parseInt(stop.dataset.y)
            });
        });

        output.value = JSON.stringify(newTimetable, null, 2);
    });

    // Input timetable.json
    inputButton.addEventListener('click', () => {
        try {
            const data = JSON.parse(output.value);
            loadStops(data);
        } catch (e) {
            alert('Invalid JSON');
        }
    });

    // Delete stops from the grid
    grid.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('highlight')) {
            const stopName = e.target.querySelector('.stop-name').textContent;
            const stopItem = stopsList.querySelector(`li[data-name="${stopName}"]`);
            if (stopItem) {
                stopsList.removeChild(stopItem);
            }
            e.target.classList.remove('highlight');
            e.target.style.backgroundColor = '#333';
            e.target.innerHTML = '';
        }
    });
});