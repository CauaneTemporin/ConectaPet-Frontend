import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminOngService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Ong, OngStatus } from '../../../../shared/models';

@Component({
  selector: 'app-admin-ongs',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Gerenciar ONGs</h2>
      <div class="header-controls">
        <span class="badge-pending">{{ pendingCount() }} pendentes</span>
        <select class="form-input filter-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
          <option value="">Todas</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="ATIVA">Ativas</option>
          <option value="INATIVA">Inativas</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <div class="icon">🏢</div>
        <h3>Nenhuma ONG encontrada</h3>
        <p>{{ filterStatus ? 'Nenhuma ONG com este status.' : 'Nenhuma ONG cadastrada ainda.' }}</p>
      </div>
    } @else {
      <div class="ong-table-wrap">
        <table class="ong-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ONG</th>
              <th>CNPJ</th>
              <th>Cidade</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (ong of filtered(); track ong.id) {
              <tr>
                <td class="col-id">{{ ong.id }}</td>
                <td class="col-ong">
                  <strong>{{ ong.nomeFantasia }}</strong>
                  <span class="razao">{{ ong.razaoSocial }}</span>
                </td>
                <td class="col-cnpj">{{ ong.cnpj }}</td>
                <td class="col-city">{{ ong.cidade }}/{{ ong.estado }}</td>
                <td class="col-status">
                  <span class="status-pill" [ngClass]="'pill-ong-' + ong.status">
                    {{ statusLabel(ong.status) }}
                  </span>
                </td>
                <td class="col-date">{{ ong.createdAt | date:'dd/MM/yy' }}</td>
                <td class="col-actions">
                  @if (ong.status === 'PENDENTE') {
                    <button class="btn btn-sm btn-teal"   (click)="confirmAction(ong, 'aprovar')">Aprovar</button>
                    <button class="btn btn-sm btn-danger" (click)="confirmAction(ong, 'rejeitar')">Rejeitar</button>
                  }
                  @if (ong.status === 'ATIVA') {
                    <button class="btn btn-sm btn-outline-teal" (click)="confirmAction(ong, 'inativar')">Inativar</button>
                  }
                  @if (ong.status === 'INATIVA') {
                    <button class="btn btn-sm btn-teal" (click)="confirmAction(ong, 'aprovar')">Reativar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Confirm modal -->
    @if (actionTarget()) {
      <div class="modal-backdrop" (click)="cancelAction()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar ação</h3>
            <button class="modal-close" (click)="cancelAction()">✕</button>
          </div>
          <p class="confirm-text">
            Deseja <strong>{{ actionLabel() }}</strong> a ONG
            <strong>{{ actionTarget()!.nomeFantasia }}</strong>?
          </p>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="cancelAction()">Cancelar</button>
            <button class="btn btn-teal" (click)="executeAction()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> }
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .header-controls { display: flex; align-items: center; gap: .75rem; }
    .badge-pending { background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; }
    .filter-select { max-width: 160px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; } p { color: var(--muted); font-size: 14px; } }

    .ong-table-wrap { overflow-x: auto; background: white; border-radius: var(--r); border: 1.5px solid var(--border); }
    .ong-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .ong-table thead tr { border-bottom: 1.5px solid var(--border); background: var(--cream); }
    .ong-table th { padding: .75rem 1rem; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    .ong-table td { padding: .85rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .ong-table tbody tr:last-child td { border-bottom: none; }
    .ong-table tbody tr:hover { background: var(--cream); }

    .col-id   { color: var(--muted); font-size: 12px; width: 40px; }
    .col-ong  { min-width: 180px; strong { display: block; color: var(--forest); font-weight: 700; } }
    .razao    { display: block; font-size: 11px; color: var(--muted); margin-top: 2px; }
    .col-cnpj { font-family: monospace; font-size: 12.5px; color: var(--text); }
    .col-city { color: var(--muted); font-size: 13px; }
    .col-date { color: var(--muted); font-size: 12px; white-space: nowrap; }
    .col-actions { display: flex; gap: 6px; flex-wrap: wrap; }

    .status-pill { padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .pill-ong-PENDENTE { background: #fef3c7; color: #92400e; }
    .pill-ong-ATIVA    { background: #d1fae5; color: #065f46; }
    .pill-ong-INATIVA  { background: #f3f4f6; color: #6b7280; }

    .btn-sm     { padding: .3rem .75rem; font-size: 12px; }
    .btn-danger { background: #fef2f2; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 99px; font-family: 'Nunito', sans-serif; font-weight: 700; cursor: pointer; transition: all .2s; &:hover { background: #dc2626; color: white; } }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; h3 { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem; }
    .confirm-text { font-size: 14px; color: var(--text); line-height: 1.6; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    .form-input { padding: .5rem .75rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: 'Nunito', sans-serif; font-size: 13px; background: white; }
  `]
})
export class AdminOngsComponent implements OnInit {
  private svc   = inject(SuperAdminOngService);
  private toast = inject(ToastService);

  items        = signal<Ong[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  filterStatus = '';
  actionTarget = signal<Ong | null>(null);
  pendingAction: 'aprovar' | 'rejeitar' | 'inativar' = 'aprovar';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listarTodas().subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filtered(): Ong[] {
    if (!this.filterStatus) return this.items();
    return this.items().filter(o => o.status === this.filterStatus);
  }

  pendingCount(): number { return this.items().filter(o => o.status === 'PENDENTE').length; }

  confirmAction(ong: Ong, action: typeof this.pendingAction): void {
    this.pendingAction = action;
    this.actionTarget.set(ong);
  }

  cancelAction(): void { this.actionTarget.set(null); }

  actionLabel(): string {
    const map = { aprovar: 'aprovar', rejeitar: 'rejeitar', inativar: 'inativar' };
    return map[this.pendingAction];
  }

  executeAction(): void {
    const ong = this.actionTarget();
    if (!ong) return;
    this.saving.set(true);
    const req$ = this.pendingAction === 'aprovar'   ? this.svc.aprovar(ong.id)
               : this.pendingAction === 'rejeitar'  ? this.svc.rejeitar(ong.id)
               :                                      this.svc.inativar(ong.id);
    req$.subscribe({
      next: () => {
        const labels = { aprovar: 'aprovada', rejeitar: 'rejeitada', inativar: 'inativada' };
        this.toast.success(`ONG ${labels[this.pendingAction]} com sucesso.`);
        this.cancelAction();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  statusLabel(s: OngStatus): string {
    const map: Record<OngStatus, string> = { PENDENTE: 'Pendente', ATIVA: 'Ativa', INATIVA: 'Inativa' };
    return map[s] ?? s;
  }
}
