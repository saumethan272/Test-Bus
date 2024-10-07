
// To make live requests get your app_id and app_key by signing up at https://developer.transportapi.com/signup
// and filling them here
const appId = "702de4e3"; 
const appKey = "d1a9e5fcd9d9c796090c446ae086a899";

let url = (appId === '' || appKey === '')
    ? './api-dump/example-bus-journey-planner.json'
    : 'http://transportapi.com/v3/uk/public/journey/from/postcode:ab124rl/to/postcode:ab124pt.json?service=silverrail' +
    `&app_id=${appId}&app_key=${appKey}`

url = './api-dump/example-bus-journey-planner.json';

$.getJSON(url, data => {
    const map = drawMap()
    const route = data.routes[0]
    const routeParts = route.route_parts.map(routePart => routePart.coordinates)
    drawGeometry(routeParts, map)

    const journeyStepsHtml = route.route_parts
    .map(routePart => {
        const lineName = routePart.mode === 'bus' ? routePart.line_name : ''
        return `
        <div>
            <b>${routePart.departure_time}</b> ${routePart.from_point_name}
            <div class="leg-details">
            <span class="mode mode-${routePart.mode}"></span> ${lineName}
            for ${routePart.duration.slice(0, 5)}
            </div>
        </div>
        `
    })
    .join('\n')
    $('#app').html(`
    Duration: ${route.duration.slice(0, 5)}
    <span class="duration-from-to">${route.departure_time} - ${route.arrival_time}</span>
    <div class="legs">
        ${journeyStepsHtml}
        <div>
        <b>${route.route_parts[route.route_parts.length - 1].arrival_time}</b> Destination
        </div>
    </div>
    `)
})

function drawMap () {
    const map = L.map('mapElement').setView([51.505, -0.09], 13)
    const urlTemplate = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    map.addLayer(L.tileLayer(urlTemplate, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; ' +
        '<a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
    id: 'map',
    tileSize: 512,
    zoomOffset: -1
    }))
    return map
}

function drawGeometry (routeParts, map) {
    const edgesLayerGroup = L.layerGroup()
    map.addLayer(edgesLayerGroup)
    const polyLines = routeParts.map(routePart =>
    // The coordinates are returned as [longitude, latitude] so they need to be swapped before they're passed to Leaflet
    routePart.map(point => [point[1], point[0]]))
    polyLines.forEach(polyLine => {
    edgesLayerGroup.addLayer(L.polyline(polyLine))
    })

    map.fitBounds(polyLines.flat(1))
}