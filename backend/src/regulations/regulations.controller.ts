import { Controller, Get, Post } from '@nestjs/common';
import { RegulationsService } from './regulations.service';

@Controller('api')
export class RegulationsController {
  constructor(private readonly regulationsService: RegulationsService) {}

  @Post('sync-agencies')
  async syncAgencies() {
    try {
      const results = await this.regulationsService.syncAgenciesAndCounts();
      return results; // ✅ must return array, not object
    } catch (error) {
      console.error('Failed to sync agencies:', error);
      throw error;
    }
  }

  @Get('/sync-regulations')
  async syncRegs() {
    return this.regulationsService.syncRegulationsFromECFR();
  }

  @Get('word-counts')
  getWordCount() {
    return this.regulationsService.getWordCountPerAgency();
  }

  @Get('checksums')
  getChecksums() {
    return this.regulationsService.getChecksums();
  }

  @Get('history')
  getHistory() {
    return this.regulationsService.getHistoricalChanges();
  }

  @Get('volatility-score')
  getVolatility() {
    return this.regulationsService.getVolatilityScore();
  }

  @Get('fetch-ecfr')
  fetchEcfR() {
    return this.regulationsService.fetchEcfRSubset();
  }
}
