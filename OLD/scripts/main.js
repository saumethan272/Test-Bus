const appId = "702de4e3"; 
const appKey = "d1a9e5fcd9d9c796090c446ae086a899"; // Replace with your actual appKey

let routeNumber = "9"; // Default route number
let localMode = false; // Start in online mode

// Function to fetch bus route data
function fetchBusRouteData() {
    const url = (appId === '' || appKey === '' || localMode)
        ? './api-dump/example-bus-route.json'
        : `https://transportapi.com/v3/uk/bus/route/SBLB/${routeNumber}/outbound/timetable.json?edge_geometry=true&app_id=${appId}&app_key=${appKey}`;

    $.getJSON(url, data => {
        const map = drawMap();
        const stops = data.stops;
        drawGeometry(stops, map);
        drawStops(stops, map);
    });
}

// Fetch initial bus route data
fetchBusRouteData();

// Function to draw the map
function drawMap() {
    const map = L.map('mapElement').setView([51.505, -0.09], 13);
    const urlTemplate = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`;
    map.addLayer(L.tileLayer(urlTemplate, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; ' +
            '<a href="https://carto.com/attributions">CARTO</a>',
        subdomains: ['a', 'b', 'c', 'd'],
        maxZoom: 19,
        id: 'map',
        tileSize: 512,
        zoomOffset: -1
    }));
    return map;
}

// Function to draw geometry (route lines) on the map
function drawGeometry(stops, map) {
    const edgesLayerGroup = L.layerGroup();
    map.addLayer(edgesLayerGroup);
  
    const polyLines = stops
      .slice(0, -1)
      .map(stop => stop.next.coordinates.map(a => [a[1], a[0]]));
  
    polyLines.forEach(polyLine => {
        edgesLayerGroup.addLayer(L.polyline(polyLine));
    });

    map.fitBounds(polyLines.flat(1));
}

// Function to draw bus stops on the map
function drawStops(stops, map) {
    const stopsLayerGroup = L.layerGroup();
    map.addLayer(stopsLayerGroup);
  
    stops.forEach(stop => {
        const markerOptions = {
            radius: 6,
            color: '#ff0000',
        };
        const marker = L.circleMarker(L.latLng(stop.latitude, stop.longitude), markerOptions);
        stopsLayerGroup.addLayer(marker);
        marker.bindTooltip(`${stop.name} - ${stop.locality}`);
    });
}

// Event listener for the form submission
document.getElementById('routeForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const routeInput = document.getElementById('routeInput').value; // Get the input value
    routeNumber = routeInput; // Update the route number variable
    fetchBusRouteData(); // Fetch data for the new route number
});

// Event listener for toggling online/offline mode
document.getElementById('toggleModeButton').addEventListener('click', function() {
    // Toggle the localMode variable
    localMode = !localMode;

    // Update the button text based on mode
    const buttonText = localMode ? 'Switch to Online Mode' : 'Switch to Offline Mode';
    this.textContent = buttonText;

    // Update the status text
    const statusText = localMode ? 'Offline Mode (Local Data)' : 'Online Mode (Live Data)';
    document.getElementById('localModeStatus').textContent = statusText;

    // Fetch bus route data in the new mode
    fetchBusRouteData();
});
