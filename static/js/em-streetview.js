let streetview;
let compassUpdate;
let rotations = 0;

$(".game-reset-button").on("click", function(){
    streetview.setPosition(curCoords);
});

function initializeStreetview(coords){
    streetview = new google.maps.StreetViewPanorama(
        document.getElementById("streetview-container"),
        {
            disableDefaultUI: true,
            motionTracking: false,
            showRoadLabels: false,
            linksControl: false,
            clickToGo: false
        }
    );
    const streetviewService = new google.maps.StreetViewService();
    streetviewService.getPanorama(
        {
            location: coords,
            preference: "best",
            radius: 100,
            source: "outdoor"
        },
        function(data){
            if (data && data.location && data.location.latLng){
                curCoords = {lat: data.location.latLng.lat(), lng: data.location.latLng.lng()};
                streetview.setPano(data.location.pano);
                streetview.setVisible(true);
            }
            const compass = document.getElementById("pointer");
            compassUpdate = setInterval(
                function() {
                    let prevAngle = parseFloat(compass.getAttribute("data-angle"));
                    let curAngle = streetview.getPov().heading;
                    if ((prevAngle - curAngle) > 180 && prevAngle > curAngle)
                        rotations++;
                    else if ((prevAngle - curAngle) < -180 && prevAngle < curAngle)
                        rotations--;
                    compass.style.transform = `rotate(${curAngle + (rotations * 360)}deg)`;
                    compass.setAttribute("data-angle", curAngle);
                    },
                200
            );
            loadSave();
            initializeGame();
    });
}

function getCurCoords() {
    fetch(`/geordle/api/location?date=${getDateString()}&em=true`)
        .then((coords) => coords.json())
        .then((coords) => initializeStreetview(coords));
}

window.initialize = getCurCoords;