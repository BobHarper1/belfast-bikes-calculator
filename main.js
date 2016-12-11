var fs = require('fs');
var journeys = [];
var stationCounter = {};
var daysCounter = {};
var visits = [];
var nodes = [];
var weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

fs.readFile('example.txt', function(err, data) {
    if (err) throw err;
    dataToObject(data);
    console.log(journeys);
    var totalTime = secondsToHrs(sumUp(journeys, 'duration'));
    var totalDistance = sumUp(journeys, 'distance_km');
    var totalCalories = sumUp(journeys, 'calories');
    var totalC02saved = sumUp(journeys, 'co2saved_kg');
    console.log(totalTime);
    console.log(totalDistance, 'km');
    console.log(totalC02saved, 'kg');
    console.log(journeys.length + ' journeys');
    console.log(totalCalories + ' kcal');
    stationsCount(journeys);
    daysCount(journeys);
    for (var i in getSortedKeys(stationCounter)) {
        visits.push({
            'station': getSortedKeys(stationCounter)[i],
            'number': stationCounter[getSortedKeys(stationCounter)[i]]
        })
    }
    console.log(visits);
    console.log(daysCounter);
    console.log(new Date(journeys[0].date).toDateString(), "to", new Date(journeys[journeys.length - 1].date).toDateString());
    // nodesCount(journeys);
});

function nodesCount(data) {
    for (var i in data) {
        var node = {};
        var station1 = data[i].origin;
        var station2 = data[i].destination;
        node.from = station1;
        node.to = station2;
        nodes.push(node);
    }
    console.log(nodes);
}

function stationsCount(data) {
    for (var i in data) {
        var station1 = data[i].origin;
        var station2 = data[i].destination;
        if (data[i].origin in stationCounter) {
            stationCounter[station1] += 1
        } else {
            stationCounter[station1] = 1
        }
        if (data[i].destination in stationCounter) {
            stationCounter[station2] += 1
        } else {
            stationCounter[station2] = 1
        }
    }
}

function daysCount(data) {
    for (var i in data) {
        var day = weekdays[new Date(data[i].date).getDay()];
        if (day in daysCounter) {
            daysCounter[day] += 1
        } else {
            daysCounter[day] = 1
        }
    }
}

function getSortedKeys(obj) {
    var array = [];
    for (var key in obj) array.push(key);
    array.sort(function(a, b) {
        return obj[b] - obj[a]
    });
    return array
}


// sums all of elements in an array, rounding the *result* to 2 decimals
function sumUp(array, element) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i][element]
    }
    return Math.round(sum * 100) / 100;
}

function secondsToHrs(d) {
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    return ((h > 0 ? h + " hrs " + (m < 10 ? "0" : "") : "") + m + " mins ");
}

function dataToObject(data) { // return journey lines to the journeys object
    var array = data.toString().split("\n");
    var count = 0;
    for (var i in array) {
        var line = array[i];
        if (line.indexOf("Bike") !== -1 && line.indexOf("Invalid") === -1 && line.indexOf("until") !== -1) { // returns only the lines that relate to actual, valid, journeys
            var journey = {}
            journey.date = line.match(/\d{4}-\d{2}-\d{2}/)[0];
            journey.start_time = line.match(/\d{2}:\d{2}:\d{2}/g)[0];
            journey.end_time = line.match(/\d{2}:\d{2}:\d{2}/g)[1];
            journey.bike = line.match(/Bike\s(\d{5})/)[1];
            var detail = (/\(+([^.]+)\)+/).exec(line)[1]; // regex to search for the journey: between the first and last parentheses
            if (detail.indexOf(' - ') !== -1) { // tests if journey has an origin *and* a destination
                var bits = detail.split(/(\s-\s)/);
                journey.origin = bits[0];
                journey.destination = bits[2];
            } else { // else if a journey has *only* an origin (meaning same origin as destination)
                journey.origin = detail;
                journey.destination = detail;
            }
            journey.duration = ( // calculate journey time in seconds
                new Date(journey.date + 'T' + journey.end_time) -
                new Date(journey.date + 'T' + journey.start_time)
            ) / 1000;
            journey.calories = Math.round(journey.duration * 0.07); // see https://www.cyclestreets.net/journey/help/faq/#calories based on journey duration rather than distance of the route
            journey.distance_km = Math.round(journey.duration / 3600 * 10 * 100) / 100 // this is based on a presumed 10km/h speed, average for urban cycling
            journey.co2saved_kg = Math.round(journey.distance_km * 0.18641182099 * 100) / 100 // based on distance, which in turn was based on your journey duration. If 100miles saves 30kg C02, then 1km saves 0.18641182099kg
            journeys[count] = journey;
            count++
        }
    }
}
