GraphHopperMatrix = function (args) {
    this.copyProperties(args, this);
    this.from_points = [];
    this.to_points = [];
    this.out_arrays = [];

    this.graphhopper_maps_host = "https://graphhopper.com/maps/?";
};

GraphHopperMatrix.prototype.copyProperties = function (args, argsInto) {
    if (!args)
        return argsInto;

    if (args.host)
        argsInto.host = args.host;
    else
        argsInto.host = "https://graphhopper.com/api/1";

    if (args.vehicle)
        argsInto.vehicle = args.vehicle;
    else
        argsInto.vehicle = "car";

    if (args.key)
        argsInto.key = args.key;

    if (args.debug)
        argsInto.debug = args.debug;
    else
        argsInto.debug = false;

    if (args.data_type)
        argsInto.data_type = args.data_type;
    else
        argsInto.data_type = "json";

    return argsInto;
};

GraphHopperMatrix.prototype.addPoint = function (latlon) {
    this.addFromPoint(latlon);
    this.addToPoint(latlon);
};

GraphHopperMatrix.prototype.addFromPoint = function (latlon) {
    this.from_points.push(latlon);
};

GraphHopperMatrix.prototype.addToPoint = function (latlon) {
    this.to_points.push(latlon);
};

GraphHopperMatrix.prototype.clearPoints = function () {
    this.from_points.length = 0;
    this.to_points.length = 0;
};

GraphHopperMatrix.prototype.addOutArray = function (type) {
    this.out_arrays.push(type);
};

GraphHopperMatrix.prototype.doRequest = function (callback, args) {
    var that = this;
    args = that.copyProperties(args, graphhopper.util.clone(that));
    var url = args.host + "/matrix?vehicle=" + args.vehicle + "&key=" + args.key;

    for (var idx in args.from_points) {
        var p = args.from_points[idx];
        url += "&from_point=" + encodeURIComponent(p.toString());
    }
    for (var idx in args.to_points) {
        var p = args.to_points[idx];
        url += "&to_point=" + encodeURIComponent(p.toString());
    }

    if (args.out_arrays) {
        for (var idx in args.out_arrays) {
            var type = args.out_arrays[idx];
            url += "&out_array=" + type;
        }
    }

    if (args.debug)
        url += "&debug=true";

    $.ajax({
        timeout: 30000,
        url: url,
        type: "GET",
        dataType: args.data_type,
        crossDomain: true
    }).done(function (json) {
        callback(json);

    }).fail(function (jqXHR) {

        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
            callback(jqXHR.responseJSON);

        } else {
            callback({
                "message": "Unknown error",
                "details": "Error for " + url
            });
        }
    });
};

GraphHopperMatrix.prototype.toHtmlTable = function (doubleArray) {
    var htmlOut = "<table border='1' cellpadding='10'>";

    // header => to points
    htmlOut += "<tr>";

    // upper left corner:
    htmlOut += "<td>&#8595; from &#92; to &#8594;</td>";

    // header with to points
    for (var idxTo in this.to_points) {
        htmlOut += "<td><b>" + this.to_points[idxTo] + "</b></td>";
    }
    htmlOut += "</tr>";

    for (var idxFrom in doubleArray) {
        htmlOut += "<tr>";
        htmlOut += "<td><b>" + this.from_points[idxFrom] + "</b></td>";
        var res = doubleArray[idxFrom];
        for (var idxTo in res) {
            var mapsURL = this.graphhopper_maps_host
                    + "point=" + encodeURIComponent(this.from_points[idxFrom])
                    + "&point=" + encodeURIComponent(this.to_points[idxTo])
                    + "&vehicle=" + this.vehicle;

            htmlOut += "<td> <a href='" + mapsURL + "'>" + res[idxTo] + "</a> </td>";
        }
        htmlOut += "</tr>\n";
    }
    htmlOut += "</table>";
    return htmlOut;
};
