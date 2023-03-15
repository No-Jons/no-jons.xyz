const SAVE_VERSION = 0.15;
const MIN_COMPATIBLE_VERSION = 0.13;
let gData;
let DEFAULT_SAVE = {
    plays: 0,
    wins: 0,
    id: 0,
    win_dist: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    },
    start_date: getDateString(),
    last_play: null,
    streak: 0,
    max_streak: 0,
    last_guesses: [],
    avg_distance: 0,
    avg_distance_hist: [],
    hard_mode: false,
    last_edit: null,
    em_last_play: "0/0/0",
    em_last_guess: null,
    version: SAVE_VERSION
};

function loadSave(){
    gData = JSON.parse(window.localStorage.getItem("geordle")) || DEFAULT_SAVE;
    if (gData.version === undefined || parseFloat(gData.version) < MIN_COMPATIBLE_VERSION)
        gData = DEFAULT_SAVE;
    if (gData.version < 0.14) {
        gData.em_last_play = "0/0/0";
        gData.em_last_guess = null;
    }
    if (gData.version < 0.15) {
        gData.last_play = gData.last_play === null ? null : gData.last_play.replace(/-/g,'/');
        gData.last_edit = gData.last_edit === null ? null : gData.last_edit.replace(/-/g,'/');
        gData.em_last_play = gData.em_last_play === null ? null : gData.em_last_play.replace(/-/g,'/');
        gData.start_date = gData.start_date.replace(/-/g,'/');
        gData.version = SAVE_VERSION;
    }
    if (gData.id === 0)
        gData.id = (new Date()).getTime();
    updateSave();
}

function updateSave(){
    window.localStorage.setItem("geordle", JSON.stringify(gData));
}

function getDateString(){
    let d = new Date();
    return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2);
}