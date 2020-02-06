import { FeatureCollection } from 'geojson';
export declare class PositionsService {
    getTotalCount(): Promise<number>;
    getAllLastPositions(): Promise<FeatureCollection>;
}
export declare class AirportsService {
    getAirports(): Promise<FeatureCollection>;
}
