"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const elasticConfig = {
    cloud: {
        id: process.env.ELASTIC_CLOUD_ID
    },
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD,
    },
};
exports.elasticConfig = elasticConfig;
const indices = {
    flightTracking: {
        indexPattern: 'flight_tracking*',
        geoField: 'location',
        geoType: enums_1.GeoPointType.OBJECT,
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
                                        'velocity'
                                    ],
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
        geoType: enums_1.GeoPointType.ARRAY,
        fields: ['coordinates', 'featurecla', 'type', 'name', 'abbrev'],
    },
};
exports.indices = indices;
//# sourceMappingURL=config.js.map