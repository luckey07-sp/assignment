import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // Matches backend: POST /api/sync-agencies
  syncAgencies(): Observable<any> {
    return this.http.post<any[]>(`${this.API_BASE}/sync-agencies`, {});
  }

  // Matches backend: GET /api/word-count
  getWordCounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/word-counts`);
  }

  // Matches backend: GET /api/checksums
  getChecksums(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/checksums`);
  }

  // Matches backend: GET /api/history
  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/history`);
  }

  // Matches backend: GET /api/volatility-score
  getVolatility(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/volatility-score`);
  }
  
  getRegulations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/regulations`);
  }

  syncRegulations(): Observable<any> {
    return this.http.get(`${this.API_BASE}/sync-regulations`);
  }
}
