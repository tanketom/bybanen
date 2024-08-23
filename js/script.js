document.addEventListener('DOMContentLoaded', () => {
    fetch('json/timetable.json')
        .then(response => response.json())
        .then(data => {
            const map = document.getElementById('map');
            data.stops.forEach(stop => {
                const stopElement = document.createElement('div');
                stopElement.classList.add('stop');
                stopElement.style.left = `${stop.x}%`;
                stopElement.style.top = `${stop.y}%`;
                map.appendChild(stopElement);

                const stopName = document.createElement('div');
                stopName.classList.add('stop-name');
                stopName.style.left = `${stop.x}%`;
                stopName.style.top = `${stop.y}%`;
                stopName.textContent = stop.name;
                map.appendChild(stopName);
            });

            // Simulate tram movement for Line 1
            let currentIndex1 = 0;
            setInterval(() => {
                const stops = document.querySelectorAll('.stop');
                stops.forEach(stop => stop.classList.remove('blinking'));
                stops[currentIndex1].classList.add('blinking');
                currentIndex1 = (currentIndex1 + 1) % stops.length;
            }, 1000);

            // Simulate tram movement for Line 2
            let currentIndex2 = data.stops.length / 2; // Assuming Line 2 starts halfway through the stops array
            setInterval(() => {
                const stops = document.querySelectorAll('.stop');
                stops.forEach(stop => stop.classList.remove('blinking'));
                stops[currentIndex2].classList.add('blinking');
                currentIndex2 = (currentIndex2 + 1) % stops.length;
            }, 1000);
        });
});