

$(document).ready(function (e) {
    var routingMap = createMap('routing-map');
    lmap = routingMap;
    setupRoutingAPI(lmap, ghRouting);
});

function locate(map){
    var routingLayer = L.geoJson().addTo(map);
    routingLayer.options = {
        style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
    };
    var ev = {lat:orilat, lng:orilng};

    var iconObject = L.icon({
        iconUrl: './img/marker-icon-green.png',
        shadowSize: [50, 64],
        shadowAnchor: [4, 62],
        iconAnchor: [12, 8]
    });

    L.marker(ev, {icon: iconObject}).addTo(routingLayer);
    map.on('load',  L.marker(ev, {icon: iconObject}).addTo(routingLayer)

    );

    if (ghRouting.points.length > 1) {
        ghRouting.clearPoints();
        routingLayer.clearLayers();
    }

    ghRouting.addPoint(new GHInput(orilat, orilng));
    if (ghRouting.points.length > 1) {
        // ******************
        //  Calculate route!
        // ******************
        ghRouting.doRequest(function (json) {
            if (json.message) {
                var str = "An error occured: " + json.message;
                if (json.hints)
                    str += json.hints;

                $("#routing-response").text(str);

            } else {
                var path = json.paths[0];
                var str = JSON.stringify(json, null, 2);;
                //alert(che);
                routingLayer.addData({
                    "type": "Feature",
                    "geometry": path.points
                });
                var outHtml = "Distance in meter:" + path.distance;
                outHtml += "<br/>Times in seconds:" + path.time / 1000;
                $("#routing-response").html(outHtml);

                if (path.bbox) {
                    var minLon = path.bbox[0];
                    var minLat = path.bbox[1];
                    var maxLon = path.bbox[2];
                    var maxLat = path.bbox[3];
                    var tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                    map.fitBounds(tmpB);
                }

                instructionsDiv.empty();
                if (path.instructions) {
                    var allPoints = path.points.coordinates;
                    var listUL = $("<ol>");
                    instructionsDiv.append(listUL);
                    for (var idx in path.instructions) {
                        var instr = path.instructions[idx];

                        // use 'interval' to find the geometry (list of points) until the next instruction
                        var instruction_points = allPoints.slice(instr.interval[0], instr.interval[1]);

                        // use 'sign' to display e.g. equally named images

                        $("<li>" + instr.text + " <small>(" + ghRouting.getTurnText(instr.sign) + ")</small>"
                            + " for " + instr.distance + "m and " + Math.round(instr.time / 1000) + "sec"
                            + ", geometry points:" + instruction_points.length + "</li>").
                            appendTo(listUL);
                    }
                }
            }
        });
    }
}

function setupRoutingAPI(map, ghRouting) {
    map.setView([44.897912, -68.670838], 16);
    var ev = {lat: 44.8969363, lng: -68.66730580000001};

    var routingLayer = L.geoJson().addTo(map);
    routingLayer.options = {
        style: {color: "#00cc33", "weight": 5, "opacity": 0.6}
    };
    //map.on('load',  L.marker(ev, {icon: iconObject}).addTo(routingLayer)
   // );
    var instructionsDiv = $("#instructions");
    //alert(instructionsDiv);
    map.on('click', function (e) {
       // alert("a");
        if (ghRouting.points.length > 1) {
            ghRouting.clearPoints();
            routingLayer.clearLayers();
        }
        //alert(JSON.stringify(e.latlng, null, 4));
        //alert(e.latlng.lat);
       // var ev = {lat: 44.8969363, lng: -68.66730580000001};
       // L.marker(ev, {icon: iconObject}).addTo(routingLayer);

        L.marker(e.latlng, {icon: iconObject}).addTo(routingLayer);
        ghRouting.addPoint(new GHInput(e.latlng.lat, e.latlng.lng));
        if (ghRouting.points.length > 1) {
            // ******************
            //  Calculate route!
            // ******************
            ghRouting.doRequest(function (json) {
                if (json.message) {
                    var str = "An error occured: " + json.message;
                    if (json.hints)
                        str += json.hints;

                    $("#routing-response").text(str);

                } else {
                    var path = json.paths[0];
                    var str = JSON.stringify(json, null, 2);
                    //alert(che);
                    routingLayer.addData({
                        "type": "Feature",
                        "geometry": path.points
                    });
                    var outHtml = "Distance in meter:" + path.distance;
                    outHtml += "<br/>Times in seconds:" + path.time / 1000;
                    $("#routing-response").html(outHtml);

                    if (path.bbox) {
                        var minLon = path.bbox[0];
                        var minLat = path.bbox[1];
                        var maxLon = path.bbox[2];
                        var maxLat = path.bbox[3];
                        var tmpB = new L.LatLngBounds(new L.LatLng(minLat, minLon), new L.LatLng(maxLat, maxLon));
                        map.fitBounds(tmpB);
                    }

                    instructionsDiv.empty();
                    if (path.instructions) {
                        var allPoints = path.points.coordinates;
                        var listUL = $("<ol>");
                        instructionsDiv.append(listUL);
                        for (var idx in path.instructions) {
                            var instr = path.instructions[idx];

                            // use 'interval' to find the geometry (list of points) until the next instruction
                            var instruction_points = allPoints.slice(instr.interval[0], instr.interval[1]);

                            // use 'sign' to display e.g. equally named images
                            alert(instr.sign);
                            $("<li>" + instr.text + " <small>(" + ghRouting.getTurnText(instr.sign) + ")</small>"
                                    + " for " + instr.distance + "m and " + Math.round(instr.time / 1000) + "sec"
                                    + ", geometry points:" + instruction_points.length + "</li>").
                                    appendTo(listUL);
                        }
                    }
                }
            });
        }
    });

    var instructionsHeader = $("#instructions-header");
    instructionsHeader.click(function () {
        instructionsDiv.toggle();
    });


}


function createMap(divId) {
    var osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    var mapquest = L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>',
        subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
    });

    var openMapSurfer = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
        attribution: osmAttr + ', <a href="http://openmapsurfer.uni-hd.de/contact.html">GIScience Heidelberg</a>'
    });

    var map = L.map(divId, {layers: [mapquest]});
    return map;
}


function testtest(){
    //var routingMap = createMap'routing-map');
    locate(lmap);
}
