GraphHopperOptimization = function (args) {
    this.points = [];
    
    if (args.host)
        this.host = args.host;
    else
        this.host = "http://localhost:8080";
    
    if (args.basePath)
        this.basePath = args.basePath;
    else
        this.basePath = "/vrp";

    this.profile = args.profile;

    if (args.swagger_spec_url)
        this.swagger_spec_url = args.swagger_spec_url;
    else {
        if (this.host.indexOf("localhost") > 0)
            this.swagger_spec_url = "http://localhost:8080/doc/swagger.json"
        else
            this.swagger_spec_url = "https://graphhopper.com/api/1/vrp/swagger.json";
    }

    // console.log(this.swagger_spec_url);
    var that = this;
    $.ajax({
        dataType: "json",
        url: this.swagger_spec_url,
        async: false,
        success: function (json) {
            if (that.host.indexOf("localhost") > 0) {
                json.host = "localhost:8080";
                json.basePath = this.basePath;
                json.schemes = ["http"];
            }

            that.api = new SwaggerClient({
                spec: json,
                success: function () {
                    console.log("api ready " + that.api.host);
                }});
            that.setKey(args.key);
        }
    });
};

GraphHopperOptimization.prototype.setKey = function (key) {
    this.api.clientAuthorizations.add("apiKey", new SwaggerClient.ApiKeyAuthorization("key", key, "query"));
};

GraphHopperOptimization.prototype.addPoint = function (input) {
    this.points.push(input);
};

GraphHopperOptimization.prototype.clear = function () {
    this.points.length = 0;
};

GraphHopperOptimization.prototype.doTSPRequest = function (callback) {
    var that = this;
    var firstPoint = that.points[0];
    var servicesArray = [];
    for (var pointIndex in that.points) {
        if (pointIndex < 1)
            continue;
        var point = that.points[pointIndex];
        var obj = {
            "id": "s" + pointIndex,
            "type": "pickup",
            "name": "maintenance " + pointIndex,
            "address": {
                "location_id": "location_" + pointIndex,
                "lon": point.lng,
                "lat": point.lat
            }
        };
        servicesArray.push(obj);
    }

    var jsonInput = {
        "vehicles": [{
                "vehicle_id": "traveling_salesman",
                "start_address": {
                    "location_id": "ts_start_location",
                    "lon": firstPoint.lng,
                    "lat": firstPoint.lat
                },
                "type_id": "tsp_type_1"
            }],
        "vehicle_types": [{
                "type_id": "tsp_type_1",
                "profile": this.profile,
                "distance_dependent_costs": 1.0,
                "time_dependent_costs": 0.0
            }],
        "services": servicesArray

    };
    console.log(jsonInput);

    that.doRequest(jsonInput, callback);
};

GraphHopperOptimization.prototype.doRequest = function (jsonInput, callback) {
    var that = this;
    var locationMap = {};
    for (var serviceIndex = 0; serviceIndex < jsonInput.services.length; serviceIndex++) {
        var service = jsonInput.services[serviceIndex];
        locationMap[service.address.location_id] = service.address;
    }

    for (var serviceIndex = 0; serviceIndex < jsonInput.vehicles.length; serviceIndex++) {
        var vehicle = jsonInput.vehicles[serviceIndex];
        if (vehicle.start_address)
            locationMap[vehicle.start_address.location_id] = vehicle.start_address;

        if (vehicle.end_address)
            locationMap[vehicle.end_address.location_id] = vehicle.end_address;
    }

    that.api.vrp.postVrp({body: jsonInput}, function (data) {
        var id = data.obj.job_id;
        var timerRet = setInterval(function () {
            console.log("poll solution " + id);
            that.api.solution.getSolution({jobId: id}, function (data) {

                var json = data.obj;
                console.log(json);
                if (json.status === "finished") {
                    console.log("finished");
                    clearInterval(timerRet);
                    if (json.solution) {
                        var sol = json.solution;
                        for (var routeIndex = 0; routeIndex < sol.routes.length; routeIndex++) {
                            var route = sol.routes[routeIndex];
                            for (var actIndex = 0; actIndex < route.activities.length; actIndex++) {
                                var act = route.activities[actIndex];
                                act["address"] = locationMap[act.location_id];
                            }
                        }
                    }
                    callback(json);
                }
                else if (json.message) {
                    clearInterval(timerRet);
                    callback(json);
                }
                else if (data === undefined) {
                    clearInterval(timerRet);
                    var json = {
                        "message": "unknown error in calculation for server on " + that.host
                    };
                    callback(json);
                }

            });
        }, 1000);
    }, function (resp) {
        // console.log("error: " + JSON.stringify(resp));
        var json = {
            "message": "unknown error - server on " + that.host + " does not respond"
        };
        if (resp.statusText && resp.statusText.indexOf('{') === 0)
            json = JSON.parse(resp.statusText);
        callback(json);
    });
};