document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('map');
    const svg = document.getElementById('lines');

    // Function to load stops for a given line and color
    function loadStops(line, color) {
        fetch('json/timetable.json') // Fetch the timetable JSON file
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                const stops = data[line];
                stops.forEach((stop, index) => {
                    // Create a stop element
                    const stopElement = document.createElement('div');
                    stopElement.classList.add('stop');
                    stopElement.style.left = `${stop.x}px`;
                    stopElement.style.top = `${stop.y}px`;
                    stopElement.style.backgroundColor = color;
                    stopElement.style.setProperty('--stop-color', color);
                    map.appendChild(stopElement);

                    // Create a stop name element
                    const stopName = document.createElement('div');
                    stopName.classList.add('stop-name');
                    stopName.style.left = `${stop.x}px`;
                    stopName.style.top = `${stop.y}px`;
                    stopName.textContent = stop.name;
                    map.appendChild(stopName);

                    // Draw mainly straight lines with smooth curves to the next stop
                    if (index > 0) {
                        const prevStop = stops[index - 1];
                        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const midX = (prevStop.x + stop.x) / 2;
                        const midY = (prevStop.y + stop.y) / 2;
                        const d = `M${prevStop.x + 5},${prevStop.y + 5} Q${midX},${midY} ${stop.x + 5},${stop.y + 5}`;
                        pathElement.setAttribute('d', d);
                        pathElement.setAttribute('stroke', 'white');
                        pathElement.setAttribute('stroke-width', '3');
                        pathElement.setAttribute('fill', 'none');
                        pathElement.setAttribute('stroke-dasharray', '5,5');
                        svg.appendChild(pathElement);
                    }
                });

                // Simulate tram movement
                let currentIndex = 0;
                let direction = 1; // 1 for forward, -1 for backward
                setInterval(() => {
                    const stops = document.querySelectorAll(`.stop[style*="background-color: ${color}"]`);
                    stops.forEach(stop => stop.classList.remove('blinking')); // Remove blinking class from all stops
                    stops[currentIndex].classList.add('blinking'); // Add blinking class to the current stop

                    // Update the current index based on direction
                    currentIndex += direction;
                    if (currentIndex === stops.length || currentIndex === -1) {
                        direction *= -1; // Reverse direction
                        currentIndex += direction; // Adjust index to stay within bounds
                    }
                }, 1000); // Update every second
            });
    }

    loadStops('line1', 'yellow'); // Load stops for Line 1
    loadStops('line2', 'orange'); // Load stops for Line 2
});