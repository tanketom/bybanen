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
        stopName.style.left = `${stop.x + 15}px`;
        stopName.style.top = `${stop.y - 5}px`;

        map.appendChild(stopElement);
        map.appendChild(stopName);

        return stopElement;
    }

    // Function to create SVG lines between stops
    function createLine(stops, color) {
        for (let i = 0; i < stops.length - 1; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", stops[i].x + 5); // Centering on the stop dot
            line.setAttribute("y1", stops[i].y + 5); // Centering on the stop dot
            line.setAttribute("x2", stops[i + 1].x + 5); // Centering on the stop dot
            line.setAttribute("y2", stops[i + 1].y + 5); // Centering on the stop dot
            line.setAttribute("stroke", color);
            line.setAttribute("stroke-width", "3");
            linesSvg.appendChild(line);
        }
    }

    // Function to update the clock
    let simulatedTime = 5 * 3600 + 40 * 60; // Start at 05:40
    function updateClock() {
        simulatedTime += 6; // Increment by 6 seconds to simulate 10x speed without skipping minutes
        const hours = Math.floor(simulatedTime / 3600) % 24;
        const minutes = Math.floor((simulatedTime % 3600) / 60);
        const seconds = simulatedTime % 60;
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
    fetch('json/timetable.json')
        .then(response => response.json())
        .then(data => {
            const lines = data;

            // Create stops and lines for each line
            for (const line in lines) {
                const stops = lines[line].stops.map(createStop);
                const color = line === "line1" ? "orange" : "yellow";
                createLine(lines[line].stops, color);

                // Blink stops according to schedule
                const schedule = lines[line].schedule;
                const start = schedule.start;
                const end = schedule.end;

                function blinkStops() {
                    const currentTime = (simulatedTime / 60) % 1440;
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