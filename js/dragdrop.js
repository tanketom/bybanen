document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const stopsList = document.getElementById('stops').querySelector('ul');
    const output = document.getElementById('output');
    const generateButton = document.getElementById('generate');

    // Create the grid
    for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
            const cell = document.createElement('div');
            cell.dataset.x = j;
            cell.dataset.y = i;
            grid.appendChild(cell);
        }
    }

    // Load stops from timetable.json
    fetch('json/timetable.json')
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach(line => {
                data[line].forEach(stop => {
                    const stopItem = document.createElement('li');
                    stopItem.textContent = stop.name;
                    stopItem.draggable = true;
                    stopItem.dataset.line = line;
                    stopItem.dataset.name = stop.name;
                    stopsList.appendChild(stopItem);
                });
            });
        });

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
});