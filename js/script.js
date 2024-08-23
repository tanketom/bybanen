document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('map');

    function loadStops(line, color) {
        fetch('json/timetable.json')
            .then(response => response.json())
            .then(data => {
                data[line].forEach((stop, index) => {
                    const stopElement = document.createElement('div');
                    stopElement.classList.add('stop');
                    stopElement.style.left = `${stop.x}%`;
                    stopElement.style.top = `${stop.y}%`;
                    stopElement.style.backgroundColor = color;
                    map.appendChild(stopElement);

                    const stopName = document.createElement('div');
                    stopName.classList.add('stop-name');
                    stopName.style.left = `${stop.x}%`;
                    stopName.style.top = `${stop.y}%`;
                    stopName.textContent = stop.name;
                    map.appendChild(stopName);

                    if (index > 0) {
                        const prevStop = data[line][index - 1];
                        const lineElement = document.createElement('div');
                        lineElement.classList.add('line');
                        lineElement.style.left = `${Math.min(stop.x, prevStop.x)}%`;
                        lineElement.style.top = `${Math.min(stop.y, prevStop.y)}%`;
                        lineElement.style.width = `${Math.abs(stop.x - prevStop.x)}%`;
                        lineElement.style.height = `${Math.abs(stop.y - prevStop.y)}%`;
                        map.appendChild(lineElement);

                        const connector = document.createElement('div');
                        connector.classList.add('connector');
                        connector.style.left = `${(stop.x + prevStop.x) / 2}%`;
                        connector.style.top = `${(stop.y + prevStop.y) / 2}%`;
                        map.appendChild(connector);
                    }
                });

                // Simulate tram movement
                let currentIndex = 0;
                setInterval(() => {
                    const stops = document.querySelectorAll(`.stop[style*="background-color: ${color}"]`);
                    stops.forEach(stop => stop.classList.remove('blinking'));
                    stops[currentIndex].classList.add('blinking');

                    const prevIndex = (currentIndex === 0) ? stops.length - 1 : currentIndex - 1;
                    const prevStop = stops[prevIndex];
                    const currentStop = stops[currentIndex];

                    const blinkingSegment = document.createElement('div');
                    blinkingSegment.classList.add('blinking-segment');
                    blinkingSegment.style.left = `${(parseFloat(prevStop.style.left) + parseFloat(currentStop.style.left)) / 2}%`;
                    blinkingSegment.style.top = `${(parseFloat(prevStop.style.top) + parseFloat(currentStop.style.top)) / 2}%`;
                    map.appendChild(blinkingSegment);

                    currentIndex = (currentIndex + 1) % stops.length;
                }, 1000);
            });
    }

    loadStops('line1', 'yellow');
    loadStops('line2', 'orange');
});