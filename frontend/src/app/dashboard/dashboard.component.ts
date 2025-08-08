import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MOCK_WORD_COUNTS } from 'src/mock/mock-word-count';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  wordCounts: any[] = [];
  checksums: any[] = [];
  history: any[] = [];
  volatility: any[] = [];

  isLoading = false;

  mockWordCounts = MOCK_WORD_COUNTS;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadWordCounts();
    this.loadChecksums();
    this.loadHistory();
    this.loadVolatility();
  }

  refreshData() {
    this.isLoading = true;
    this.api.syncAgencies().subscribe({
      next: data => { this.wordCounts = data ?? []; 
        this.isLoading = false;
        this.loadWordCounts();
      },
      error: err => { console.error('Error refreshing data', err);
        this.wordCounts = [];
        this.isLoading = false;
       }
    });
  }

  loadWordCounts(): void {
    this.api.getWordCounts().subscribe({
      next: data => {
        this.wordCounts = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading word counts', err);
        this.isLoading = false;
      }
    });
  }

  loadChecksums(): void {
    this.api.getChecksums().subscribe({
      next: data => this.checksums = data ?? [],
      error: err => console.error('Error loading checksums', err)
    });
  }

  loadHistory(): void {
    this.api.getHistory().subscribe({
      next: data => this.history = Array.isArray(data) ? data : [],
      error: err => console.error('Error loading history', err)
    });
  }

  loadVolatility(): void {
    this.api.getVolatility().subscribe({
      next: data => this.volatility = data,
      error: err => console.error('Error loading volatility-score', err)
    });
  }
}
