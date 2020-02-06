/* eslint-disable @typescript-eslint/camelcase */
import { GeoPointType } from './enums';

const elasticConfig = {
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID
  },
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD,
  },
};
const indices = {
  flightTracking: {
    indexPattern: 'flight_tracking*',
    geoField: 'location',
    geoType: GeoPointType.OBJECT,
    body: {
      size: 0,
      query: {
        bool: {
          must: [],
          filter: [
            {
              match_all: {},
            },
            {
              bool: {
                should: [
                  {
                    match: {
                      onGround: false,
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
            {
              range: {
                timePosition: {
                  gte: 'now-15m/m',
                },
              },
            },
          ],
          should: [],
          must_not: [],
        },
      },
      aggs: {
        top_hits: {
          terms: {
            field: 'callsign',
            size: 10000,
          },
          aggs: {
            hits: {
              top_hits: {
                size: 1,
                docvalue_fields: ['location'],
                sort: [
                  {
                    timePosition: {
                      order: 'desc',
                    },
                  },
                ],
                _source: {
                  includes: [
                    'callsign',
                    'originCountry',
                    'geoAltitude',
                    'velocity'],
                },
              },
            },
          },
        },
      },
    },
  },
  airports: {
    indexPattern: 'airports',
    geoField: 'coordinates',
    geoType: GeoPointType.ARRAY,
    fields: ['coordinates', 'featurecla', 'type', 'name', 'abbrev'],
  },
};

export { elasticConfig, indices };
