# JavaScript client for the Directions API

Try the live demos [here](https://graphhopper.com/api/1/examples/). Also see how we integrated the Routing and the Geocoding API to build a fully featured maps application called [GraphHopper Maps](https://graphhopper.com/maps/)

First step to play with the code is to get this repository:

```bash
git clone https://github.com/graphhopper/directions-api-js-client/
```

Now open index.html in your browser.

## Dependencies

Currently all JavaScript clients require jQuery (tested with 2.1.0) and the
small file [GHUtil.js](./js/GHUtil.js), both included in this repository.

## Integrate the APIs in your application

### GraphHopper Routing API

![GraphHopper Routing API screenshot](./img/screenshot-routing.png)

You need [the routing client](./js/GraphHopperRouting.js).

There is also a different client developed from the community [here](https://www.npmjs.com/package/lrm-graphhopper).

### GraphHopper Tour Optimization API

![Tour Optimization API screenshot](./img/screenshot-vrp.png)

You need [the optimization client](./js/GraphHopperOptimization.js).

### GraphHopper Matrix API

![GraphHopper Matrix API screenshot](./img/screenshot-matrix.png)

You need [the matrix client](./js/GraphHopperMatrix.js).

### GraphHopper Geocoding API

![GraphHopper Geocoding API screenshot](./img/screenshot-geocoding.png)

You need [the geocoding client](./js/GraphHopperGeocoding.js).

## License

Code stands under Apache License 2.0

# GraphHopper_Example
