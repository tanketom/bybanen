document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const line1Stops = document.getElementById('line1-stops');
    const line2Stops = document.getElementById('line2-stops');
    const output = document.getElementById('output');

    // Create grid cells
    for (let i = 0; i < 10000; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            cell.classList.add('highlight');
        });
        cell.addEventListener('dragleave', () => {
            cell.classList.remove('highlight');
        });
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('highlight');
            const id = e.dataTransfer.getData('text');
            const stop = document.getElementById(id);
            cell.appendChild(stop);
            stop.style.position = 'absolute';
            stop.style.left = `${cell.offsetLeft}px`;
            stop.style.top = `${cell.offsetTop}px`;
            updateOutput();
        });
        grid.appendChild(cell);
    }

    // Load stops from timetable.json
    fetch('json/timetable.json')
        .then(response => response.json())
        .then(data => {
            data.line1.forEach(stop => {
                const li = document.createElement('li');
                li.textContent = stop.name;
                li.id = `line1-${stop.name}`;
                li.draggable = true;
                li.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text', li.id);
                });
                line1Stops.appendChild(li);
            });

            data.line2.forEach(stop => {
                const li = document.createElement('li');
                li.textContent = stop.name;
                li.id = `line2-${stop.name}`;
                li.draggable = true;
                li.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text', li.id);
                });
                line2Stops.appendChild(li);
            });
        });

    // Update the output text area with the new coordinates
    function updateOutput() {
        const stops = { line1: [], line2: [] };
        document.querySelectorAll('#line1-stops li').forEach(li => {
            if (li.parentElement.classList.contains('grid-cell')) {
                stops.line1.push({
                    name: li.textContent,
                    x: parseInt(li.parentElement.style.left, 10),
                    y: parseInt(li.parentElement.style.top, 10)
                });
            }
        });
        document.querySelectorAll('#line2-stops li').forEach(li => {
            if (li.parentElement.classList.contains('grid-cell')) {
                stops.line2.push({
                    name: li.textContent,
                    x: parseInt(li.parentElement.style.left, 10),
                    y: parseInt(li.parentElement.style.top, 10)
                });
            }
        });
        output.value = JSON.stringify(stops, null, 4);
    }
});