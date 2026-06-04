import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OccurrenceService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Occurrence, OccurrenceStatus } from '../../../../shared/models';

const TYPE_LABELS: Record<string, string> = {
  abandono: 'Abandono', maus_tratos: 'Maus-tratos', suspeita: 'Suspeita', outro: 'Outro'
};
const TYPE_ICONS: Record<string, string> = {
  abandono: '😢', maus_tratos: '⚠️', suspeita: '🔍', outro: '📋'
};

@Component({
  selector: 'app-admin-occurrences',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TitleCasePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Ocorrências</h2>
      <div class="header-controls">
        <span class="badge-pending">{{ pendingCount() }} pendentes</span>
        <select class="form-input filter-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
          <option value="">Todos</option>
          <option value="pendente">Pendentes</option>
          <option value="em_analise">Em análise</option>
          <option value="resolvido">Resolvidos</option>
          <option value="arquivado">Arquivados</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">🚨</div>
        <h3>Nenhuma ocorrência</h3>
        <p>{{ filterStatus ? 'Nenhuma ocorrência com este status.' : 'Nenhuma ocorrência registrada ainda.' }}</p>
      </div>
    } @else {
      <div class="occ-list">
        @for (occ of items(); track occ.id) {
          <div class="occ-card" [class.unread]="occ.status === 'pendente'">
            <div class="occ-top">
              <div class="occ-type">
                <span class="type-icon">{{ typeIcon(occ.type) }}</span>
                <strong>{{ typeLabel(occ.type) }}</strong>
              </div>
              <div class="occ-meta">
                <span class="status-pill" [ngClass]="'pill-occ-' + occ.status">{{ statusLabel(occ.status) }}</span>
                <span class="date-text">{{ occ.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <p class="occ-desc">{{ occ.description }}</p>

            <div class="occ-details">
              @if (occ.cidade || occ.estado || occ.endereco) {
                <div class="detail-item">
                  <span class="detail-icon">📍</span>
                  @if (occ.cidade) { {{ occ.cidade }}@if (occ.estado) {/{{ occ.estado }}} }
                  @if (occ.endereco) { — {{ occ.endereco }} }
                </div>
              }
              @if (occ.animalDescription) {
                <div class="detail-item"><span class="detail-icon">🐾</span> {{ occ.animalDescription }}</div>
              }
              @if (occ.anonymous) {
                <div class="detail-item muted"><span class="detail-icon">🕵️</span> Denúncia anônima</div>
              } @else if (occ.reporterName) {
                <div class="detail-item"><span class="detail-icon">👤</span> {{ occ.reporterName }}
                  @if (occ.reporterEmail) { · {{ occ.reporterEmail }} }
                </div>
              }
            </div>

            @if (occ.adminNotes) {
              <div class="admin-note"><strong>Observação do gestor:</strong> {{ occ.adminNotes }}</div>
            }
            @if (occ.analisadoPorNome) {
              <div class="analyst-info">
                Analisado por <strong>{{ occ.analisadoPorNome }}</strong>
                @if (occ.analisadoEm) { em {{ occ.analisadoEm | date:'dd/MM/yyyy HH:mm' }} }
              </div>
            }

            <div class="occ-actions">
              @if (occ.status !== 'resolvido' && occ.status !== 'arquivado') {
                <button class="btn btn-sm btn-teal" (click)="openUpdate(occ)">Atualizar status</button>
              }
              <button class="btn btn-sm btn-outline-teal" (click)="confirmDelete(occ)">Excluir</button>
            </div>
          </div>
        }
      </div>
    }

    <!-- MODAL: atualizar status -->
    @if (updateTarget()) {
      <div class="modal-backdrop" (click)="closeUpdate()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Atualizar ocorrência #{{ updateTarget()!.id }}</h3>
            <button class="modal-close" (click)="closeUpdate()">✕</button>
          </div>
          <div class="form-field">
            <label class="form-label">Novo status</label>
            <select class="form-input" [(ngModel)]="updateStatus">
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em análise</option>
              <option value="resolvido">Resolvido</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Observação do gestor (opcional)</label>
            <textarea class="form-input" [(ngModel)]="updateNotes" rows="3"
              placeholder="Descreva as ações tomadas ou conclusões..."></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeUpdate()">Cancelar</button>
            <button class="btn btn-teal" (click)="confirmUpdate()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Salvar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: confirmar exclusão -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="deleteTarget.set(null)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Excluir ocorrência #{{ deleteTarget()!.id }}?</h3>
            <button class="modal-close" (click)="deleteTarget.set(null)">✕</button>
          </div>
          <p class="modal-desc">Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="deleteTarget.set(null)">Cancelar</button>
            <button class="btn btn-danger-solid" (click)="doDelete()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Excluir
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
    .filter-select { max-width: 180px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .occ-list { display: flex; flex-direction: column; gap: 1rem; }
    .occ-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; }
    .occ-card.unread { border-color: #f59e0b; background: #fffbeb; }

    .occ-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem; flex-wrap: wrap; gap: .5rem; }
    .occ-type { display: flex; align-items: center; gap: 8px; }
    .type-icon { font-size: 1.2rem; }
    .occ-type strong { font-size: .95rem; color: var(--forest); }
    .occ-meta { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
    .date-text { font-size: 12px; color: var(--muted); }

    .occ-desc { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: .75rem; white-space: pre-wrap; }

    .occ-details { display: flex; flex-direction: column; gap: 4px; margin-bottom: .75rem; }
    .detail-item { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 6px; }
    .detail-item.muted { color: var(--muted); }
    .detail-icon { font-size: .95rem; }

    .admin-note { background: var(--cream); border-left: 3px solid var(--teal); padding: .6rem .9rem; border-radius: 0 var(--r-sm) var(--r-sm) 0; font-size: 13px; color: var(--text); margin-bottom: .5rem; }
    .analyst-info { font-size: 12px; color: var(--muted); margin-bottom: .75rem; }

    .occ-actions { display: flex; gap: .5rem; flex-wrap: wrap; }

    .pill-occ-pendente   { background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-occ-em_analise { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-occ-resolvido  { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-occ-arquivado  { background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; h3 { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-danger-solid { background: #dc2626; color: white; border: none; border-radius: var(--r-sm); padding: .6rem 1.25rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: #b91c1c; } &:disabled { opacity: .6; cursor: not-allowed; } }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
  `]
})
export class AdminOccurrencesComponent implements OnInit {
  private svc   = inject(OccurrenceService);
  private toast = inject(ToastService);

  items        = signal<Occurrence[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  filterStatus = '';
  updateTarget = signal<Occurrence | null>(null);
  deleteTarget = signal<Occurrence | null>(null);
  updateStatus: OccurrenceStatus = 'em_analise';
  updateNotes  = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listAll(this.filterStatus || undefined).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  pendingCount(): number { return this.items().filter(i => i.status === 'pendente').length; }

  openUpdate(occ: Occurrence): void {
    this.updateStatus = occ.status;
    this.updateNotes  = occ.adminNotes ?? '';
    this.updateTarget.set(occ);
  }
  closeUpdate(): void { this.updateTarget.set(null); this.updateNotes = ''; }

  confirmUpdate(): void {
    const occ = this.updateTarget();
    if (!occ) return;
    this.saving.set(true);
    this.svc.updateStatus(occ.id, this.updateStatus, this.updateNotes.trim() || undefined).subscribe({
      next: () => {
        this.toast.success('Status atualizado com sucesso.');
        this.closeUpdate();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  confirmDelete(occ: Occurrence): void { this.deleteTarget.set(occ); }

  doDelete(): void {
    const occ = this.deleteTarget();
    if (!occ) return;
    this.saving.set(true);
    this.svc.delete(occ.id).subscribe({
      next: () => {
        this.toast.success('Ocorrência excluída.');
        this.deleteTarget.set(null);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  typeLabel(t: string): string { return TYPE_LABELS[t] ?? t; }
  typeIcon(t: string):  string { return TYPE_ICONS[t] ?? '📋'; }
  statusLabel(s: string): string {
    const map: Record<string, string> = { pendente: 'Pendente', em_analise: 'Em análise', resolvido: 'Resolvido', arquivado: 'Arquivado' };
    return map[s] ?? s;
  }
}
