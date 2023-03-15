let map;
const mapElement = document.getElementById("game");

function initializeMap() {
    map = L.map(
            mapElement,
            {
                center: L.latLng('47.116389', '-101.299722'),
                zoom: 4
            }
        );
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);
    setInterval(map.invalidateSize, 250);
}

function getDateString(){
    let d = new Date();
    return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2);
}

function displayCoords(coords) {
    initializeMap();
    for (i = 0; i < coords.length; i++)
        L.circle(coords[i], {radius: 1000, color: "#DE3131"}).bindTooltip(`Geordle #${i + 1}`, {direction: "top"}).addTo(map);
}

function getPastLocations() {
    fetch(`/geordle/api/past_locations?date=${getDateString()}`)
        .then((coords) => coords.json())
        .then((coords) => displayCoords(coords));
}

window.onload = getPastLocations;