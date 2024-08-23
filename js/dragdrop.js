document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const line1Stops = document.getElementById('line1-stops');
    const line2Stops = document.getElementById('line2-stops');
    const copypasteButton = document.getElementById('copypaste');

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

    // Copy coordinates to clipboard
    copypasteButton.addEventListener('click', () => {
        const stops = { line1: [], line2: [] };
        document.querySelectorAll('#line1-stops li').forEach(li => {
            if (li.parentElement.classList.contains('grid-cell')) {
                stops.line1.push({
                    name: li.textContent,
                    x: parseInt(li.style.left, 10),
                    y: parseInt(li.style.top, 10)
                });
            }
        });
        document.querySelectorAll('#line2-stops li').forEach(li => {
            if (li.parentElement.classList.contains('grid-cell')) {
                stops.line2.push({
                    name: li.textContent,
                    x: parseInt(li.style.left, 10),
                    y: parseInt(li.style.top, 10)
                });
            }
        });
        navigator.clipboard.writeText(JSON.stringify(stops)).then(() => {
            alert('Coordinates copied to clipboard!');
        });
    });
});