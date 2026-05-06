import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface LicenseStatus {
  allowed: boolean;
  tenant_id: string;
  feature: string;
  reason: string;
  status: string;
  tier?: string;
  valid_until?: string;
  notify_channels?: string[];
}

@Component({
  selector: 'eaol-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly http = inject(HttpClient);

  apiBase = 'http://localhost:8000';
  tenantId = 'firma-it';
  question = 'Warum ist die Payments API am 5. Mai 2026 langsamer geworden?';
  output = 'Ready. Connect to EAOL backend on http://localhost:8000.';
  license?: LicenseStatus;

  checkHealth(): void {
    this.get('/health');
  }

  checkLicense(): void {
    this.http.get<LicenseStatus>(`${this.apiBase}/api/v1/licenses/${this.tenantId}/features/causal_intelligence`)
      .subscribe({
        next: (value) => { this.license = value; this.output = JSON.stringify(value, null, 2); },
        error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
      });
  }

  loadAudit(): void {
    this.get(`/api/v1/audit/${this.tenantId}`);
  }

  runGermanAnalysis(): void {
    const body = {
      tenant_id: this.tenantId,
      case_id: 'pilot-it-payments-latency-2026-05-05',
      question: this.question,
      signals: [
        { type: 'incident', name: 'Payments API latency spike', value: '1200 affected users, 47 minutes downtime', source: 'Jira', confidence: 0.93 },
        { type: 'process', name: 'Deploy payments-api version 2.14.0', value: 'High-risk change implemented 15 minutes before incident', source: 'Jira', confidence: 0.89 },
        { type: 'risk', name: 'Database connection pool exhausted', value: '98% DB connections used, threshold 80%', source: 'Datadog', confidence: 0.91 }
      ]
    };
    this.http.post(`${this.apiBase}/api/v1/causal-analysis`, body).subscribe({
      next: (value) => this.output = JSON.stringify(value, null, 2),
      error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
    });
  }

  private get(path: string): void {
    this.http.get(`${this.apiBase}${path}`).subscribe({
      next: (value) => this.output = JSON.stringify(value, null, 2),
      error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
    });
  }
}
