# OpenSky viewer example

Example application that provides a simple API to query a Elasticsearch cluster, and a web viewer to render two layers on a map. The application is split into front and backend subprojects:

* `backend`: [NestJS](https://nestjs.com/) project with controllers and service logic separated. Configuration to connect to the Elastic cluster is located at `config.ts`. By default it assumes you are using Elastic Cloud so you need to provide environment variables for the Cloud ID, a user and password. Adapting this to a self hosted environment is trivial. Configuration to run locally can be provided using a `.env` file. The API exposes:
  
  * `/airports/geojson`: a GeoJSON representation of the entire index
  * `/positions/last/geojson`: filtering the last 15 minutes, a single last position per flight including some additional data; all represented as a GeoJSON source
  * `/positions/count/all`: a count for all the positions stored in the index
  * `/positions/last/feature`: the last record in the index ordered by date

* `frontend`: Simple viewer using React + Mapbox GL JS + Elastic UI to present a minimal dashboard with the map and some additional information.

Check the different `package.json` scripts to see how the frontend is built and then the backend statically mounts the resulting `build` folder as the root.

## Elastic data

The backend asumes the following indices in your cluster:

* `airports`: an index with the airports of the world. You can use Elastic Maps GeoJSON Upload to push [this file](https://github.com/jsanz/wecode20/blob/master/lab/airports/airports.geo.json) or find your way to upload the original dataset from [Natural Earth](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/airports/).
* `flight_tracking*`: one or more indexes with flight positions imported from the OpenSky network. You can upload data in realtime or do a one-off with the scripts provided all in [this folder](https://github.com/jsanz/wecode20/tree/master/lab/opensky-loader).