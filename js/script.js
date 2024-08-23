document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('map'); // Get the map element

    // Function to load stops for a given line and color
    function loadStops(line, color) {
        fetch('json/timetable.json') // Fetch the timetable JSON file
            .then(response => response.json()) // Parse the JSON response
            .then(data => {
                data[line].forEach((stop, index) => {
                    // Create a stop element
                    const stopElement = document.createElement('div');
                    stopElement.classList.add('stop');
                    stopElement.style.left = `${stop.x}px`;
                    stopElement.style.top = `${stop.y}px`;
                    stopElement.style.backgroundColor = color;
                    map.appendChild(stopElement);

                    // Create a stop name element
                    const stopName = document.createElement('div');
                    stopName.classList.add('stop-name');
                    stopName.style.left = `${stop.x}px`;
                    stopName.style.top = `${stop.y}px`;
                    stopName.textContent = stop.name;
                    map.appendChild(stopName);

                    // Create a line element between stops
                    if (index > 0) {
                        const prevStop = data[line][index - 1];
                        const lineElement = document.createElement('div');
                        lineElement.classList.add('line');
                        lineElement.style.left = `${Math.min(stop.x, prevStop.x)}px`;
                        lineElement.style.top = `${Math.min(stop.y, prevStop.y)}px`;
                        lineElement.style.width = `${Math.abs(stop.x - prevStop.x)}px`;
                        lineElement.style.height = `${Math.abs(stop.y - prevStop.y)}px`;
                        map.appendChild(lineElement);

                        // Create a connector element between stops
                        const connector = document.createElement('div');
                        connector.classList.add('connector');
                        connector.style.left = `${(stop.x + prevStop.x) / 2}px`;
                        connector.style.top = `${(stop.y + prevStop.y) / 2}px`;
                        map.appendChild(connector);
                    }
                });

                // Simulate tram movement
                let currentIndex = 0;
                let direction = 1; // 1 for forward, -1 for backward
                setInterval(() => {
                    const stops = document.querySelectorAll(`.stop[style*="background-color: ${color}"]`);
                    stops.forEach(stop => stop.classList.remove('blinking')); // Remove blinking class from all stops
                    stops[currentIndex].classList.add('blinking'); // Add blinking class to the current stop

                    // Create a blinking segment between the current and previous stop
                    const prevIndex = (currentIndex === 0) ? stops.length - 1 : currentIndex - 1;
                    const prevStop = stops[prevIndex];
                    const currentStop = stops[currentIndex];

                    const blinkingSegment = document.createElement('div');
                    blinkingSegment.classList.add('blinking-segment');
                    blinkingSegment.style.left = `${(parseFloat(prevStop.style.left) + parseFloat(currentStop.style.left)) / 2}px`;
                    blinkingSegment.style.top = `${(parseFloat(prevStop.style.top) + parseFloat(currentStop.style.top)) / 2}px`;
                    map.appendChild(blinkingSegment);

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