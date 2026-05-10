import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { DonationService } from '../../../../core/services/api.services';
import { Donation, DonationStats } from '../../../../shared/models';

@Component({
  selector: 'app-admin-donations',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TitleCasePipe, DatePipe],
  template: `
    <h2 class="dash-title">Doações</h2>
    @if (stats()) {
      <div class="summary-cards">
        <div class="sum-card teal-bg">
          <div class="sum-label">Total arrecadado</div>
          <div class="sum-val">{{ stats()?.totalAmount ?? 0 | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-label">Total de doações</div>
          <div class="sum-val">{{ stats()?.totalDonations ?? 0 }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-label">Valor médio</div>
          <div class="sum-val">{{ stats()?.averageAmount ?? 0 | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
        </div>
      </div>
    }
    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (donations().length === 0) {
      <div class="empty-state">
        <div class="icon">💰</div>
        <h3>Nenhuma doação ainda</h3>
        <p>As doações aparecerão aqui quando realizadas.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Doador</th><th>E-mail</th><th>Valor</th><th>Mensagem</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>
            @for (d of donations(); track d.id) {
              <tr>
                <td><strong>{{ d.name || 'Anônimo' }}</strong></td>
                <td><span class="sub-text">{{ d.email || '–' }}</span></td>
                <td><strong>{{ d.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong></td>
                <td><span class="sub-text">{{ d.message || '–' }}</span></td>
                <td><span class="status-pill" [ngClass]="'pill-' + d.status.toLowerCase()">{{ d.status | titlecase }}</span></td>
                <td>{{ d.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; margin-bottom: 1.5rem; }
    .summary-cards { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .sum-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; flex: 1; min-width: 160px; }
    .sum-card.teal-bg { background: var(--teal-light); }
    .sum-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .sum-val { font-family: 'Lora', serif; font-size: 1.6rem; color: var(--teal-dark); font-weight: 600; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .sub-text { font-size: 12px; color: var(--muted); }
  `]
})
export class AdminDonationsComponent implements OnInit {
  donationSvc = inject(DonationService);
  donations   = signal<Donation[]>([]);
  stats       = signal<DonationStats | null>(null);
  loading     = signal(true);
  ngOnInit(): void {
    this.donationSvc.stats().subscribe({ next: (s: any) => this.stats.set(s) });
    this.donationSvc.listAll().subscribe({
      next: (d: any) => { this.donations.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
