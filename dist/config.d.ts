import { GeoPointType } from './enums';
declare const elasticConfig: {
    cloud: {
        id: string;
    };
    auth: {
        username: string;
        password: string;
    };
};
declare const indices: {
    flightTracking: {
        indexPattern: string;
        geoField: string;
        geoType: GeoPointType;
        body: {
            size: number;
            query: {
                bool: {
                    must: any[];
                    filter: ({
                        match_all: {};
                        bool?: undefined;
                        range?: undefined;
                    } | {
                        bool: {
                            should: {
                                match: {
                                    onGround: boolean;
                                };
                            }[];
                            minimum_should_match: number;
                        };
                        match_all?: undefined;
                        range?: undefined;
                    } | {
                        range: {
                            timePosition: {
                                gte: string;
                            };
                        };
                        match_all?: undefined;
                        bool?: undefined;
                    })[];
                    should: any[];
                    must_not: any[];
                };
            };
            aggs: {
                top_hits: {
                    terms: {
                        field: string;
                        size: number;
                    };
                    aggs: {
                        hits: {
                            top_hits: {
                                size: number;
                                docvalue_fields: string[];
                                sort: {
                                    timePosition: {
                                        order: string;
                                    };
                                }[];
                                _source: {
                                    includes: string[];
                                };
                            };
                        };
                    };
                };
            };
        };
    };
    airports: {
        indexPattern: string;
        geoField: string;
        geoType: GeoPointType;
        fields: string[];
    };
};
export { elasticConfig, indices };
