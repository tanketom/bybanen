document.addEventListener("DOMContentLoaded", function () {
    const map = document.getElementById("map");
    const linesSvg = document.getElementById("lines");
    const clockEl = document.getElementById("clock");
    const statusEl = document.getElementById("status");
    const tramCountsEl = document.getElementById("tram-counts");
    const themeToggle = document.getElementById("theme-toggle");
    const departurePanel = document.getElementById("departure-panel");

    const ENTUR_API = "https://api.entur.io/journey-planner/v3/graphql";
    const CLIENT_NAME = "bybanen-tracker";
    const POLL_INTERVAL = 30000;
    const CACHE_KEY = "bybanen-cache";
    const THEME_KEY = "bybanen-theme";

    const TERMINALS = {
        line1: [
            { id: "NSR:StopPlace:30859" },
            { id: "NSR:StopPlace:58536" }
        ],
        line2: [
            { id: "NSR:StopPlace:62130" },
            { id: "NSR:StopPlace:62112" }
        ]
    };

    const LINE_IDS = {
        line1: "SKY:Line:1",
        line2: "SKY:Line:2"
    };

    // Stop place IDs for departure queries
    const STOP_IDS = {
        "Byparken": "NSR:StopPlace:30859",
        "Kaigaten": "NSR:StopPlace:62130",
        "Nonneseter": "NSR:StopPlace:30862",
        "Bergen Busstasjon": "NSR:StopPlace:30865",
        "Nygård": "NSR:StopPlace:30867",
        "Florida": "NSR:StopPlace:30870",
        "Danmarks Plass": "NSR:StopPlace:31372",
        "Kronstad": "NSR:StopPlace:31374",
        "Brann Stadion": "NSR:StopPlace:31377",
        "Wergeland": "NSR:StopPlace:31379",
        "Sletten": "NSR:StopPlace:31382",
        "Slettebakken": "NSR:StopPlace:31384",
        "Fantoft": "NSR:StopPlace:31388",
        "Paradis": "NSR:StopPlace:29298",
        "Hop": "NSR:StopPlace:29815",
        "Nesttun Terminal": "NSR:StopPlace:29820",
        "Nesttun Sentrum": "NSR:StopPlace:29817",
        "Skjoldskiftet": "NSR:StopPlace:29824",
        "Mårdalen": "NSR:StopPlace:29827",
        "Skjold": "NSR:StopPlace:29830",
        "Lagunen Terminal": "NSR:StopPlace:30138",
        "Råstølen": "NSR:StopPlace:30081",
        "Sandslivegen": "NSR:StopPlace:30143",
        "Sandslimarka": "NSR:StopPlace:30148",
        "Kokstad": "NSR:StopPlace:30154",
        "Birkelandsskiftet Terminal": "NSR:StopPlace:30162",
        "Kokstadflaten": "NSR:StopPlace:30159",
        "Bergen Lufthavn": "NSR:StopPlace:30156",
        "Fløen": "NSR:StopPlace:62128",
        "Haukeland sjukehus": "NSR:StopPlace:62127",
        "Mindemyren": "NSR:StopPlace:62125",
        "Kristianborg": "NSR:StopPlace:62124",
        "Fyllingsdalen Terminal": "NSR:StopPlace:62104"
    };

    const STOP_NAME_MAP = {
        "Bergen lufthavn": "Bergen Lufthavn",
        "Bergen busstasjon": "Bergen Busstasjon",
        "Brann stadion": "Brann Stadion",
        "Danmarks plass": "Danmarks Plass",
        "Nesttun terminal": "Nesttun Terminal",
        "Nesttun sentrum": "Nesttun Sentrum",
        "Lagunen terminal": "Lagunen Terminal",
        "Birkelandsskiftet terminal": "Birkelandsskiftet Terminal",
        "Haukeland sjukehus": "Haukeland sjukehus",
        "Fyllingsdalen terminal": "Fyllingsdalen Terminal",
        "Nygård": "Nygård",
        "Mårdalen": "Mårdalen",
        "Råstølen": "Råstølen",
        "Fløen": "Fløen"
    };

    function norm(name) {
        return STOP_NAME_MAP[name] || name;
    }

    // ── Schematic tube-map coordinates (% of viewport) ───────────
    const S = 3.0;
    const D = S * 0.707;

    const TIMETABLE = {
        line1: [
            // Section A: horizontal
            { name: "Byparken",              x: 6,            y: 35,         label: "above" },
            { name: "Kaigaten",              x: 6 + S,        y: 35,         label: "below" },
            { name: "Nonneseter",            x: 6 + S*2,      y: 35,         label: "above" },
            { name: "Bergen Busstasjon",     x: 6 + S*3,      y: 35,         label: "below" },
            { name: "Nygård",                x: 6 + S*4,      y: 35,         label: "above" },
            // Section B: 45° diagonal
            { name: "Florida",               x: 6 + S*5,      y: 35 + S,     label: "above" },
            { name: "Danmarks Plass",        x: 6 + S*6,      y: 35 + S*2,   label: "above" },
            { name: "Kronstad",              x: 6 + S*7,      y: 35 + S*3,   label: "below" },
            { name: "Brann Stadion",         x: 6 + S*8,      y: 35 + S*4,   label: "above" },
            // Section C: horizontal
            { name: "Wergeland",             x: 6 + S*9,      y: 35 + S*4,   label: "below" },
            { name: "Sletten",               x: 6 + S*10,     y: 35 + S*4,   label: "above" },
            { name: "Slettebakken",          x: 6 + S*11,     y: 35 + S*4,   label: "below" },
            { name: "Fantoft",               x: 6 + S*12,     y: 35 + S*4,   label: "above" },
            { name: "Paradis",               x: 6 + S*13,     y: 35 + S*4,   label: "below" },
            { name: "Hop",                   x: 6 + S*14,     y: 35 + S*4,   label: "above" },
            { name: "Nesttun Terminal",      x: 6 + S*15,     y: 35 + S*4,   label: "below" },
            { name: "Nesttun Sentrum",       x: 6 + S*16,     y: 35 + S*4,   label: "above" },
            // Section D: 45° diagonal — labels alternate diag-right / diag-left
            { name: "Skjoldskiftet",              x: 6 + S*16 + D,    y: 35 + S*4 + D,     label: "diag-right" },
            { name: "Mårdalen",                   x: 6 + S*16 + D*2,  y: 35 + S*4 + D*2,   label: "diag-left" },
            { name: "Skjold",                     x: 6 + S*16 + D*3,  y: 35 + S*4 + D*3,   label: "diag-right" },
            { name: "Lagunen Terminal",            x: 6 + S*16 + D*4,  y: 35 + S*4 + D*4,   label: "diag-left" },
            { name: "Råstølen",                   x: 6 + S*16 + D*5,  y: 35 + S*4 + D*5,   label: "diag-right" },
            { name: "Sandslivegen",                x: 6 + S*16 + D*6,  y: 35 + S*4 + D*6,   label: "diag-left" },
            { name: "Sandslimarka",                x: 6 + S*16 + D*7,  y: 35 + S*4 + D*7,   label: "diag-right" },
            { name: "Kokstad",                     x: 6 + S*16 + D*8,  y: 35 + S*4 + D*8,   label: "diag-left" },
            { name: "Birkelandsskiftet Terminal",  x: 6 + S*16 + D*9,  y: 35 + S*4 + D*9,   label: "diag-right" },
            { name: "Kokstadflaten",               x: 6 + S*16 + D*10, y: 35 + S*4 + D*10,  label: "diag-left" },
            { name: "Bergen Lufthavn",             x: 6 + S*16 + D*11, y: 35 + S*4 + D*11,  label: "diag-right" }
        ],
        line2: [
            { name: "Kaigaten",              x: 6 + S,        y: 35,         label: "below" },
            { name: "Nonneseter",            x: 6 + S*2,      y: 35,         label: "above" },
            { name: "Bergen Busstasjon",     x: 6 + S*3,      y: 35,         label: "below" },
            // Branch: 45° up-right
            { name: "Fløen",                 x: 6 + S*4,      y: 35 - S,     label: "above" },
            { name: "Haukeland sjukehus",    x: 6 + S*5,      y: 35 - S*2,   label: "above" },
            // Drop: 45° down-right to Kronstad
            { name: "Kronstad",              x: 6 + S*7,      y: 35 + S*3,   label: "below" },
            // Continue: horizontal left
            { name: "Mindemyren",            x: 6 + S*6,      y: 35 + S*4,   label: "below" },
            { name: "Kristianborg",          x: 6 + S*5,      y: 35 + S*4,   label: "above" },
            { name: "Fyllingsdalen Terminal", x: 6 + S*3,      y: 35 + S*4,   label: "below" }
        ]
    };

    const INTERCHANGE_STOPS = new Set([
        "Kaigaten", "Nonneseter", "Bergen Busstasjon", "Kronstad"
    ]);

    const LINE_COLORS = {
        line1: "#e07020", line2: "#ccaa00"
    };
    const LINE_NAMES = {
        line1: "Linje 1", line2: "Linje 2"
    };
    const LINE_WIDTH = 6;

    // ── Theme toggle ────────────────────────────────────────────

    function applyTheme(dark) {
        document.body.classList.toggle("dark", dark);
        themeToggle.innerHTML = dark ? "&#9788;" : "&#9790;";
        try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch(e) {}
    }

    // Restore saved theme
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "dark") applyTheme(true);
    } catch(e) {}

    themeToggle.addEventListener("click", function () {
        applyTheme(!document.body.classList.contains("dark"));
    });

    // ── Clock ────────────────────────────────────────────────────

    function updateClock() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString("nb-NO", {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ── Status indicator ────────────────────────────────────────

    statusEl.innerHTML = '<span class="status-dot"></span><span class="status-text"></span>';
    const statusDot = statusEl.querySelector(".status-dot");
    const statusText = statusEl.querySelector(".status-text");

    function setStatus(state, msg) {
        statusDot.className = "status-dot " + state;
        statusText.textContent = msg || "";
    }

    // ── Service gap detection ───────────────────────────────────

    let serviceGapEl = null;

    function isServiceGap() {
        const now = new Date();
        const h = now.getHours();
        return h >= 1 && h < 5;
    }

    function showServiceGap() {
        if (!serviceGapEl) {
            serviceGapEl = document.createElement("div");
            serviceGapEl.className = "service-gap";
            serviceGapEl.textContent = "Nattmodus — begrenset trafikk mellom 01:00 og 05:00";
            map.appendChild(serviceGapEl);
        }
        setStatus("sleeping", "Nattmodus");
    }

    function hideServiceGap() {
        if (serviceGapEl) {
            serviceGapEl.remove();
            serviceGapEl = null;
        }
    }

    // ── Tooltip ──────────────────────────────────────────────────

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.style.display = "none";
    map.appendChild(tooltip);

    function showTooltip(el, infos) {
        const rect = el.getBoundingClientRect();
        const mapRect = map.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - mapRect.left) + "px";
        tooltip.style.top = (rect.top - mapRect.top) + "px";

        let html = "";
        for (let i = 0; i < infos.length; i++) {
            const info = infos[i];
            if (i > 0) html += '<hr class="tooltip-separator">';

            // Direction arrow
            if (info.destination) {
                html += `<span class="tooltip-direction">\u2192 ${info.destination}</span><br>`;
            }

            const nextTime = new Date(info.nextArrival);
            const timeStr = nextTime.toLocaleTimeString("nb-NO", {
                hour: "2-digit", minute: "2-digit"
            });

            html += `<span class="tooltip-label">Neste stopp</span><br>`;
            html += `<span class="tooltip-dest">${info.nextStop}</span> `;
            html += `<span class="tooltip-time">${timeStr}</span>`;

            // Delay indication
            if (info.delayMinutes && info.delayMinutes >= 1) {
                html += `<br><span class="tooltip-delay">+${Math.round(info.delayMinutes)} min forsinket</span>`;
            }
        }

        tooltip.innerHTML = html;
        tooltip.style.display = "block";
    }

    function hideTooltip() {
        tooltip.style.display = "none";
    }

    // ── Build a line on the schematic ────────────────────────────

    const stopRegistry = {};

    function buildLine(lineKey) {
        const stops = TIMETABLE[lineKey];
        const color = LINE_COLORS[lineKey];
        const result = { stops: [], midpoints: [] };

        for (let i = 0; i < stops.length; i++) {
            const s = stops[i];

            // SVG route segment to next stop
            if (i < stops.length - 1) {
                const next = stops[i + 1];
                const seg = document.createElementNS("http://www.w3.org/2000/svg", "line");
                seg.setAttribute("x1", s.x + "%");
                seg.setAttribute("y1", s.y + "%");
                seg.setAttribute("x2", next.x + "%");
                seg.setAttribute("y2", next.y + "%");
                seg.setAttribute("stroke", color);
                seg.setAttribute("stroke-width", LINE_WIDTH);
                seg.setAttribute("stroke-linecap", "round");
                linesSvg.appendChild(seg);

                // Two midpoint dots at 1/3 and 2/3
                for (let d = 1; d <= 2; d++) {
                    const t = d / 3;
                    const mx = s.x + (next.x - s.x) * t;
                    const my = s.y + (next.y - s.y) * t;
                    const dot = document.createElement("div");
                    dot.className = "midpoint";
                    dot.style.left = mx + "%";
                    dot.style.top = my + "%";
                    map.appendChild(dot);
                    result.midpoints.push({
                        el: dot,
                        segIndex: i,
                        dotIndex: d,
                        fromName: s.name,
                        toName: next.name
                    });
                }
            }

            // Stop dot — reuse if already placed at this position (interchange)
            const posKey = Math.round(s.x * 10) + "," + Math.round(s.y * 10);
            let stopEl, nameEl;

            if (stopRegistry[posKey]) {
                stopEl = stopRegistry[posKey].el;
                nameEl = stopRegistry[posKey].nameEl;
                stopEl.classList.add("interchange");
            } else {
                stopEl = document.createElement("div");
                stopEl.className = "stop";
                if (INTERCHANGE_STOPS.has(s.name)) {
                    stopEl.classList.add("interchange");
                }
                stopEl.style.left = s.x + "%";
                stopEl.style.top = s.y + "%";
                map.appendChild(stopEl);

                nameEl = document.createElement("div");
                nameEl.className = "stop-name " + (s.label || "above");
                nameEl.style.left = s.x + "%";
                nameEl.style.top = s.y + "%";
                nameEl.textContent = s.name;
                map.appendChild(nameEl);

                stopRegistry[posKey] = { el: stopEl, nameEl: nameEl };
            }

            result.stops.push({ el: stopEl, nameEl: nameEl, name: s.name });
        }

        return result;
    }

    // ── Entur API ────────────────────────────────────────────────

    async function queryDepartures(stopId, lineId) {
        const startTime = new Date(Date.now() - 90 * 60 * 1000).toISOString();
        const query = `{
            stopPlace(id: "${stopId}") {
                quays {
                    estimatedCalls(
                        startTime: "${startTime}",
                        numberOfDepartures: 15,
                        whiteListed: { lines: ["${lineId}"] }
                    ) {
                        serviceJourney {
                            id
                            estimatedCalls {
                                quay { stopPlace { name } }
                                aimedArrivalTime
                                aimedDepartureTime
                                expectedArrivalTime
                                expectedDepartureTime
                            }
                        }
                    }
                }
            }
        }`;

        const resp = await fetch(ENTUR_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ET-Client-Name": CLIENT_NAME },
            body: JSON.stringify({ query })
        });
        const data = await resp.json();
        return data.data.stopPlace.quays.flatMap(q => q.estimatedCalls || []);
    }

    // Query upcoming departures for a specific stop (for click-to-view-departures)
    async function queryStopDepartures(stopId) {
        const query = `{
            stopPlace(id: "${stopId}") {
                quays {
                    estimatedCalls(
                        numberOfDepartures: 15,
                        whiteListed: { lines: ["SKY:Line:1", "SKY:Line:2"] }
                    ) {
                        destinationDisplay { frontText }
                        serviceJourney {
                            line { publicCode }
                        }
                        aimedDepartureTime
                        expectedDepartureTime
                    }
                }
            }
        }`;

        const resp = await fetch(ENTUR_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ET-Client-Name": CLIENT_NAME },
            body: JSON.stringify({ query })
        });
        const data = await resp.json();
        return data.data.stopPlace.quays.flatMap(q => q.estimatedCalls || []);
    }

    // ── Determine tram positions ─────────────────────────────────

    function getTramPositions(journey) {
        const now = Date.now();
        const calls = journey.estimatedCalls;
        if (!calls.length) return [];

        const firstDep = new Date(calls[0].expectedDepartureTime).getTime();
        const lastArr = new Date(calls[calls.length - 1].expectedArrivalTime).getTime();
        if (now < firstDep || now > lastArr) return [];

        // Determine destination (last stop)
        const destination = norm(calls[calls.length - 1].quay.stopPlace.name);

        const positions = [];

        for (let i = 0; i < calls.length; i++) {
            const arr = new Date(calls[i].expectedArrivalTime).getTime();
            const dep = new Date(calls[i].expectedDepartureTime).getTime();
            const stopName = norm(calls[i].quay.stopPlace.name);

            // Calculate delay in minutes
            const aimedArr = calls[i].aimedArrivalTime
                ? new Date(calls[i].aimedArrivalTime).getTime() : null;
            const delayMs = aimedArr ? (arr - aimedArr) : 0;
            const delayMinutes = delayMs / 60000;

            if (now >= arr && now <= dep) {
                const nextIdx = i < calls.length - 1 ? i + 1 : i;
                positions.push({
                    type: "at-stop",
                    stopName: stopName,
                    nextStop: norm(calls[nextIdx].quay.stopPlace.name),
                    nextArrival: calls[nextIdx].expectedArrivalTime,
                    destination: destination,
                    delayMinutes: delayMinutes
                });
            }

            if (i < calls.length - 1) {
                const nextArr = new Date(calls[i + 1].expectedArrivalTime).getTime();
                if (now >= dep && now < nextArr) {
                    const nextName = norm(calls[i + 1].quay.stopPlace.name);
                    const progress = (now - dep) / (nextArr - dep);

                    // Delay for midpoint: use delay from next stop
                    const nextAimedArr = calls[i + 1].aimedArrivalTime
                        ? new Date(calls[i + 1].aimedArrivalTime).getTime() : null;
                    const nextDelayMs = nextAimedArr ? (nextArr - nextAimedArr) : 0;
                    const nextDelayMinutes = nextDelayMs / 60000;

                    positions.push({
                        type: progress < 0.5 ? "between-1" : "between-2",
                        fromName: stopName,
                        toName: nextName,
                        nextStop: nextName,
                        nextArrival: calls[i + 1].expectedArrivalTime,
                        destination: destination,
                        delayMinutes: nextDelayMinutes
                    });
                }
            }
        }

        return positions;
    }

    // ── Smooth animation between polls ──────────────────────────

    // Store previous and target positions for interpolation
    let prevPositionsMap = { line1: [], line2: [] };
    let targetPositionsMap = { line1: [], line2: [] };
    let animationFrame = null;
    let lastPollTime = 0;

    // ── Update loop ──────────────────────────────────────────────

    const hoverInfo = new WeakMap();
    let tramCounts = { line1: 0, line2: 0 };
    let lastError = false;

    async function updateLine(lineKey, visual) {
        const lineId = LINE_IDS[lineKey];
        const terminals = TERMINALS[lineKey];

        const allCalls = [];
        for (const t of terminals) {
            const calls = await queryDepartures(t.id, lineId);
            allCalls.push(...calls);
        }

        const journeyMap = new Map();
        for (const call of allCalls) {
            const sj = call.serviceJourney;
            if (!journeyMap.has(sj.id)) journeyMap.set(sj.id, sj);
        }

        const allPositions = [];
        for (const [, journey] of journeyMap) {
            allPositions.push(...getTramPositions(journey));
        }

        // Count unique active trams (by destination + rough position)
        const tramSet = new Set();
        for (const pos of allPositions) {
            const key = pos.destination + "|" + (pos.stopName || pos.fromName);
            tramSet.add(key);
        }
        tramCounts[lineKey] = tramSet.size;

        // Build maps: supports multiple trams at same location
        const activeStops = new Map(); // stopName → [info, info, ...]
        const activeMidpoints = new Map();

        for (const pos of allPositions) {
            if (pos.type === "at-stop") {
                const info = {
                    nextStop: pos.nextStop,
                    nextArrival: pos.nextArrival,
                    destination: pos.destination,
                    delayMinutes: pos.delayMinutes
                };
                if (!activeStops.has(pos.stopName)) activeStops.set(pos.stopName, []);
                activeStops.get(pos.stopName).push(info);
            } else {
                const dotIndex = pos.type === "between-1" ? 1 : 2;
                const key = pos.fromName + "|" + pos.toName + "|" + dotIndex;
                const info = {
                    nextStop: pos.nextStop,
                    nextArrival: pos.nextArrival,
                    destination: pos.destination,
                    delayMinutes: pos.delayMinutes
                };
                if (!activeMidpoints.has(key)) activeMidpoints.set(key, []);
                activeMidpoints.get(key).push(info);
            }
        }

        // Update stop elements
        for (const s of visual.stops) {
            const infos = activeStops.get(s.name);
            if (infos && infos.length > 0) {
                s.el.classList.add("active");
                s.nameEl.classList.add("active");
                // Check if any tram is delayed
                const hasDelay = infos.some(i => i.delayMinutes >= 2);
                s.el.classList.toggle("delayed", hasDelay);
                hoverInfo.set(s.el, infos);
            } else {
                s.el.classList.remove("active", "delayed");
                s.nameEl.classList.remove("active");
                hoverInfo.delete(s.el);
            }
        }

        // Update midpoint elements
        for (const m of visual.midpoints) {
            const keyFwd = m.fromName + "|" + m.toName + "|" + m.dotIndex;
            const keyRev = m.toName + "|" + m.fromName + "|" + (3 - m.dotIndex);
            const infos = activeMidpoints.get(keyFwd) || activeMidpoints.get(keyRev);
            if (infos && infos.length > 0) {
                m.el.classList.add("active");
                const hasDelay = infos.some(i => i.delayMinutes >= 2);
                m.el.classList.toggle("delayed", hasDelay);
                hoverInfo.set(m.el, infos);
            } else {
                m.el.classList.remove("active", "delayed");
                hoverInfo.delete(m.el);
            }
        }

        // Cache the data
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
            cache[lineKey] = {
                positions: allPositions,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch(e) {}
    }

    // ── Update tram count display ────────────────────────────────

    function updateTramCounts() {
        let html = "";
        for (const key in LINE_NAMES) {
            html += `<div class="tram-count-row"><span class="count-swatch" style="background:${LINE_COLORS[key]}"></span>${LINE_NAMES[key]}: ${tramCounts[key]} vogner</div>`;
        }
        tramCountsEl.innerHTML = html;
    }

    // ── Hover listeners ──────────────────────────────────────────

    map.addEventListener("mouseover", function (e) {
        const target = e.target;
        if (target.classList.contains("active") &&
            (target.classList.contains("stop") || target.classList.contains("midpoint"))) {
            const infos = hoverInfo.get(target);
            if (infos) showTooltip(target, infos);
        }
    });

    map.addEventListener("mouseout", function (e) {
        const target = e.target;
        if (target.classList.contains("stop") || target.classList.contains("midpoint")) {
            hideTooltip();
        }
    });

    // ── Click stop for departures ────────────────────────────────

    map.addEventListener("click", function (e) {
        const target = e.target;
        if (target.classList.contains("stop")) {
            // Find stop name from registry
            let stopName = null;
            for (const key in stopRegistry) {
                if (stopRegistry[key].el === target) {
                    stopName = stopRegistry[key].nameEl.textContent;
                    break;
                }
            }
            if (stopName && STOP_IDS[stopName]) {
                openDeparturePanel(stopName, STOP_IDS[stopName]);
            }
        } else if (!departurePanel.contains(target)) {
            closeDeparturePanel();
        }
    });

    async function openDeparturePanel(stopName, stopId) {
        departurePanel.style.display = "block";
        departurePanel.innerHTML = `<button class="dep-close">&times;</button><h3>${stopName}</h3><div class="dep-empty">Laster avganger...</div>`;

        departurePanel.querySelector(".dep-close").addEventListener("click", closeDeparturePanel);

        try {
            const deps = await queryStopDepartures(stopId);
            if (deps.length === 0) {
                departurePanel.innerHTML = `<button class="dep-close">&times;</button><h3>${stopName}</h3><div class="dep-empty">Ingen kommende avganger</div>`;
                departurePanel.querySelector(".dep-close").addEventListener("click", closeDeparturePanel);
                return;
            }

            // Sort by expected departure time
            deps.sort((a, b) => new Date(a.expectedDepartureTime) - new Date(b.expectedDepartureTime));

            let html = `<button class="dep-close">&times;</button><h3>${stopName}</h3>`;
            for (const dep of deps) {
                const line = dep.serviceJourney.line.publicCode;
                const dest = dep.destinationDisplay.frontText;
                const expected = new Date(dep.expectedDepartureTime);
                const aimed = new Date(dep.aimedDepartureTime);
                const delayMs = expected - aimed;
                const delayMin = Math.round(delayMs / 60000);

                const timeStr = expected.toLocaleTimeString("nb-NO", {
                    hour: "2-digit", minute: "2-digit"
                });

                const lineColor = line === "1" ? LINE_COLORS.line1 : LINE_COLORS.line2;

                html += `<div class="dep-row">`;
                html += `<span class="dep-line" style="color:${lineColor}">L${line}</span>`;
                html += `<span class="dep-dest">${dest}</span>`;
                html += `<span class="dep-time">${timeStr}</span>`;
                if (delayMin >= 1) {
                    html += `<span class="dep-delay">+${delayMin}</span>`;
                }
                html += `</div>`;
            }

            departurePanel.innerHTML = html;
            departurePanel.querySelector(".dep-close").addEventListener("click", closeDeparturePanel);
        } catch (e) {
            departurePanel.innerHTML = `<button class="dep-close">&times;</button><h3>${stopName}</h3><div class="dep-empty">Feil ved lasting av avganger</div>`;
            departurePanel.querySelector(".dep-close").addEventListener("click", closeDeparturePanel);
        }
    }

    function closeDeparturePanel() {
        departurePanel.style.display = "none";
    }

    // Close on escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeDeparturePanel();
    });

    // ── Offline cache fallback ───────────────────────────────────

    function loadFromCache(lineKey, visual) {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
            const cached = cache[lineKey];
            if (!cached || !cached.positions) return false;

            // Only use cache if less than 5 minutes old
            if (Date.now() - cached.timestamp > 5 * 60 * 1000) return false;

            const activeStops = new Map();
            const activeMidpoints = new Map();

            for (const pos of cached.positions) {
                if (pos.type === "at-stop") {
                    const info = {
                        nextStop: pos.nextStop,
                        nextArrival: pos.nextArrival,
                        destination: pos.destination,
                        delayMinutes: pos.delayMinutes
                    };
                    if (!activeStops.has(pos.stopName)) activeStops.set(pos.stopName, []);
                    activeStops.get(pos.stopName).push(info);
                } else {
                    const dotIndex = pos.type === "between-1" ? 1 : 2;
                    const key = pos.fromName + "|" + pos.toName + "|" + dotIndex;
                    const info = {
                        nextStop: pos.nextStop,
                        nextArrival: pos.nextArrival,
                        destination: pos.destination,
                        delayMinutes: pos.delayMinutes
                    };
                    if (!activeMidpoints.has(key)) activeMidpoints.set(key, []);
                    activeMidpoints.get(key).push(info);
                }
            }

            for (const s of visual.stops) {
                const infos = activeStops.get(s.name);
                if (infos && infos.length > 0) {
                    s.el.classList.add("active");
                    s.nameEl.classList.add("active");
                    const hasDelay = infos.some(i => i.delayMinutes >= 2);
                    s.el.classList.toggle("delayed", hasDelay);
                    hoverInfo.set(s.el, infos);
                }
            }

            for (const m of visual.midpoints) {
                const keyFwd = m.fromName + "|" + m.toName + "|" + m.dotIndex;
                const keyRev = m.toName + "|" + m.fromName + "|" + (3 - m.dotIndex);
                const infos = activeMidpoints.get(keyFwd) || activeMidpoints.get(keyRev);
                if (infos && infos.length > 0) {
                    m.el.classList.add("active");
                    const hasDelay = infos.some(i => i.delayMinutes >= 2);
                    m.el.classList.toggle("delayed", hasDelay);
                    hoverInfo.set(m.el, infos);
                }
            }

            return true;
        } catch(e) {
            return false;
        }
    }

    // ── Init ─────────────────────────────────────────────────────

    const visuals = {};
    for (const lineKey in TIMETABLE) {
        visuals[lineKey] = buildLine(lineKey);
    }

    async function pollAll() {
        // Service gap check
        if (isServiceGap()) {
            showServiceGap();
            return;
        }
        hideServiceGap();

        setStatus("ok", "");

        for (const lineKey in visuals) {
            try {
                await updateLine(lineKey, visuals[lineKey]);
                lastError = false;
            } catch (e) {
                console.error("Update error:", e);
                lastError = true;
                setStatus("error", "Tilkoblingsfeil");

                // Try loading from cache on error
                loadFromCache(lineKey, visuals[lineKey]);
            }
        }

        updateTramCounts();

        if (!lastError) {
            setStatus("ok", "");
        }
    }

    // Try cache first for instant display, then poll
    for (const lineKey in visuals) {
        loadFromCache(lineKey, visuals[lineKey]);
    }
    updateTramCounts();

    pollAll();
    setInterval(pollAll, POLL_INTERVAL);
});
