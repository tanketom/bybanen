document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('map');

    function loadStops(line, color) {
        fetch('json/timetable.json')
            .then(response => response.json())
            .then(data => {
                data[line].forEach((stop, index) => {
                    const stopElement = document.createElement('div');
                    stopElement.classList.add('stop');
                    stopElement.style.left = `${stop.x}px`;
                    stopElement.style.top = `${stop.y}px`;
                    stopElement.style.backgroundColor = color;
                    map.appendChild(stopElement);

                    const stopName = document.createElement('div');
                    stopName.classList.add('stop-name');
                    stopName.style.left = `${stop.x}px`;
                    stopName.style.top = `${stop.y}px`;
                    stopName.textContent = stop.name;
                    map.appendChild(stopName);

                    if (index > 0) {
                        const prevStop = data[line][index - 1];
                        const lineElement = document.createElement('div');
                        lineElement.classList.add('line');
                        lineElement.style.left = `${Math.min(stop.x, prevStop.x)}px`;
                        lineElement.style.top = `${Math.min(stop.y, prevStop.y)}px`;
                        lineElement.style.width = `${Math.abs(stop.x - prevStop.x)}px`;
                        lineElement.style.height = `${Math.abs(stop.y - prevStop.y)}px`;
                        map.appendChild(lineElement);

                        const connector = document.createElement('div');
                        connector.classList.add('connector');
                        connector.style.left = `${(stop.x + prevStop.x) / 2}px`;
                        connector.style.top = `${(stop.y + prevStop.y) / 2}px`;
                        map.appendChild(connector);
                    }
                });

                let currentIndex = 0;
                let direction = 1;
                const blinkingSegment = document.createElement('div');
                blinkingSegment.classList.add('blinking-segment');
                map.appendChild(blinkingSegment);

                setInterval(() => {
                    const stops = document.querySelectorAll(`.stop[style*="background-color: ${color}"]`);
                    stops.forEach(stop => stop.classList.remove('blinking'));
                    stops[currentIndex].classList.add('blinking');

                    const prevIndex = (currentIndex === 0) ? stops.length - 1 : currentIndex - 1;
                    const prevStop = stops[prevIndex];
                    const currentStop = stops[currentIndex];

                    blinkingSegment.style.left = `${(parseFloat(prevStop.style.left) + parseFloat(currentStop.style.left)) / 2}px`;
                    blinkingSegment.style.top = `${(parseFloat(prevStop.style.top) + parseFloat(currentStop.style.top)) / 2}px`;

                    currentIndex += direction;
                    if (currentIndex === stops.length || currentIndex === -1) {
                        direction *= -1;
                        currentIndex += direction;
                    }
                }, 1000);
            })
            .catch(error => console.error('Error loading timetable:', error));
    }

    loadStops('line1', 'yellow');
    loadStops('line2', 'orange');
});