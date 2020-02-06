import { AirportsService, PositionsService } from './services';
import { FeatureCollection } from 'geojson';
export declare class PositionsController {
    private readonly service;
    constructor(service: PositionsService);
    getAll(): Promise<number>;
    getLastPositionsAsGeoJSON(): Promise<FeatureCollection<import("geojson").Geometry, {
        [name: string]: any;
    }>>;
}
export declare class AirportsController {
    private readonly service;
    constructor(service: AirportsService);
    getAll(): Promise<FeatureCollection>;
}
