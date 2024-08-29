document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('map');
    const svg = document.getElementById('lines');
    const clock = document.createElement('div');
    clock.id = 'clock';
    clock.style.position = 'absolute';
    clock.style.bottom = '10px';
    clock.style.right = '10px';
    clock.style.color = 'white';
    clock.style.fontSize = '20px';
    map.appendChild(clock);

    let globalTime = 345; // Start at 05:45 (5 * 60 + 45)
    const speedFactor = 10; // 10 times faster
    const updateInterval = 1000 / speedFactor; // Update every second divided by speed factor

    function updateClock() {
        globalTime += 1;
        const hours = Math.floor(globalTime / 60) % 24;
        const minutes = globalTime % 60;
        clock.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    setInterval(updateClock, updateInterval);

    function loadStops(line, color, startTime, interval, endTime) {
        fetch('json/timetable.json')
            .then(response => response.json())
            .then(data => {
                const stops = data[line];
                stops.forEach((stop, index) => {
                    const stopElement = document.createElement('div');
                    stopElement.classList.add('stop');
                    stopElement.style.left = `${stop.x}px`;
                    stopElement.style.top = `${stop.y}px`;
                    stopElement.style.backgroundColor = 'white';
                    stopElement.style.borderColor = 'black';
                    stopElement.dataset.travelTime = stop.travelTime; // Bind travelTime data
                    map.appendChild(stopElement);

                    const stopName = document.createElement('div');
                    stopName.classList.add('stop-name');
                    stopName.style.left = `${stop.x}px`;
                    stopName.style.top = `${stop.y}px`;
                    stopName.textContent = stop.name;
                    map.appendChild(stopName);

                    if (index > 0) {
                        const prevStop = stops[index - 1];
                        const midX = (prevStop.x + stop.x) / 2;
                        const midY = (prevStop.y + stop.y) / 2;
                        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        const d = `M${prevStop.x + 5},${prevStop.y + 5} Q${midX},${midY} ${stop.x + 5},${stop.y + 5}`;
                        pathElement.setAttribute('d', d);
                        pathElement.setAttribute('stroke', color);
                        pathElement.setAttribute('stroke-width', '3');
                        pathElement.setAttribute('fill', 'none');
                        svg.appendChild(pathElement);
                    }
                });

                let currentIndex = 0;
                let direction = 1;

                setInterval(() => {
                    const currentHours = Math.floor(globalTime / 60) % 24;
                    const currentMinutes = globalTime % 60;
                    const currentTime = currentHours * 60 + currentMinutes;

                    if (currentTime >= startTime && currentTime <= endTime) {
                        const stops = document.querySelectorAll(`.stop`);
                        stops.forEach(stop => stop.classList.remove('blinking'));
                        stops[currentIndex].classList.add('blinking');

                        console.log(`Blinking stop: ${stops[currentIndex].textContent} on line ${line}`);

                        currentIndex += direction;
                        if (currentIndex === stops.length || currentIndex === -1) {
                            direction *= -1;
                            currentIndex += direction;
                        }
                    }
                }, updateInterval);
            })
            .catch(error => console.error('Error loading stops:', error));
    }

    function scheduleLines() {
        const currentHours = Math.floor(globalTime / 60) % 24;
        const currentMinutes = globalTime % 60;
        const currentTime = currentHours * 60 + currentMinutes;

        // Line 1 schedule
        if ((currentTime >= 345 && currentTime <= 75) || (currentTime >= 75 && currentTime <= 240)) {
            const interval = (currentTime >= 345 && currentTime <= 75) ? 10 : 15;
            loadStops('line1', 'yellow', currentTime, interval, 240);
        }

        // Line 2 schedule
        if ((currentTime >= 346 && currentTime <= 280) || (currentTime >= 280 && currentTime <= 205)) {
            const interval = (currentTime >= 346 && currentTime <= 280) ? 10 : 15;
            loadStops('line2', 'orange', currentTime, interval, 205);
        }
    }

    setInterval(scheduleLines, updateInterval);
});