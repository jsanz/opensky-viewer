"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@elastic/elasticsearch");
const config_1 = require("./config");
const esClient = new elasticsearch_1.Client(config_1.elasticConfig);
const getAggFlight = function (buckets) {
    const features = buckets.map(b => {
        const hits = b.hits.hits;
        const docCount = hits.total.value;
        const source = hits.hits[0];
        const timePosition = source.sort[0];
        const props = source._source;
        const geometry = {
            type: 'Point',
            coordinates: source.fields.location,
        };
        const properties = Object.assign({ docCount,
            timePosition }, props);
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
let PositionsService = class PositionsService {
    async getTotalCount() {
        const { indexPattern } = config_1.indices.flightTracking;
        const results = await esClient.count({
            index: indexPattern,
        });
        if (results.statusCode == 200) {
            return results.body.count;
        }
        else {
            throw new Error('Something happened retrieving the count');
        }
    }
    async getAllLastPositions() {
        const { indexPattern, body } = config_1.indices.flightTracking;
        const results = await esClient.search({
            index: indexPattern,
            body,
        });
        if (results.statusCode == 200) {
            return getAggFlight(results.body.aggregations.top_hits.buckets);
        }
        else {
            throw new Error('ErrorRetrieving last positions');
        }
    }
};
PositionsService = __decorate([
    common_1.Injectable()
], PositionsService);
exports.PositionsService = PositionsService;
let AirportsService = class AirportsService {
    async getAirports() {
        var _a;
        const { indexPattern, fields, geoField, geoType } = config_1.indices.airports;
        const results = await esClient.search({
            index: indexPattern,
            size: 10000,
            _source: fields,
            body: {
                query: { match_all: {} },
            },
        });
        if (results.statusCode == 200) {
            const features = (_a = results.body) === null || _a === void 0 ? void 0 : _a.hits.hits.map(hit => {
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
                };
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
        }
        else {
            throw new Error('Error getting the airports');
        }
    }
};
AirportsService = __decorate([
    common_1.Injectable()
], AirportsService);
exports.AirportsService = AirportsService;
//# sourceMappingURL=services.js.map