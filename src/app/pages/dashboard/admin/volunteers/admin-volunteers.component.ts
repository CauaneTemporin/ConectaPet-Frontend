import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Volunteer, SkillEntry } from '../../../../shared/models';

@Component({
  selector: 'app-admin-volunteers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Voluntários</h2>
        <p class="page-sub">Aprove ou rejeite solicitações de voluntários.</p>
      </div>

      <div class="filter-tabs">
        @for (tab of tabs; track tab.value) {
          <button class="tab-btn" [class.active]="activeTab() === tab.value" (click)="setTab(tab.value)">
            {{ tab.label }}
            @if (countByStatus(tab.value); as n) { <span class="tab-count">{{ n }}</span> }
          </button>
        }
      </div>

      @if (loading()) {
        <div class="state-center"><div class="spin-lg"></div></div>
      } @else if (filtered().length === 0) {
        <div class="state-center empty">
          <div>🤝</div>
          <p>Nenhum voluntário encontrado.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="vol-table">
            <thead>
              <tr>
                <th></th>
                <th>Voluntário</th>
                <th>Habilidades</th>
                <th>Disponibilidade</th>
                <th>Cadastro</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (v of filtered(); track v.id) {
                <tr class="main-row" [class.expanded]="expandedId() === v.id" (click)="toggleExpand(v.id)">
                  <td class="expand-cell">
                    <span class="expand-icon">{{ expandedId() === v.id ? '▾' : '▸' }}</span>
                  </td>
                  <td>
                    <div class="vol-name">{{ v.userName }}</div>
                    <div class="vol-email">{{ v.userEmail }}</div>
                    @if (v.userPhone) {
                      <div class="vol-phone">📞 {{ v.userPhone }}</div>
                    }
                  </td>
                  <td>
                    <div class="skills-wrap">
                      @for (entry of parseEntries(v.skills); track entry.skill) {
                        <span class="chip chip-teal">{{ entry.skill }}</span>
                      }
                    </div>
                  </td>
                  <td class="avail-cell">{{ parseEntries(v.skills).length }} habilidade(s)</td>
                  <td class="date-cell">{{ v.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <span class="status-badge" [class]="v.status">{{ statusLabel(v.status) }}</span>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <div class="action-btns">
                      @if (v.status !== 'APROVADO') {
                        <button class="btn-approve" (click)="approve(v)" [disabled]="busy() === v.id">
                          @if (busy() === v.id) { <span class="spin-inline"></span> } @else { ✓ }
                          Aprovar
                        </button>
                      }
                      @if (v.status !== 'REJEITADO') {
                        <button class="btn-reject" (click)="reject(v)" [disabled]="busy() === v.id">
                          @if (busy() === v.id) { <span class="spin-inline"></span> } @else { ✕ }
                          Rejeitar
                        </button>
                      }
                    </div>
                  </td>
                </tr>

                @if (expandedId() === v.id) {
                  <tr class="detail-row">
                    <td colspan="7">
                      <div class="detail-panel">
                        <div class="detail-section">
                          <div class="detail-title">📞 Contato</div>
                          <div class="detail-grid">
                            <div class="detail-item">
                              <div class="detail-label">E-mail</div>
                              <a [href]="'mailto:' + v.userEmail" class="detail-link">{{ v.userEmail }}</a>
                            </div>
                            <div class="detail-item">
                              <div class="detail-label">Telefone</div>
                              @if (v.userPhone) {
                                <a [href]="'tel:' + v.userPhone" class="detail-link">{{ v.userPhone }}</a>
                              } @else {
                                <span class="detail-val muted">Não informado</span>
                              }
                            </div>
                          </div>
                        </div>

                        @if (v.motivation) {
                          <div class="detail-section">
                            <div class="detail-title">💬 Motivação</div>
                            <p class="detail-text">{{ v.motivation }}</p>
                          </div>
                        }

                        <div class="detail-section">
                          <div class="detail-title">🛠 Habilidades e disponibilidade</div>
                          <div class="entry-list">
                            @for (entry of parseEntries(v.skills); track entry.skill) {
                              <div class="entry-row">
                                <span class="chip chip-teal">{{ entry.skill }}</span>
                                <div class="days-wrap">
                                  @if (entry.availability.length) {
                                    @for (day of entry.availability; track day) {
                                      <span class="day-chip">{{ day }}</span>
                                    }
                                  } @else {
                                    <span class="no-days">—</span>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { font-family: 'Lora', serif; font-size: 1.6rem; color: var(--forest); margin-bottom: .25rem; }
    .page-sub   { font-size: 14px; color: var(--muted); margin-bottom: 1.5rem; }

    .filter-tabs { display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .tab-btn {
      padding: .38rem 1rem; border-radius: 99px; font-size: 13px; font-weight: 600;
      cursor: pointer; border: 1.5px solid var(--border); background: white;
      color: var(--forest); font-family: 'Nunito', sans-serif;
      display: flex; align-items: center; gap: 6px; transition: all .2s;
    }
    .tab-btn:hover  { background: var(--teal-light); border-color: var(--teal); }
    .tab-btn.active { background: var(--teal); border-color: var(--teal); color: white; }
    .tab-count { background: rgba(0,0,0,0.15); border-radius: 99px; padding: 1px 7px; font-size: 11px; }

    .state-center { text-align: center; padding: 3rem; font-size: 14px; color: var(--muted); }
    .state-center div { font-size: 2.5rem; margin-bottom: .75rem; }

    .table-wrap { overflow-x: auto; }
    .vol-table { width: 100%; border-collapse: collapse; background: white; border-radius: var(--r); overflow: hidden; border: 1.5px solid var(--border); }
    .vol-table th { background: var(--cream); padding: .75rem 1rem; font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; text-align: left; }
    .vol-table td { padding: .85rem 1rem; border-top: 1px solid var(--border); vertical-align: middle; font-size: 13.5px; }

    .main-row { cursor: pointer; transition: background .15s; }
    .main-row:hover   { background: var(--cream); }
    .main-row.expanded { background: var(--teal-light); }

    .expand-cell { width: 32px; padding-right: 0; }
    .expand-icon { font-size: 11px; color: var(--muted); }

    .vol-name  { font-weight: 700; color: var(--forest); }
    .vol-email { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .vol-phone { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
    .avail-cell { max-width: 160px; color: var(--muted); font-size: 13px; }
    .date-cell  { white-space: nowrap; color: var(--muted); }

    .status-badge { padding: 3px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-badge.PENDENTE  { background: #fef3c7; color: #92400e; }
    .status-badge.APROVADO  { background: var(--teal-light); color: var(--teal-dark); }
    .status-badge.REJEITADO { background: #fee2e2; color: #991b1b; }

    .action-btns { display: flex; gap: 6px; }
    .btn-approve, .btn-reject {
      padding: 4px 12px; border-radius: var(--r-sm); font-size: 12px; font-weight: 700;
      cursor: pointer; border: none; font-family: 'Nunito', sans-serif;
      display: flex; align-items: center; gap: 4px; transition: all .2s;
    }
    .btn-approve { background: var(--teal-light); color: var(--teal-dark); }
    .btn-approve:hover { background: var(--teal); color: white; }
    .btn-reject  { background: #fee2e2; color: #991b1b; }
    .btn-reject:hover  { background: #fca5a5; }
    .btn-approve:disabled, .btn-reject:disabled { opacity: .5; cursor: not-allowed; }

    /* PAINEL DE DETALHES */
    .detail-row td { padding: 0; border-top: none; }
    .detail-panel {
      background: #f8faf9; border-top: 1px solid var(--border);
      padding: 1.25rem 1.5rem; display: flex; flex-wrap: wrap; gap: 1.5rem;
    }
    .detail-section { flex: 1 1 220px; }
    .detail-title { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: .6rem; }
    .detail-grid  { display: flex; gap: 2rem; flex-wrap: wrap; }
    .detail-item  { }
    .detail-label { font-size: 11px; color: var(--muted); margin-bottom: 3px; }
    .detail-link  { font-size: 13.5px; font-weight: 600; color: var(--teal-dark); text-decoration: none; }
    .detail-link:hover { text-decoration: underline; }
    .detail-val   { font-size: 13.5px; font-weight: 600; color: var(--forest); }
    .detail-val.muted { color: var(--muted); font-weight: 400; }
    .detail-text  { font-size: 13.5px; color: var(--text); line-height: 1.7; margin: 0; }
    .entry-list { display: flex; flex-direction: column; gap: 6px; }
    .entry-row  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .days-wrap  { display: flex; flex-wrap: wrap; gap: 3px; }
    .day-chip   { padding: 2px 7px; border-radius: 99px; font-size: 11px; font-weight: 700; background: var(--teal-light); color: var(--teal-dark); }
    .no-days    { font-size: 13px; color: var(--muted); }

    .spin-lg { width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminVolunteersComponent implements OnInit {
  private volunteerSvc = inject(VolunteerService);
  private toast        = inject(ToastService);

  all        = signal<Volunteer[]>([]);
  filtered   = signal<Volunteer[]>([]);
  loading    = signal(true);
  busy       = signal<number | null>(null);
  activeTab  = signal('todos');
  expandedId = signal<number | null>(null);

  readonly tabs = [
    { value: 'todos',     label: 'Todos' },
    { value: 'PENDENTE',  label: 'Pendentes' },
    { value: 'APROVADO',  label: 'Aprovados' },
    { value: 'REJEITADO', label: 'Rejeitados' },
  ];

  ngOnInit(): void {
    this.volunteerSvc.listAll().subscribe({
      next: (list: any) => {
        const normalized = list.map((v: any) => ({ ...v, status: v.status?.toUpperCase() }));
        this.all.set(normalized); this.applyFilter(); this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(val: string): void { this.activeTab.set(val); this.applyFilter(); this.expandedId.set(null); }

  toggleExpand(id: number): void {
    this.expandedId.update(cur => cur === id ? null : id);
  }

  private applyFilter(): void {
    const tab = this.activeTab();
    this.filtered.set(tab === 'todos' ? this.all() : this.all().filter((v: any) => v.status === tab));
  }

  countByStatus(status: string): number {
    if (status === 'todos') return this.all().length;
    return this.all().filter((v: any) => v.status === status).length;
  }

  statusLabel(status: string): string {
    return { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado' }[status] ?? status;
  }

  parseEntries(raw: string): SkillEntry[] {
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p.map((e: any) => ({
        skill: e.skill,
        availability: Array.isArray(e.availability) ? e.availability
          : (e.availability ? String(e.availability).split(',').filter(Boolean) : [])
      }));
    } catch {}
    return raw.split(',').map(s => ({ skill: s.trim(), availability: [] })).filter(e => e.skill);
  }

  approve(v: Volunteer): void {
    this.busy.set(v.id);
    this.volunteerSvc.approve(v.id).subscribe({
      next: (updated: any) => { this.updateLocal(updated); this.busy.set(null); this.toast.success(`${v.userName} aprovado!`); },
      error: (err: any) => { this.toast.handleError(err); this.busy.set(null); }
    });
  }

  reject(v: Volunteer): void {
    this.busy.set(v.id);
    this.volunteerSvc.reject(v.id).subscribe({
      next: (updated: any) => { this.updateLocal(updated); this.busy.set(null); this.toast.success(`${v.userName} rejeitado.`); },
      error: (err: any) => { this.toast.handleError(err); this.busy.set(null); }
    });
  }

  private updateLocal(updated: Volunteer): void {
    const norm = { ...updated, status: updated.status?.toUpperCase() };
    this.all.update(list => list.map(v => v.id === norm.id ? norm : v));
    this.applyFilter();
  }
}
