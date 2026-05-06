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
  customerName = 'Firma IT Pilot GmbH';
  adminEmail = 'admin@firma-it.local';
  validFrom = '2026-05-06T00:00:00Z';
  validUntil = '2026-06-06T23:59:00Z';
  integrationType = 'jira';
  integrationName = 'Firma Jira Cloud';
  integrationBaseUrl = 'https://firma-it.atlassian.net';
  question = 'Warum ist die Payments API am 5. Mai 2026 langsamer geworden?';
  output = 'Ready. Connect to EAOL backend on http://localhost:8000.';
  license?: LicenseStatus;

  checkHealth(): void { this.get('/health'); }
  listCustomers(): void { this.get('/api/v1/admin/customers'); }
  listIntegrations(): void { this.get(`/api/v1/admin/integrations/${this.tenantId}`); }
  loadAudit(): void { this.get(`/api/v1/audit/${this.tenantId}`); }

  createCustomer(): void {
    this.post('/api/v1/admin/customers', {
      tenant_id: this.tenantId,
      name: this.customerName,
      sector: 'it_operations',
      country: 'DE',
      admin_email: this.adminEmail,
      status: 'trial'
    });
  }

  assignLicense(): void {
    this.post(`/api/v1/admin/customers/${this.tenantId}/license`, {
      tenant_id: this.tenantId,
      customer_name: this.customerName,
      tier: 'enterprise',
      valid_from: this.validFrom,
      valid_until: this.validUntil,
      max_users: 75,
      max_connectors: 6,
      max_events_per_month: 100000,
      features: ['causal_intelligence', 'csv_import', 'it_pilot', 'dashboard', 'notifications', 'camunda_workflows'],
      notification_channels: ['email', 'teams', 'slack', 'webhook', 'in_app', 'sms']
    });
  }

  createIntegration(): void {
    this.post('/api/v1/admin/integrations', {
      tenant_id: this.tenantId,
      integration_type: this.integrationType,
      name: this.integrationName,
      base_url: this.integrationBaseUrl,
      auth_mode: 'api_token',
      scopes: ['read'],
      config: { api_token: 'demo-token-redacted', project_key: 'ITOPS' }
    });
  }

  checkLicense(): void {
    this.http.get<LicenseStatus>(`${this.apiBase}/api/v1/licenses/${this.tenantId}/features/causal_intelligence`)
      .subscribe({
        next: (value) => { this.license = value; this.output = JSON.stringify(value, null, 2); },
        error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
      });
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
    this.post('/api/v1/causal-analysis', body);
  }

  private get(path: string): void {
    this.http.get(`${this.apiBase}${path}`).subscribe({
      next: (value) => this.output = JSON.stringify(value, null, 2),
      error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
    });
  }

  private post(path: string, body: unknown): void {
    this.http.post(`${this.apiBase}${path}`, body).subscribe({
      next: (value) => this.output = JSON.stringify(value, null, 2),
      error: (err) => this.output = JSON.stringify(err.error ?? err, null, 2)
    });
  }
}
