import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AirportsService, PositionsService } from './services'
import { FeatureCollection } from 'geojson';

@Controller('positions')
export class PositionsController { 
    constructor(private readonly service: PositionsService) {}
    @Get('count/all')
    getAll(){
        return this.service.getTotalCount();
    }

    @Get('last/geojson')
    getLastPositionsAsGeoJSON(){
        return this.service.getAllLastPositions();
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