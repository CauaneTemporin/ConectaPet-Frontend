import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Denuncia, DenunciaStatus } from '../../../../shared/models';

const CAT_LABELS: Record<string, string> = {
  MAUS_TRATOS: 'Maus-tratos', ABANDONO: 'Abandono',
  COMERCIO_ILEGAL: 'Comércio Ilegal', FALTA_DE_SANEAMENTO: 'Falta de Saneamento', OUTROS: 'Outros'
};
const CAT_ICONS: Record<string, string> = {
  MAUS_TRATOS: '⚠️', ABANDONO: '😢', COMERCIO_ILEGAL: '🚫', FALTA_DE_SANEAMENTO: '🧹', OUTROS: '📋'
};

@Component({
  selector: 'app-admin-denuncias',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Denúncias</h2>
      <div class="header-controls">
        <span class="badge-pending">{{ pendingCount() }} pendentes</span>
        <select class="form-input filter-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
          <option value="">Todas</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="EM_ANALISE">Em análise</option>
          <option value="RESOLVIDA">Resolvidas</option>
          <option value="ARQUIVADA">Arquivadas</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">🚨</div>
        <h3>Nenhuma denúncia</h3>
        <p>{{ filterStatus ? 'Nenhuma denúncia com este status.' : 'Nenhuma denúncia registrada ainda.' }}</p>
      </div>
    } @else {
      <div class="den-list">
        @for (den of items(); track den.id) {
          <div class="den-card" [class.unread]="den.status === 'PENDENTE'">
            <div class="den-top">
              <div class="den-cat">
                <span class="cat-icon">{{ catIcon(den.categoria) }}</span>
                <div>
                  <strong>{{ den.titulo }}</strong>
                  <span class="cat-label">{{ catLabel(den.categoria) }}</span>
                </div>
              </div>
              <div class="den-meta">
                <span class="status-pill" [ngClass]="'pill-den-' + den.status">{{ statusLabel(den.status) }}</span>
                <span class="date-text">{{ den.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <p class="den-desc">{{ den.descricao }}</p>

            <div class="den-details">
              @if (den.endereco) {
                <div class="detail-item"><span class="detail-icon">📍</span> {{ den.endereco }}</div>
              }
              <div class="detail-item"><span class="detail-icon">👤</span> {{ den.userName }}</div>
            </div>

            @if (den.observacaoGestor) {
              <div class="gestor-note">
                <strong>Observação:</strong> {{ den.observacaoGestor }}
                @if (den.analisadoPorNome) {
                  <span class="muted"> — por {{ den.analisadoPorNome }}</span>
                }
              </div>
            }

            <div class="den-actions">
              @if (den.status !== 'RESOLVIDA' && den.status !== 'ARQUIVADA') {
                <button class="btn btn-sm btn-teal" (click)="openUpdate(den)">Atualizar status</button>
              }
            </div>
          </div>
        }
      </div>
    }

    @if (updateTarget()) {
      <div class="modal-backdrop" (click)="closeUpdate()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Atualizar denúncia #{{ updateTarget()!.id }}</h3>
            <button class="modal-close" (click)="closeUpdate()">✕</button>
          </div>
          <div class="form-field">
            <label class="form-label">Novo status</label>
            <select class="form-input" [(ngModel)]="updateStatus">
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANALISE">Em análise</option>
              <option value="RESOLVIDA">Resolvida</option>
              <option value="ARQUIVADA">Arquivada</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Observação (opcional)</label>
            <textarea class="form-input" [(ngModel)]="updateNotes" rows="3"
              placeholder="Registro interno sobre a análise..."></textarea>
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

    .empty-state { text-align: center; padding: 4rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; } p { color: var(--muted); font-size: 14px; } }

    .den-list { display: flex; flex-direction: column; gap: 1rem; }
    .den-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; }
    .den-card.unread { border-color: #f59e0b; background: #fffbeb; }

    .den-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .75rem; flex-wrap: wrap; gap: .5rem; }
    .den-cat { display: flex; align-items: flex-start; gap: 10px; }
    .cat-icon { font-size: 1.3rem; margin-top: 2px; }
    .den-cat strong { font-size: .95rem; color: var(--forest); display: block; }
    .cat-label { font-size: 12px; color: var(--muted); }
    .den-meta { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
    .date-text { font-size: 12px; color: var(--muted); }

    .den-desc { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: .75rem; white-space: pre-wrap; }

    .den-details { display: flex; flex-direction: column; gap: 4px; margin-bottom: .75rem; }
    .detail-item { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 6px; }
    .detail-icon { font-size: .95rem; }

    .gestor-note { background: var(--cream); border-left: 3px solid var(--teal); padding: .6rem .9rem; border-radius: 0 var(--r-sm) var(--r-sm) 0; font-size: 13px; color: var(--text); margin-bottom: .75rem; .muted { color: var(--muted); } }

    .den-actions { display: flex; gap: .5rem; flex-wrap: wrap; }

    .pill-den-PENDENTE   { background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-den-EM_ANALISE { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-den-RESOLVIDA  { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-den-ARQUIVADA  { background: #f3f4f6; color: #6b7280; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; h3 { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--forest); margin-bottom: 6px; }
    .form-input { width: 100%; padding: .6rem .85rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: 'Nunito', sans-serif; font-size: 14px; background: white; box-sizing: border-box; }
  `]
})
export class AdminDenunciasComponent implements OnInit {
  private svc   = inject(DenunciaService);
  private toast = inject(ToastService);

  items        = signal<Denuncia[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  filterStatus = '';
  updateTarget = signal<Denuncia | null>(null);
  updateStatus: DenunciaStatus = 'EM_ANALISE';
  updateNotes  = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listAll(this.filterStatus || undefined).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  pendingCount(): number { return this.items().filter(i => i.status === 'PENDENTE').length; }

  openUpdate(den: Denuncia): void {
    this.updateStatus = den.status;
    this.updateNotes  = den.observacaoGestor ?? '';
    this.updateTarget.set(den);
  }

  closeUpdate(): void { this.updateTarget.set(null); this.updateNotes = ''; }

  confirmUpdate(): void {
    const den = this.updateTarget();
    if (!den) return;
    this.saving.set(true);
    this.svc.atualizarStatus(den.id, {
      status: this.updateStatus,
      observacaoGestor: this.updateNotes.trim() || undefined
    }).subscribe({
      next: () => {
        this.toast.success('Status atualizado com sucesso.');
        this.closeUpdate();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  catLabel(c: string): string { return CAT_LABELS[c] ?? c; }
  catIcon(c: string):  string { return CAT_ICONS[c] ?? '📋'; }
  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', RESOLVIDA: 'Resolvida', ARQUIVADA: 'Arquivada'
    };
    return map[s] ?? s;
  }
}
