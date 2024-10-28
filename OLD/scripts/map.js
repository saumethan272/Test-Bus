/**
 * @author Owen Meade
 * @version 1.0
 * @description Live Map tracker
 */

// Constants
const APP_ID = "94820b1e";
const APP_KEY = "a3a450ca543e4a41b2596f6452b0162e";
const USE_LOCAL_DATA = false;

// Get URL
let url;
if (USE_LOCAL_DATA || APP_ID === "" || APP_KEY === "") {
  url = "./api-dump/realtime-buses.json";
} else {
  // url = 'https://transportapi.com/v3/uk/bus/service_timetables.json?service=1&operator=FABD&direction=outbound' +
  //   `&active=true&live=true&app_id=${APP_ID}&app_key=${APP_KEY}`;

  url = 'https://transportapi.com/v3/uk/bus/service_timetables.json?active=true&direction=outbound' +
    `&live=true&operator=FPOT&service=1&source_config=first_siri_vm&app_id=${APP_ID}&app_key=${APP_KEY}`

}

// Functions
// draw map using leaflet
function drawMap() {
  const map = L.map('mapElement').setView([51.505, -0.09], 13);
  const urlTemplate = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

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

// draw bus images on the map
function drawBuses(buses, map) {
  const busesLayerGroup = L.layerGroup();
  map.addLayer(busesLayerGroup);

  const busIcon = L.icon({
    iconUrl: 'bus.svg',
    iconSize: [30, 30],
  });
  const arrowIcon = L.icon({
    iconUrl: 'arrow.svg',
    iconSize: [60, 60],
  });

  buses.forEach(bus => {
    const coordinates = bus.status.location.coordinates;
    // The coordinates are returned as [longitude, latitude] so they need to be swapped before they're passed to Leaflet
    const latlng = L.latLng(coordinates[1], coordinates[0]);
    const busMarker = L.marker(latlng, { icon: busIcon });

    busesLayerGroup.addLayer(busMarker);
    busMarker.bindTooltip(tooltipHtml(bus));

    const bearing = bus.status.bearing;
    if (bearing !== -1) {
      const bearingMarker = L.marker(latlng, {
        icon: arrowIcon,
        rotationAngle: bearing + 90,
        rotationOrigin: 'center',
        zIndexOffset: -1,
      });
      busesLayerGroup.addLayer(bearingMarker);
    }
  });

  fitMap(buses, map);
}

function tooltipHtml(bus) {
  return `
    <dl>
      <dt>Operator</dt><dd>${bus.operator_name}</dd>
      <dt>Line</dt><dd>${bus.line_name}</dd>
      <dt>Direction</dt><dd>${bus.dir}</dd>
      <dt>Departure time</dt><dd>${bus.stops[0].time}</dd>
    </dl>
  `;
}

function fitMap(buses, map) {
  const coordinates = buses.map(bus => {
    const coordinates = bus.status.location.coordinates
    return L.latLng(coordinates[1], coordinates[0])
  });
  map.fitBounds(coordinates);
}

// Main
$.getJSON(url, data => {
  const map = drawMap();
  drawBuses(data.member, map);
})