let map;
const mapElement = document.getElementById("map");
let gameIdx = Math.round((new Date(getDateString()) - new Date("2023/02/12")) / (24 * 60 * 60 * 1000));

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
    for (let i = 0; i < coords.length; i++)
        L.circle(coords[i], {radius: 1000, color: i < gameIdx ? "#1E90FF" : "#DE3131"}).addTo(map);
}

function getAllLocations() {
    fetch("/geordle/api/all_locations")
        .then((coords) => coords.json())
        .then((coords) => displayCoords(coords));
}

window.onload = getAllLocations;