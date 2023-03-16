let map;
let curPoint;
let mapElement = document.getElementById("osm-map")
let guessIcon = L.icon({
    iconUrl: "/static/img/triangle.png",
    iconSize: [20, 20],
    iconAnchor: [10, 18],
    tooltipAnchor: [-5, -18]
});
let guesses = 1;
let previousGuesses = [];
let curDate = getDateString();
let gameNum = Math.round((new Date(curDate) - new Date("2023/2/12")) / (24 * 60 * 60 * 1000)) + 1;
let copyText = `Geordle #${gameNum} [x]\nhttps://no-jons.xyz/geordle\n`;

function initializeGame(){
    $("#hard-mode-toggle").prop("checked", gData.hard_mode);
    previousGuesses = gData.last_edit === curDate ? gData.last_guesses : [];
    if (gData.last_play === curDate)
        reopenEndedGame();
    else {
        let mapCont = $("#osm-map-container");
        mapCont.show();
        if (map === undefined)
            initializeMap();
        if (previousGuesses.length === 0) {
            mapCont.hide();
            return;
        }
        let guessIDX = 1;
        for (let guess of previousGuesses) {
            appendGuess(map.distance(guess, curCoords));
            L.marker(guess, {
                icon: guessIcon,
                title: `Guess #${guessIDX}`
            }).addTo(map);
            guessIDX++;
            guesses += 1;
        }
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
    if (guesses > 6)
        return;
    let distance = map.distance(curPoint.getLatLng(), curCoords);
    previousGuesses.push(curPoint.getLatLng());
    appendGuess(distance);
    updateLastGuesses();
    curPoint = undefined;
    guesses += 1;
    if (guesses > 6 || distance <= 1000)
        endGame(distance);
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
    for (let i = 0; i < previousGuesses.length; i++)
        L.marker(previousGuesses[i], {icon: guessIcon}).bindTooltip(`Guess #${i + 1}`, {direction: "top"}).addTo(endMap);
    L.circle(curCoords, {radius: 1000, color: "#31DE37"}).addTo(endMap);
    for (let coords of previousGuesses)
        L.polyline([curCoords, coords], {color: "#DE3131", dashArray: "10 7"}).addTo(endMap);
    endMap.setView(curCoords, 12)
}

function appendGuess(distance, ended){
    let emojis = "";
    distance = Math.round(distance);
    let distStr;
    if (distance <= 1000 && guesses <= 6) {
        emojis = "🟩 🟩 🟩 🟩 🟩 ";
        distStr = `${distance}m`;
    }
    else {
        distStr = `${Math.round(distance/1000)}km`;
        let distances = [3000000, 1500000, 750000, 250000, 40000];
        for (let x = 0; x < distances.length; x++){
            if (distance <= distances[x] && emojis !== "🟩 🟩 🟩 🟩 ")
                emojis += "🟩 ";
            else if (distance <= (distances[x] + (distances[x] / 2)))
                emojis += "🟨 ";
            else
                emojis += "⬛ ";
        }
    }
    $(`#guesses .guess.${guesses}`).html(`${guesses} | ${emojis} ${(gData.hard_mode && !ended) ? "____km" : distStr}`);
    $("#hard-mode-toggle").addClass("unclickable");
    copyText += `${emojis} ${distStr}\n`;
}

function updatePlayerData(distance){
    gData.plays += 1;
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let yDate = yesterday.getFullYear() + "/" + ("0" + (yesterday.getMonth() + 1)).slice(-2) + "/" + ("0" + yesterday.getDate()).slice(-2);
    if (distance <= 1000) {
        gData.wins += 1;
        gData.win_dist[guesses - 1] += 1;
        if (yDate === gData.last_play || gData.last_play === null)
            gData.streak += 1;
        else
            gData.streak = 1;
    } else
        gData.streak = 0;
    if (gData.max_streak < gData.streak)
        gData.max_streak = gData.streak;

    if (gData.last_play != null) {
        for (let i = 1; i < ((new Date(curDate) - new Date(gData.last_play)) - 1) / (24 * 60 * 60 * 1000); i++)
            gData.avg_distance_hist.push(gData.avg_distance);
    }
    gData.avg_distance = Math.round((((gData.avg_distance * (gData.plays - 1)) + distance) / gData.plays) * 100) / 100;
    gData.avg_distance_hist.push(gData.avg_distance);
    while (gData.avg_distance_hist.length > 15)
        gData.avg_distance_hist.shift();

    gData.last_play = curDate;
    gData.last_guesses = previousGuesses;

    setGameStats();
    updateSave();
}

function updateLastGuesses(){
    gData.last_guesses = previousGuesses;
    gData.last_edit = curDate;
    updateSave();
}

function setGameStats(){
    $("#plays .game-over-stat-value").html(gData.plays);
    $("#wins .game-over-stat-value").html(gData.wins);
    $("#streak .game-over-stat-value").html(gData.streak);
    $("#win-percent .game-over-stat-value").html(Math.round((gData.wins / gData.plays) * 100));
    $("#avg .game-over-stat-value").html(
        Math.round(((gData.win_dist[1] + (gData.win_dist[2] * 2) + (gData.win_dist[3] * 3) + (gData.win_dist[4] * 4) +
            (gData.win_dist[5] * 5) + (gData.win_dist[6] * 6)) / gData.wins) * 100) / 100
    );
    $("#avg-dist .game-over-stat-value").html(
        gData.avg_distance <= 1000 ? `${gData.avg_distance}m` : `${Math.round(gData.avg_distance / 1000)}km`
    );
    $("#max-streak .game-over-stat-value").html(gData.max_streak);
}

function endGame(distance){
    if (gData.hard_mode)
        revealDistances();
    updatePlayerData(distance)
    $("#game-over-container").show();
    $(".game-results-button").show();
    showActualLocation();
    startConfetti({particles: 1000 - distance});
}

function reopenEndedGame(){
    map = L.map(mapElement);
    previousGuesses = gData.last_guesses;
    for (let guess of previousGuesses) {
        appendGuess(map.distance(curCoords, guess), true);
        guesses += 1;
    }
    setGameStats();
    $(".osm-open-map").hide();
    $("#game-over-container").show();
    $(".game-results-button").show();
    showActualLocation();
}

function revealDistances(){
    for (let i = 0; i < previousGuesses.length; i++) {
        let guess = $(`#guesses .guess.${i + 1}`);
        let distStr = guess.html();
        let distance = Math.round(map.distance(curCoords, previousGuesses[i]));
        let unit = "km";
        if (distance <= 1000)
            unit = "m";
        else
            distance = Math.round(distance / 1000);
        guess.html(
            distStr.replace("____km", `${distance}${unit}`)
        );
    }
}

mapElement.addEventListener("click", (event) => {
    if (curPoint !== undefined)
        curPoint.remove();
    curPoint = L.marker(map.mouseEventToLatLng(event), {
        icon: guessIcon,
        title: `Guess #${guesses}`
    }).bindTooltip(`Guess #${guesses}`, {direction: "top"});
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
    copyText = copyText.replace("[x]", gData.hard_mode ? "🗺️" : "");
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
    $("#osm-game-container").hide();
    $(".osm-open-game").hide();
});

$(".game-results-button").on("click", function() {
    $("#game-over-container").show();
})

$("#hard-mode-toggle").on("click", function() {
    if ($(this).is(":checked") && previousGuesses.length === 0)
        gData.hard_mode = true;
    else if (!$(this).is(":checked") && previousGuesses.length === 0)
        gData.hard_mode = false;
    else
        $(this).prop("checked", gData.hard_mode);
    updateSave();
})
