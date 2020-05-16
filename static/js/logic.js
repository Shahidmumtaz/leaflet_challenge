// Establish link
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function markerSize(mag) {
    return mag * 20000;
}

function markerColor(mag) {
    if (mag <= 1) {
        return "#39FF33";
    } else if (mag <= 2) {
        return "#E5FF33";
    } else if (mag <= 3) {
        return "#FFE333";
    } else if (mag <= 4) {
        return "#FFBF33";
    } else if (mag <= 5) {
        return "#FF9033";
    } else {
        return "#FF3333";
    };
}

// GET request to the query URL
d3.json(link, function(data) {
    // send data.features object to createFeatures function after response
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        // Give each feature a popup describing the place and time of the earthquake
        onEachFeature: function(feature, layer) {

            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " + feature.properties.mag + "</p>")
        },

        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.properties.mag),
                fillOpacity: 1,
                stroke: false,
            })
        }
    });



    // Sending the earthquakes layer to createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define the map layers
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define the basemaps
    var baseMaps = {
        "Satellite Map": satellitemap,
        "Light Map": lightmap
    };

    // Create overlay object for overlay laye
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, displaying the satellitemap and earthquakes layer
    var myMap = L.map("map", {
        center: [7, -112],
        zoom: 3,
        layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' +
                +magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }

        return div;
    };

    legend.addTo(myMap);

}