# OpenSky viewer example

Example application that provides a simple API to query a Elasticsearch cluster, and a web viewer to render two layers on a map. The application is split into front and back-end subprojects:

* `backend`: [NestJS](https://nestjs.com/) project with [controllers](./backend/src/controllers.ts) and [service](./backend/src/services.ts) logic separated. Configuration to connect to the Elastic cluster is located at [`config.ts`](./backend/src/config.ts). Using environment variables or an `.env` file you can run the application against [Elastic Cloud](https://cloud.elastic.co/) or any host. Adapting this to other configurations would need to tweak the `config.ts` file according to [the docs](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html).

  The API exposes:
  
  * `/airports/geojson`: a GeoJSON representation of the entire index
  * `/positions/last/geojson`: filtering the last 15 minutes, a single last position per flight including some additional data; all represented as a GeoJSON source
  * `/positions/count/all`: a count for all the positions stored in the index
  * `/positions/last/feature`: the last record in the index ordered by date

* `frontend`: Simple viewer using [React](https://reactjs.org/) + [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js) + [Elastic UI](https://elastic.github.io/eui/#/) to present a minimal dashboard with the map and some additional information.


## Elastic data

The backend assumes the following indices in your cluster:

* `airports`: an index with the airports of the world. You can use Elastic Maps GeoJSON Upload to push [this file](https://github.com/jsanz/wecode20/blob/master/lab/airports/airports.geo.json) or find your way to upload the original dataset from [Natural Earth](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/airports/).
* `flight_tracking*`: one or more indexes with flight positions imported from the OpenSky network. You can upload data in realtime or do a one-off with the scripts provided all in [this folder](https://github.com/jsanz/wecode20/tree/master/lab/opensky-loader).

## Deploy

Check the different `package.json` scripts to see how the front-end is built and then `backend` statically mounts the resulting `/frontend/build` folder as its root.

The [`package.json`](./package.json) and [`Procfile`](./Procfile) allow to deploy this project to [Heroku](https://www.heroku.com/), but any other NodeJS compatible PaaS should work as well.
