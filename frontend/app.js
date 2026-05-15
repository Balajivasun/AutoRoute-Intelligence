// We use MapLibre GL JS with OpenStreetMap free tiles to bypass Mapbox tokens
const dummyStyle = {
    "version": 8,
    "name": "OSM_Dark",
    "sources": {
        "osm": {
            "type": "raster",
            "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "&copy; OpenStreetMap"
        }
    },
    "layers": [
        {
            "id": "osm-layer",
            "type": "raster",
            "source": "osm",
            "minzoom": 0,
            "maxzoom": 19
        }
    ]
};

const map = new maplibregl.Map({
    container: 'map',
    style: dummyStyle,
    center: [78.0766, 10.9601],
    zoom: 14.5,
    pitch: 0,
    bearing: 0,
    antialias: true
});

const socket = io('http://localhost:8000');
let busesData = [];
let markerNodes = {};
let mapLoaded = false;
let currentDecision = null; 
let autoDismissTimer = null;

// Dynamic Location Resolution for Karur area to replace raw GPS numbers
const karurLandmarks = [
    { name: "Central Bus Stand", lat: 10.9600, lng: 78.0750 },
    { name: "Railway Station", lat: 10.9650, lng: 78.0800 },
    { name: "Pasupathipalayam", lat: 10.9500, lng: 78.0700 },
    { name: "Gandhigramam", lat: 10.9550, lng: 78.0850 },
    { name: "Vengamedu", lat: 10.9700, lng: 78.0900 },
    { name: "Thanthonimalai", lat: 10.9400, lng: 78.0650 },
    { name: "Vangal Road", lat: 10.9800, lng: 78.0600 },
    { name: "West Bypass", lat: 10.9300, lng: 78.0800 },
    { name: "Cauvery Bridge", lat: 10.9850, lng: 78.0700 }
];

function getKarurLocationName(lat, lng) {
    let nearest = karurLandmarks[0];
    let minD = 999999;
    for(let lm of karurLandmarks) {
        let d = Math.pow(lm.lat - lat, 2) + Math.pow(lm.lng - lng, 2);
        if(d < minD) { minD = d; nearest = lm; }
    }
    return nearest.name;
}

map.on('style.load', () => {
    mapLoaded = true;
});

socket.on('connect', () => {
    document.getElementById('core-status').innerText = "AGENT CORE SYNCED";
    document.getElementById('core-status').style.color = "#00ff66";
});

socket.on('bus_positions', (data) => {
    const assistingBuses = busesData.filter(b => b.status === 'assisting').map(b => b.id);

    data.buses.forEach(updatedBus => {
        if (assistingBuses.includes(updatedBus.id) && updatedBus.status === 'active') {
            updatedBus.status = 'assisting'; 
        }
        
        const locName = getKarurLocationName(updatedBus.lat, updatedBus.lng);

        if (!markerNodes[updatedBus.id]) {
            const el = document.createElement('div');
            el.className = 'bus-marker';
            el.innerHTML = '<span style="font-size: 26px;">🚍</span>';
            
            const m = new maplibregl.Marker({ element: el })
                .setLngLat([updatedBus.lng, updatedBus.lat])
                .setPopup(new maplibregl.Popup({ offset: 15, className: 'cyber-popup' }) 
                    .setHTML(`<h4>${updatedBus.id}</h4><p>Route: ${updatedBus.route}</p><p>Driver: ${updatedBus.driver}</p><p>Location: ${locName}</p><p>Fuel: ${updatedBus.fuel}%</p><p>Status: ${updatedBus.status.toUpperCase()}</p>`))
                .addTo(map);
            markerNodes[updatedBus.id] = { marker: m, el: el };
        } else {
            const mData = markerNodes[updatedBus.id];
            mData.marker.setLngLat([updatedBus.lng, updatedBus.lat]);
            mData.marker.getPopup().setHTML(`<h4>${updatedBus.id}</h4><p>Route: ${updatedBus.route}</p><p>Driver: ${updatedBus.driver}</p><p>Location: ${locName}</p><p>Fuel: ${updatedBus.fuel}%</p><p>Status: ${updatedBus.status.toUpperCase()}</p>`);
        }
    });

    busesData = data.buses;
    updateFleetList(data.buses);
});

socket.on('agent_alert', (decision) => {
    const panel = document.getElementById('agent-alert-panel');
    panel.style.display = 'block';
    currentDecision = decision; 

    panel.className = 'bottom-panel';
    let eventClass = '';
    if (decision.event_type === 'FAULT_DETECTED') eventClass = 'type-fault';
    else if (decision.event_type === 'CROWD_SURGE') eventClass = 'type-event';
    else if (decision.event_type === 'EFFICIENCY_OPTIMIZATION') eventClass = 'type-rebalance';
    else if (decision.event_type === 'PREDICTIVE_INTELLIGENCE') eventClass = 'type-predict';

    if (eventClass) {
        panel.classList.add(eventClass);
        currentDecision.class = eventClass; 
    }

    document.getElementById('alert-title-text').innerText = decision.title;

    const reasoningText = document.getElementById('alert-reasoning');
    reasoningText.innerHTML = "";
    let i = 0;
    const typeWriter = setInterval(() => {
        if (i < decision.reasoning.length) {
            
            if(decision.reasoning.charAt(i) === '\n') {
                 reasoningText.innerHTML += '<br>';
            } else {
                reasoningText.innerHTML += decision.reasoning.charAt(i);
            }
            i++;
        } else {
            clearInterval(typeWriter);
        }
    }, 10);

    busesData.forEach(b => {
        if (decision.affected_buses.includes(b.id) && b.status !== 'offline') b.status = 'assisting';
    });

    const focalId = decision.affected_buses[0];
    const bus = busesData.find(b => b.id === focalId);
    if (bus && mapLoaded) {
        map.flyTo({ center: [bus.lng, bus.lat], zoom: 15.5, duration: 2500, essential: true });
    }
    
    if(autoDismissTimer) clearTimeout(autoDismissTimer);
    autoDismissTimer = setTimeout(() => {
        handleAcknowledge();
    }, 8000); // UI dismisses and logs purely autonomously
});

function addToJournal(decision) {
    const journal = document.getElementById('decision-journal');
    const time = new Date().toLocaleTimeString();

    const entry = document.createElement('div');
    entry.className = `journal-entry ${decision.class}`;
    let breakFiltered = decision.reasoning.replace(/\n/g, '<br/>');
    entry.innerHTML = `
        <div class="j-stamp">[${time}] XAI SYSTEM RECORD</div>
        <div class="j-title">${decision.title}</div>
        <div class="j-desc">${breakFiltered}</div>
    `;
    journal.prepend(entry);
}

function updateFleetList(buses) {
    const list = document.getElementById('fleet-list');
    list.innerHTML = buses.map(b => {
        let statusDisplay = b.status.toUpperCase();
        
        const locName = getKarurLocationName(b.lat, b.lng);

        return `
        <div class="bus-card ${b.status === 'offline' ? 'offline' : 'active'}">
            <div class="bus-header">
                <div>🚍 ${b.id} <span class="bus-route">[${b.route}]</span></div>
                <div style="letter-spacing: 1px">${statusDisplay}</div>
            </div>
            <div class="bus-crew">
                D: <span>${b.driver}</span> | C: <span>${b.conductor}</span>
            </div>
            <div class="bus-metrics">
                <div class="metric">
                    <span class="metric-lbl">Velocity</span>
                    <span class="metric-val">${Math.round(b.speed)} km/h</span>
                </div>
                <div class="metric">
                    <span class="metric-lbl">Fuel Reserve</span>
                    <span class="metric-val ${b.fuel < 40 ? 'high' : 'low'}">${b.fuel}%</span>
                </div>
                <div class="metric">
                    <span class="metric-lbl">Tickets Yield</span>
                    <span class="metric-val">${b.tickets}</span>
                </div>
                <div class="metric">
                    <span class="metric-lbl">Location</span>
                    <span class="metric-val" style="font-size: 0.7rem; color: #00f0ff;">${locName}</span>
                </div>
            </div>
        </div>
    `}).join('');
}

document.getElementById('commander-handle').addEventListener('click', () => {
    document.getElementById('commander-console').classList.toggle('open');
});

// Re-bind endpoints
document.getElementById('btn-predict').addEventListener('click', () => { fetch('http://localhost:8000/trigger_predictive', { method: 'POST' }).catch(console.error); });
document.getElementById('btn-jammer').addEventListener('click', () => { fetch('http://localhost:8000/toggle_gps_jammer', { method: 'POST' }).catch(console.error); });
document.getElementById('btn-fault').addEventListener('click', () => { fetch('http://localhost:8000/trigger_fault', { method: 'POST' }).catch(console.error); });
document.getElementById('btn-event').addEventListener('click', () => { fetch('http://localhost:8000/trigger_event', { method: 'POST' }).catch(console.error); });
document.getElementById('btn-rebalance').addEventListener('click', () => { fetch('http://localhost:8000/trigger_rebalance', { method: 'POST' }).catch(console.error); });

function handleAcknowledge() {
    document.getElementById('agent-alert-panel').style.display = 'none';
    if (currentDecision) {
        addToJournal(currentDecision);
        currentDecision = null;
    }
    busesData.forEach(b => { if (b.status === 'assisting') b.status = 'active'; });
}

// Ensure the buttons exist in DOM before attaching
const ackBtn = document.getElementById('acknowledge-btn');
if (ackBtn) ackBtn.addEventListener('click', handleAcknowledge);

const cmdAckBtn = document.getElementById('cmd-acknowledge-btn');
if (cmdAckBtn) cmdAckBtn.addEventListener('click', handleAcknowledge);
