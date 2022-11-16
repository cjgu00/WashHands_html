// ====== Grid setup ==================================================
var grid;
var data = [];
var columns = [
    { id: "uid", name: "User ID", field: "uid" },
    { id: "start_time", name: "Start Time", field: "startTime" },
    { id: "duration", name: "Duration", field: "duration" },
    { id: "location", name: "Location", field: "location" }
];
var options = {
    enableCellNavigation: false,
    enableColumnReorder: false
};
grid = new Slick.Grid("#myGrid", data, columns, options);
var gridColumns = grid.getColumns();
gridColumns[0].width = 45;
gridColumns[2].width = 36;
grid.setColumns(gridColumns);
grid.autosizeColumns();

// ====== Dropdown Filter =============================================
const uid = document.querySelector("#user-id");
const loc = document.querySelector("#location");
var uidOptionText = "All";
var locOptionText = "All";
function filterGrid() {
    let i = 0;
    data.length = 0;
    records.forEach((rec) => {
        if (((rec.uid == uidOptionText) || (uidOptionText == "All")) &&
            ((rec.location == locOptionText) || (locOptionText == "All"))) {
            data[i++] = {
                uid: rec.uid,
                startTime: rec.start_time,
                duration: rec.duration,
                location: rec.location
            };
        }
    });
    grid.invalidate();
}
function selectUid(dropdown) {
    uidOptionText = dropdown.options[dropdown.selectedIndex].text;
    filterGrid();
}
function selectLoc(dropdown) {
    locOptionText = dropdown.options[dropdown.selectedIndex].text;
    filterGrid();
}

// ====== Web API access ==============================================
var records;
function getRecord() {
    $.getJSON("https://wash-hands.deta.dev/record", (remoteData) => {
        let i = 0;
        let userIdOptions = [];
        let locOptions = [];
        records = remoteData.records;
        records.sort((a, b) => {
            if (a.start_time > b.start_time) { return -1; }
            if (a.start_time < b.start_time) { return 1; }
            return 0;
        });
        records.forEach((rec) => {
            if (!userIdOptions.includes(rec.uid)) {
                userIdOptions.push(rec.uid);
            }
            userIdOptions.sort();
            if (!locOptions.includes(rec.location)) {
                locOptions.push(rec.location);
            }
            locOptions.sort();
            data[i++] = {
                uid: rec.uid,
                startTime: rec.start_time,
                duration: rec.duration,
                location: rec.location
            };
        });
        uid[0] = new Option("All");
        userIdOptions.forEach((element, key) => {
            uid[key + 1] = new Option(element);
        });
        loc[0] = new Option("All");
        locOptions.forEach((element, key) => {
            loc[key + 1] = new Option(element);
        });
        grid.invalidate();
    });
}

// Update repeatedly (per 10min)
$(() => {
    getRecord();
    (function loop() {
        setTimeout(() => {
            getRecord();
            console.log("New data gotten!");
            loop();
        }, 600000);
    })();
});