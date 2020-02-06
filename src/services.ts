import { Injectable } from '@nestjs/common';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { Point, Feature, FeatureCollection } from 'geojson';

import { elasticConfig, indices } from './config';
import { GeoPointType } from './enums';

const esClient = new Client(elasticConfig);


/*
Traverse the ElasticSearch aggregation result to extract the geometry and properties
*/
const getAggFlight = function(buckets): FeatureCollection {
  const features: Feature[] = buckets.map(b => {
    const hits = b.hits.hits;
    const docCount = hits.total.value;
    const source = hits.hits[0];

    const timePosition = source.sort[0];
    const props = source._source;

    const geometry = {
      type: 'Point',
      coordinates: source.fields.location,
    };

    const properties = {
      docCount,
      timePosition,
      ...props,
    };

    return {
      type: 'Feature',
      geometry,
      properties,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
};

@Injectable()
export class PositionsService {
  async getTotalCount(): Promise<number> {
    const { indexPattern } = indices.flightTracking;
    const results: ApiResponse = await esClient.count({
      index: indexPattern,
    });
    if (results.statusCode == 200) {
      return results.body.count;
    } else {
      throw new Error('Something happened retrieving the count');
    }
  }

  async getAllLastPositions(): Promise<FeatureCollection> {
    const { indexPattern, body } = indices.flightTracking;
    const results: ApiResponse = await esClient.search({
      index: indexPattern,
      body,
    });
    if (results.statusCode == 200) {
      return getAggFlight(results.body.aggregations.top_hits.buckets);
    } else {
      throw new Error('ErrorRetrieving last positions');
    }
  }
}

@Injectable()
export class AirportsService {
  /*
    Get all airports as a GeoJSON Feature Collection
    */
  async getAirports(): Promise<FeatureCollection> {
    const { indexPattern, fields, geoField, geoType } = indices.airports;
    const results: ApiResponse = await esClient.search({
      index: indexPattern,
      size: 10000,
      _source: fields,
      body: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        query: { match_all: {} },
      },
    });

    if (results.statusCode == 200) {
      const features: Feature[] = results.body?.hits.hits.map(hit => {
        const source = hit._source;
        const properties = Object.keys(source)
          .filter(key => key !== geoField)
          .reduce((obj, key) => {
            obj[key] = source[key];
            return obj;
          }, {});
        const geometry = {
          type: 'Point',
          coordinates: source[geoField]
        }
        return {
          type: 'Feature',
          properties,
          geometry,
        };
      });
      return {
        type: 'FeatureCollection',
        features,
      };
    } else {
      throw new Error('Error getting the airports');
    }
  }
}
