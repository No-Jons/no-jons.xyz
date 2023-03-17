let map;
let curPoint;
let mapElement = document.getElementById("osm-map")
let guessIcon = L.icon({
    iconUrl: "/static/img/triangle.png",
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    tooltipAnchor: [-5, -18]
});
let curDate = getDateString();
let gameNum = Math.round((new Date(curDate) - new Date("2023/3/8")) / (24 * 60 * 60 * 1000)) + 1;
let copyText = `Geordle Extreme #${gameNum} 🔥\nhttps://no-jons.xyz/geordle/extreme\n`;

function initializeGame(){
    $("#hard-mode-toggle").prop("checked", gData.hard_mode);
    if (gData.em_last_play === curDate)
        reopenEndedGame();
    else {
        let mapCont = $("#osm-game-container");
        mapCont.show();
        if (map === undefined)
            initializeMap();
        mapCont.hide();
    }
}

function initializeMap() {
    map = L.map(
            mapElement,
            {
                center: L.latLng('47.116389', '-101.299722'),
                zoom: 4
            }
        );

    const basemapLayers = {
        Default: L.esri.Vector.vectorBasemapLayer("ArcGIS:Streets", { apiKey: esriApiKey }).addTo(map),
        Satellite: L.esri.Vector.vectorBasemapLayer("ArcGIS:Imagery", { apiKey: esriApiKey }),
        OSM: L.esri.Vector.vectorBasemapLayer("OSM:Standard", { apiKey: esriApiKey })
    };

    L.control.layers(basemapLayers, null, { collapsed: false, position: "bottomright"}).addTo(map);
    setInterval(function() { map.invalidateSize(); }, 250);
}

function getDistanceFromGuess(){
    updateLastGuess(curPoint.getLatLng());
    endGame(Math.round(map.distance(curPoint.getLatLng(), curCoords)));
}

function showActualLocation(){
    let endMap = L.map(
        document.getElementById("game-over-map"),
        {
            center: curCoords,
            zoom: 12
        }
    );
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(endMap);
    L.marker(curCoords).bindTooltip("Actual Location", {direction: "top"}).addTo(endMap);
    L.marker(gData.em_last_guess, {icon: guessIcon}).bindTooltip(`Your Guess`, {direction: "top"}).addTo(endMap);
    L.polyline([curCoords, gData.em_last_guess], {color: "#DE3131", dashArray: "10 7"}).addTo(endMap);
    endMap.setView(curCoords, 12)
}

function updatePlayerSave(){
    gData.em_last_play = curDate;
    updateSave();
}

function updateLastGuess(guess){
    gData.em_last_guess = guess;
    updateSave();
}

function setGameStats(){
    let distance = Math.round(map.distance(gData.em_last_guess, curCoords));
    $("#distance .game-over-stat-value").html(
        distance <= 1000 ? `${distance}m` : `${Math.round(distance / 1000)}km`
    );
}

function endGame(distance){
    copyText += "Distance: " + (distance <= 1000 ? `${distance}m` : `${Math.round(distance / 1000)}km`)
    updatePlayerSave();
    setGameStats();
    $("#game-over-container").show();
    $(".game-results-button").show();
    showActualLocation();
    startConfetti({particles: 1000 - distance});
}

function reopenEndedGame(){
    map = L.map(mapElement);
    let distance = Math.round(map.distance(gData.em_last_guess, curCoords));
    copyText += ("Distance: " + distance <= 1000 ? `${distance}m` : `${Math.round(distance / 1000)}km`)
    setGameStats();
    $(".osm-open-map").hide();
    $("#game-over-container").show();
    $(".game-results-button").show();
    showActualLocation();
}

mapElement.addEventListener("click", (event) => {
    if (curPoint !== undefined)
        curPoint.remove();
    curPoint = L.marker(map.mouseEventToLatLng(event), {
        icon: guessIcon,
        title: `Your Guess`
    }).bindTooltip(`Your Guess`, {direction: "top"});
    curPoint.addTo(map);
});

$(".osm-close-map").on("click", function() {
    $("#osm-map-container").hide();
    $(".osm-open-map").show();
});

$(".osm-open-map").on("click", function() {
    $("#osm-map-container").show();
    if (map === undefined)
        initializeMap();
    $(this).hide();
});

$(".osm-submit").on("click", function() {
    if (curPoint === undefined)
        return;
    getDistanceFromGuess();
});

$("#copy-game-text").on("click", function() {
    navigator.clipboard.writeText(copyText);
    let popup = $("#copy-text-popup");
    popup.css({"left": $(this).position().left + 5, "top": $("#game-over-buttons").position().top - ($(this).height() + 15), "opacity": 1});
    popup.show();
    popup.animate({
        opacity: 0,
        top: "-=10%"
    }, 1000, function (){
        popup.hide();
    });
});

$("#close-game-over").on("click", function() {
    $("#game-over-container").hide();
    $("#osm-map-container").hide();
    $(".osm-open-map").hide();
});

$(".game-results-button").on("click", function() {
    $("#game-over-container").show();
})