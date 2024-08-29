document.addEventListener("DOMContentLoaded", function() {
    const map = document.getElementById("map");
    const linesSvg = document.getElementById("lines");

    // Function to create stops
    function createStop(stop) {
        const stopElement = document.createElement("div");
        stopElement.className = "stop";
        stopElement.style.left = `${stop.x}px`;
        stopElement.style.top = `${stop.y}px`;

        const stopName = document.createElement("div");
        stopName.className = "stop-name";
        stopName.textContent = stop.name;

        map.appendChild(stopElement);
        map.appendChild(stopName);

        return stopElement;
    }

    // Function to create SVG lines between stops
    function createLine(stops) {
        for (let i = 0; i < stops.length - 1; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", stops[i].x);
            line.setAttribute("y1", stops[i].y);
            line.setAttribute("x2", stops[i + 1].x);
            line.setAttribute("y2", stops[i + 1].y);
            line.setAttribute("stroke", "white");
            line.setAttribute("stroke-width", "3");
            linesSvg.appendChild(line);
        }
    }

    // Function to update the clock
    function updateClock() {
        const now = new Date();
        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        clockElement.textContent = timeString;
    }

    // Create clock element
    const clockElement = document.createElement("div");
    clockElement.style.position = "absolute";
    clockElement.style.top = "10px";
    clockElement.style.right = "10px";
    clockElement.style.color = "white";
    clockElement.style.fontSize = "24px";
    map.appendChild(clockElement);

    // Update clock every 100ms to simulate 10x speed
    setInterval(updateClock, 100);

    // Load timetable data
    fetch('timetable.json')
        .then(response => response.json())
        .then(data => {
            const lines = data;

            // Create stops and lines for each line
            for (const line in lines) {
                const stops = lines[line].stops.map(createStop);
                createLine(lines[line].stops);

                // Blink stops according to schedule
                const schedule = lines[line].schedule;
                const intervals = schedule.intervals;
                const start = schedule.start;
                const end = schedule.end;

                function blinkStops() {
                    const now = new Date();
                    const currentTime = (now.getUTCHours() * 60 + now.getUTCMinutes()) % 1440;
                    const activeStops = stops.filter((stop, index) => {
                        const travelTime = lines[line].stops[index].travelTime;
                        return currentTime >= start + travelTime && currentTime <= end + travelTime;
                    });

                    stops.forEach(stop => stop.classList.remove("blinking"));
                    activeStops.forEach(stop => stop.classList.add("blinking"));
                }

                setInterval(blinkStops, 1000);
            }
        });
});