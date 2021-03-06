import { Controller, Get} from '@nestjs/common';
import { AirportsService, PositionsService } from './services'
import { FeatureCollection } from 'geojson';

@Controller('positions')
export class PositionsController { 
    constructor(private readonly service: PositionsService) {}
    @Get('count/all')
    getAll(){
        return this.service.getTotalCount();
    }

    @Get('last/feature')
    getLastPosition(){
        return this.service.getLastPosition();
    }

    @Get('last/geojson')
    async getLastPositionsAsGeoJSON(){
        const positions = await this.service.getAllLastPositions();
        console.log('Last positions: ', positions.features.length) 
        return positions;
    }
}



@Controller('airports')
export class AirportsController {
    constructor(private readonly service: AirportsService) {}

    @Get('geojson')
    async getAll(): Promise<FeatureCollection>{
        return this.service.getAirports()
    }

}