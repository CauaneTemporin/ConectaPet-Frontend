import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DonationService } from '../../../core/services/api.services';
import { Donation } from '../../../shared/models';

@Component({
  selector: 'app-my-donations',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Minhas Doações</h2>
      <a routerLink="/como-doar" class="btn btn-rose btn-sm">+ Nova doação</a>
    </div>
    @if (loading()) {
      <div class="loading-row"><div class="spin"></div></div>
    } @else if (donations().length === 0) {
      <div class="empty-state">
        <div class="icon">♥</div>
        <h3>Nenhuma doação ainda</h3>
        <p>Faça a diferença na vida de um animal!</p>
        <a routerLink="/como-doar" class="btn btn-rose" style="margin-top:1rem">Fazer doação</a>
      </div>
    } @else {
      <div class="summary-cards">
        <div class="sum-card">
          <div class="sum-label">Total doado</div>
          <div class="sum-val">{{ totalDoado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-label">Número de doações</div>
          <div class="sum-val">{{ donations().length }}</div>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>
            @for (d of donations(); track d.id) {
              <tr>
                <td><strong>{{ d.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong></td>
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
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .summary-cards { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .sum-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; flex: 1; }
    .sum-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .sum-val { font-family: 'Lora', serif; font-size: 1.6rem; color: var(--teal-dark); font-weight: 600; }
  `]
})
export class MyDonationsComponent implements OnInit {
  donationSvc = inject(DonationService);
  donations   = signal<Donation[]>([]);
  loading     = signal(true);
  ngOnInit(): void {
    this.donationSvc.mine().subscribe({
      next: (d: any) => { this.donations.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  totalDoado(): number { return this.donations().reduce((acc: number, d: any) => acc + Number(d.amount), 0); }
}
