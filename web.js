var journeys = [];
var stationCounter = {};
var visits = [];
var nodes = [];
var totals = {};
var daysCounter = {};
var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var tweetSpanA = '<a class="twitter-share-button pull-right" data-size="small" href="https://twitter.com/intent/tweet?text=';
var tweetSpanB = '&hashtags=belfastbikes&via=bobdata&url=http://www.thiswebsite.theinternet">Tweet</a>';

(function() {
    document.getElementById('submit').addEventListener('click', input);
    document.getElementById('clear').addEventListener('click', clearInputOutput);
})();

function input() {
    var data = document.getElementById('bikes-user-input').value;
    dataToObject(data);
    console.log(journeys)
    totals.journeys = journeys.length;
    totals.duration = secondsToHrs(sumUp(journeys, 'duration'));
    totals.calories = sumUp(journeys, 'calories');
    totals.distance_miles = Math.round(sumUp(journeys, 'distance_km') / 1.609 * 100) / 100;
    totals.distance_km = Math.round(sumUp(journeys, 'distance_km') * 100) / 100;
    totals.co2saved = Math.round(sumUp(journeys, 'co2saved_kg') * 100) / 100;
    stationsCount(journeys);
    for (var i in getSortedKeys(stationCounter)) {
        visits.push({
            'station': getSortedKeys(stationCounter)[i],
            'number': stationCounter[getSortedKeys(stationCounter)[i]]
        })
    }
    daysCount(journeys);
    console.log(visits);
    console.log(daysCounter);
    console.log(totals);
    // nodesCount(journeys);
    output(); // call the output function
    twttWidgetScan();
}

function output() {
    if (journeys.length > 0) {
        document.getElementById('journeys-number').innerHTML = '<h1>' + totals.journeys + '<small> JOURNEYS</br></small></h1>' + "🏆".repeat(totals.journeys / 20) + tweetSpanA + "I've completed " + totals.journeys + " journeys on @BelfastBikes " + "🏆".repeat(totals.journeys / 20) + " Find out yours: " + tweetSpanB;
        document.getElementById('total-time').innerHTML = '<h2>' + totals.duration + '</br><small>spent pedalling</small></h2>' + tweetSpanA + "I've pedalled for " + secondsToHrs(sumUp(journeys, 'duration')) + " on @BelfastBikes " + "🏅".repeat(totals.journeys / 20) + tweetSpanB;
        document.getElementById('total-calories-co2').innerHTML = '<h3>' + totals.calories + ' kcal <small>burned 🔥</small></h3><h3>' + totals.co2saved + 'kg <small>CO<sub>2</sub> saved 🌍</small></h3>' + tweetSpanA + "Using @BelfastBikes, I've burned " + totals.calories + "kcal, saving " + totals.co2saved + "kg C02" + tweetSpanB;
        document.getElementById('total-distance').innerHTML = '<h3>' + totals.distance_miles + ' miles</br><small>' + totals.distance_km + 'km in total</small></h3>' + "🚲".repeat(totals.distance_km / 50) + tweetSpanA + "I've covered " + totals.distance_miles + " miles using @BelfastBikes " + "🚲".repeat(totals.journeys / 20) + " Calculated on " + tweetSpanB;
        document.getElementById('popular-stations').innerHTML = '<h3>Popular stations</h3><ul>';
        var i = 0;
        while (i < 5) {
            document.getElementById('popular-stations').innerHTML += '<li><h4>' + visits[i].station + ' (' + visits[i].number + ' visits)</h4></li>';
            i++;
        }
        document.getElementById('popular-stations').innerHTML += '</ul>';
        document.getElementById('message').innerHTML = '<div class="alert alert-info" role="alert">Journeys found! Between ' + new Date(journeys[0].date).toDateString() + ' and ' + new Date(journeys[journeys.length - 1].date).toDateString() + '</div>';
        drawWeekChart();
        document.getElementById('output').className = document.getElementById('output').className.replace(/\bhidden\b/, 'show');
    } else {
        noDataAlert();
    }
}

function clearInputOutput() {
    document.getElementById('bikes-user-input').value = "";
    document.getElementById('output').className = document.getElementById('output').className.replace(/\bshow\b/, 'hidden');
    document.getElementById('message').innerHTML = '';
    journeys = [];
    stationCounter = {};
    visits = [];
    nodes = [];
}

function drawWeekChart() {
    var ctx = document.getElementById("weekChart");
    var weekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weekdays,
            datasets: [{
                label: 'Number of trips',
                data: weekdays.map(k => daysCounter[k]),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 0, 200, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 0, 200, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function noDataAlert() {
    document.getElementById('message').innerHTML = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> Could not find any valid journeys. Please check you input and try again.</div>';
}

function twttWidgetScan() {
    twttr.widgets.load(
        document.getElementById("output")
    );
}

function emojiit(emoji, times) {
    var result = "";
    for (i in times) {
        result += emoji;
    }
    return result
}

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
    var sum = 0
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
            } else { // else if a journey has *only* an origin (meaning same origin - destination)
                journey.origin = detail;
                journey.destination = detail;
            }
            journey.duration = ( // calculate journey time in seconds
                new Date(journey.date + 'T' + journey.end_time) -
                new Date(journey.date + 'T' + journey.start_time)
            ) / 1000;
            journey.calories = Math.round(journey.duration * 0.07); // see https://www.cyclestreets.net/journey/help/faq/#calories. The calories calculation is based on the journey duration rather than the distance of the route
            journey.calories = Math.round(journey.duration * 0.07); // see https://www.cyclestreets.net/journey/help/faq/#calories based on journey duration rather than distance of the route
            journey.distance_km = Math.round(journey.duration / 3600 * 10 * 100) / 100 // this is based on a presumed 10km/h speed, average for urban cycling
            journey.co2saved_kg = Math.round(journey.distance_km * 0.18641182099 * 100) / 100 // based on distance, which in turn was based on your journey duration. If 100miles saves 30kg C02, then 1km saves 0.18641182099kg
            journeys[count] = journey;
            count++
        }
    }
}
