import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdoptionService, DonationService, GodparentService, AdminService } from '../../../core/services/api.services';
import { AuthService } from '../../../core/services/auth.service';

interface StatCard { label: string; value: string | number; sub: string; icon: string; }

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-header">
      <h2 class="dash-title">Bem-vindo, {{ firstName() }}! 🐾</h2>
      <button class="btn-refresh" (click)="load()" [disabled]="loading()" title="Atualizar dados">
        <span [class.spin]="loading()">↻</span>
        {{ loading() ? 'Atualizando...' : 'Atualizar' }}
      </button>
    </div>

    @if (loading() && statCards().length === 0) {
      <div class="loading-row"><div class="spin-circle"></div></div>
    } @else {
      <div class="stats-grid">
        @for (card of statCards(); track card.label) {
          <div class="stat-card">
            <div class="card-icon">{{ card.icon }}</div>
            <div class="label">{{ card.label }}</div>
            <div class="value">{{ card.value }}</div>
            <div class="sub">{{ card.sub }}</div>
          </div>
        }
      </div>
    }

    @if (lastUpdated()) {
      <p class="last-updated">Atualizado às {{ lastUpdated() }}</p>
    }

    <p class="hint">Use o menu lateral para gerenciar suas adoções, doações e afilhados.</p>
  `,
  styles: [`
    .overview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.6rem; margin: 0; }

    .btn-refresh {
      display: flex; align-items: center; gap: 6px;
      background: white; border: 1.5px solid var(--border);
      color: var(--teal-dark); font-family: 'Nunito', sans-serif;
      font-size: 13px; font-weight: 700; padding: .45rem 1rem;
      border-radius: 99px; cursor: pointer; transition: all .2s;
      &:hover:not(:disabled) { background: var(--teal-light); border-color: var(--teal); }
      &:disabled { opacity: .55; cursor: not-allowed; }
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }

    .stat-card {
      background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem;
      transition: transform .2s, box-shadow .2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.06); }
    }
    .card-icon { font-size: 1.4rem; margin-bottom: 8px; }
    .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .value { font-family: 'Lora', serif; font-size: 1.8rem; color: var(--forest); font-weight: 600; }
    .sub   { font-size: 11.5px; color: var(--teal-dark); margin-top: 2px; }

    .loading-row { display: flex; justify-content: center; padding: 2rem; }
    .spin-circle { width: 30px; height: 30px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }

    .spin { display: inline-block; animation: spin .7s linear infinite; font-size: 1.1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .last-updated { font-size: 11.5px; color: var(--muted); margin-bottom: 1rem; }
    .hint { font-size: 13.5px; color: var(--muted); line-height: 1.8; }
  `]
})
export class OverviewComponent implements OnInit {
  private auth         = inject(AuthService);
  private adoptionSvc  = inject(AdoptionService);
  private donationSvc  = inject(DonationService);
  private godparentSvc = inject(GodparentService);
  private adminSvc     = inject(AdminService);

  statCards   = signal<StatCard[]>([]);
  loading     = signal(false);
  lastUpdated = signal('');

  firstName(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ')[0] ?? name;
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    if (this.auth.isAdmin()) {
      this.adminSvc.stats().subscribe({
        next: (s: any) => {
          this.statCards.set(this.buildAdminCards(s));
          this.loading.set(false);
          this.lastUpdated.set(new Date().toLocaleTimeString('pt-BR'));
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loadUserStats();
    }
  }

  private loadUserStats(): void {
    let adoptions = 0, donations = 0, godparents = 0;
    let done = 0;
    const check = () => {
      done++;
      if (done === 3) {
        this.statCards.set([
          { icon: '🏠', label: 'Adoções solicitadas',  value: adoptions,  sub: 'total' },
          { icon: '♥',  label: 'Doações realizadas',   value: donations,  sub: 'total' },
          { icon: '⭐', label: 'Animais apadrinhados', value: godparents, sub: 'ativos' },
        ]);
        this.loading.set(false);
        this.lastUpdated.set(new Date().toLocaleTimeString('pt-BR'));
      }
    };
    this.adoptionSvc.mine().subscribe({  next: (a: any) => { adoptions  = a.length; check(); }, error: () => check() });
    this.donationSvc.mine().subscribe({  next: (d: any) => { donations  = d.length; check(); }, error: () => check() });
    this.godparentSvc.mine().subscribe({ next: (g: any) => { godparents = g.length; check(); }, error: () => check() });
  }

  private buildAdminCards(raw: any): StatCard[] {
    // aceita tanto o nome da doc (animalsAdopted) quanto variantes do backend
    const adopted   = raw.animalsAdopted   ?? raw.adoptedAnimals   ?? 0;
    const available = raw.animalsAvailable ?? raw.availableAnimals ?? 0;
    const pending   = raw.adoptionsPending ?? raw.pendingAdoptions  ?? 0;

    return [
      { icon: '🐾', label: 'Animais disponíveis', value: available,                          sub: `de ${raw.totalAnimals ?? 0} total` },
      { icon: '🏠', label: 'Adotados',            value: adopted,                            sub: 'animais' },
      { icon: '👤', label: 'Usuários',            value: raw.totalUsers        ?? 0,         sub: 'cadastrados' },
      { icon: '📋', label: 'Adoções pendentes',   value: pending,                            sub: 'aguardando' },
      { icon: '💰', label: 'Total arrecadado',    value: this.fmtCurrency(raw.totalDonations ?? 0), sub: 'confirmado' },
      { icon: '🤝', label: 'Voluntários',         value: raw.totalVolunteers   ?? 0,         sub: 'ativos' },
      { icon: '⭐', label: 'Padrinhos',           value: raw.totalGodparents   ?? 0,         sub: `${raw.godparentsPending ?? 0} pendentes` },
      { icon: '✉️', label: 'Msgs não lidas',      value: raw.unreadContacts    ?? 0,         sub: 'pendentes' },
    ];
  }

  private fmtCurrency(n: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  }
}
