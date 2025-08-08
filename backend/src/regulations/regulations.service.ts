import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Regulation } from './regulation.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { Agency } from '../agencies/agency.entity';

@Injectable()
export class RegulationsService {
  constructor(
    @InjectRepository(Regulation)
    private readonly regRepo: Repository<Regulation>,
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,
  ) {}

  /**
   * Fetch agencies + word counts, store in DB, return for UI
   */
  async syncAgenciesAndCounts() {
    const [countsRes, agencyRes] = await Promise.all([
      axios.get('https://www.ecfr.gov/api/search/v1/counts/titles'),
      axios.get('https://www.ecfr.gov/api/admin/v1/agencies.json')
    ]);

    const titleCounts: Record<string, number> = countsRes.data?.titles || {};
    const agencies = agencyRes.data?.agencies || [];

    for (const agency of agencies) {
      const totalCount = (agency.cfr_references || [])
        .map((ref: any) => titleCounts[String(ref.title)] || 0)
        .reduce((sum: number, val: number) => sum + val, 0);

      if (totalCount > 0) {
        await this.agencyRepo.upsert(
          { name: agency.name, slug: agency.slug, wordCount: totalCount },
          ['slug']
        );
      }
    }
  }

   async syncRegulationsFromECFR() {
    const agencyRes = await axios.get('https://www.ecfr.gov/api/admin/v1/agencies.json');
    const agencies = agencyRes.data?.agencies || [];
    let addedCount = 0;

    for (const agency of agencies) {
      const titleChapterPairs = agency.cfr_references || [];

      if (!titleChapterPairs.length) continue;

      // Store or fetch the agency
      let dbAgency = await this.agencyRepo.findOne({ where: { name: agency.name } });
      if (!dbAgency) {
        dbAgency = this.agencyRepo.create({ name: agency.name, slug: agency.slug });
        dbAgency = await this.agencyRepo.save(dbAgency);
      }

      for (const ref of titleChapterPairs) {
        const { title, chapter } = ref;
        const partUrl = `https://www.ecfr.gov/api/versioner/v1/title/${title}/chapter/${chapter}/part/1/current.json`;

        try {
          const partRes = await axios.get(partUrl);
          const partText = partRes.data?.nodes?.map((n: any) => n.text || '').join(' ').trim();

          if (partText) {
            const regulation = this.regRepo.create({
              text: partText,
              lastUpdated: new Date(),
              agency: dbAgency,
            });
            await this.regRepo.save(regulation);
            addedCount++;
          }
        } catch (err) {
          console.warn(`Failed to fetch: ${partUrl}`);
        }
      }
    }

    return { message: `Synced regulations. Total added: ${addedCount}` };
  }

  async getWordCountPerAgency() {
    return this.agencyRepo.find({ order: { wordCount: 'DESC' } });
  }

  async getChecksums() {
    const agencies = await this.agencyRepo.find();
    return agencies.map(a => ({
      agency: a.name,
      checksum: this.generateChecksum(a.name + a.wordCount) // or your real logic
    }));
  }

  private generateChecksum(input: string): string {
    const hash = require('crypto').createHash('sha256');
    return hash.update(input).digest('hex').substring(0, 12); // example
  }


  /**
   * Returns historical change counts grouped by date.
   */
  async getHistoricalChanges() {
    return this.regRepo.query(`
      SELECT a.name AS agency,
            DATE(r.lastUpdated) AS change_date,
            COUNT(*) AS changes
      FROM regulation r
      JOIN agency a ON r.agencyId = a.id
      GROUP BY a.name, DATE(r.lastUpdated)
      ORDER BY change_date DESC
    `);
  }

  /**
   * Returns volatility score for each agency based on changes in the last year.
   */
  async getVolatilityScore() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split('T')[0];

    return this.regRepo.query(`
      SELECT a.name AS agency,
             COUNT(DISTINCT r.id) AS sections,
             SUM(CASE WHEN DATE(r.lastUpdated) >= '${dateStr}' THEN 1 ELSE 0 END) AS recent_changes,
             ROUND(
               CAST(SUM(CASE WHEN DATE(r.lastUpdated) >= '${dateStr}' THEN 1 ELSE 0 END) AS FLOAT) 
               / COUNT(DISTINCT r.id), 
               2
             ) AS volatility_score
      FROM regulation r
      JOIN agency a ON r.agencyId = a.id
      GROUP BY a.name
      ORDER BY volatility_score DESC
    `);
  }

 /**
   * Fetches eCFR subset (titles 1–3), parses them, and saves to DB.
   */
async fetchEcfRSubset() {
  console.log('=== Fetching eCFR Titles list ===');
  const titlesRes = await axios.get('https://www.ecfr.gov/api/versioner/v1/titles.json');
  const titles = titlesRes.data?.titles || [];

  // Limit to first 3 titles for this assignment
  for (const titleEntry of titles.slice(0, 3)) {
    const titleNum = titleEntry.number;
    console.log(`\n=== Processing Title ${titleNum} - ${titleEntry.name} ===`);

    // 1. Get Title Structure (chapters and parts)
    const tocUrl = `https://www.ecfr.gov/api/versioner/v1/title/${titleNum}/current.json`;
    let tocData;
    try {
      const tocRes = await axios.get(tocUrl);
      tocData = tocRes.data;
    } catch (err) {
      console.error(`Error fetching TOC for Title ${titleNum}:`, err.message);
      continue;
    }

    if (!tocData?.structure?.children) {
      console.warn(`No chapters found for Title ${titleNum}`);
      continue;
    }

    // 2. Loop chapters (treat each as an agency)
    for (const chapter of tocData.structure.children) {
      const agencyName = chapter.label || `Unknown Agency (Title ${titleNum})`;

      // Save or find Agency
      let agency = await this.agencyRepo.findOne({ where: { name: agencyName } });
      if (!agency) {
        agency = this.agencyRepo.create({ name: agencyName });
        agency = await this.agencyRepo.save(agency);
      }

      console.log(`\n--- Agency: ${agencyName} ---`);

      // 3. Loop parts in chapter
      for (const part of chapter.children || []) {
        if (!part.label) continue;

        const partId = part.label.split(' ')[1]; // e.g., "Part 1" → "1"
        if (!partId) continue;

        const partUrl = `https://www.ecfr.gov/api/versioner/v1/parts/${titleNum}-${partId}.json`;
        let partData;
        try {
          const partRes = await axios.get(partUrl);
          partData = partRes.data;
        } catch (err) {
          console.error(`Error fetching part ${partId} of Title ${titleNum}:`, err.message);
          continue;
        }

        // 4. Extract regulation text from part
        let regText = '';
        if (Array.isArray(partData?.content)) {
          regText = partData.content.map(c => c.text || '').join(' ');
        } else if (partData?.text) {
          regText = partData.text;
        }

        if (!regText.trim()) continue;

        // Save regulation
        const regulation = this.regRepo.create({
          text: regText,
          lastUpdated: new Date(), // could parse from amend_date if available
          agency: agency,
        });

        await this.regRepo.save(regulation);

        console.log(`Saved Part ${partId} for ${agencyName} (${regText.length} chars)`);
      }
    }
  }

  return { status: 'Fetched and saved subset titles 1–3 from eCFR API' };
}

}
