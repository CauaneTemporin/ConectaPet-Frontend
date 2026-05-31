import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { Denuncia, DenunciaCategoria, DenunciaRequest } from '../../../shared/models';

const CAT_LABELS: Record<string, string> = {
  MAUS_TRATOS: 'Maus-tratos', ABANDONO: 'Abandono',
  COMERCIO_ILEGAL: 'Comércio Ilegal', FALTA_DE_SANEAMENTO: 'Falta de Saneamento', OUTROS: 'Outros'
};

@Component({
  selector: 'app-my-denuncias',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Minhas Denúncias</h2>
      <button class="btn btn-teal" (click)="showForm = !showForm">
        {{ showForm ? '✕ Cancelar' : '+ Nova Denúncia' }}
      </button>
    </div>

    @if (showForm) {
      <div class="form-card">
        <h3 class="form-title">Registrar Nova Denúncia</h3>
        <div class="form-grid">
          <div class="form-field full">
            <label class="form-label">Título *</label>
            <input class="form-input" [(ngModel)]="form.titulo" placeholder="Resumo da denúncia" />
          </div>
          <div class="form-field">
            <label class="form-label">Categoria *</label>
            <select class="form-input" [(ngModel)]="form.categoria">
              <option value="">Selecione...</option>
              <option value="MAUS_TRATOS">Maus-tratos</option>
              <option value="ABANDONO">Abandono</option>
              <option value="COMERCIO_ILEGAL">Comércio Ilegal</option>
              <option value="FALTA_DE_SANEAMENTO">Falta de Saneamento</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Endereço / Local</label>
            <input class="form-input" [(ngModel)]="form.endereco" placeholder="Rua, bairro, cidade..." />
          </div>
          <div class="form-field full">
            <label class="form-label">Descrição detalhada *</label>
            <textarea class="form-input" [(ngModel)]="form.descricao" rows="4"
              placeholder="Descreva o que foi observado, quando, e qualquer outra informação relevante..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline-teal" (click)="showForm = false">Cancelar</button>
          <button class="btn btn-teal" (click)="submit()" [disabled]="saving()">
            @if (saving()) { <span class="spin-inline"></span> } Enviar Denúncia
          </button>
        </div>
      </div>
    }

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">🚨</div>
        <h3>Nenhuma denúncia registrada</h3>
        <p>Clique em "Nova Denúncia" para registrar uma ocorrência.</p>
      </div>
    } @else {
      <div class="den-list">
        @for (den of items(); track den.id) {
          <div class="den-card">
            <div class="den-top">
              <div>
                <strong class="den-titulo">{{ den.titulo }}</strong>
                <span class="den-cat">{{ catLabel(den.categoria) }}</span>
              </div>
              <span class="status-pill" [ngClass]="'pill-den-' + den.status">{{ statusLabel(den.status) }}</span>
            </div>
            <p class="den-desc">{{ den.descricao }}</p>
            @if (den.endereco) {
              <div class="den-loc">📍 {{ den.endereco }}</div>
            }
            @if (den.observacaoGestor) {
              <div class="gestor-note">
                <strong>Resposta do gestor:</strong> {{ den.observacaoGestor }}
                @if (den.analisadoPorNome) { <span class="muted"> — {{ den.analisadoPorNome }}</span> }
              </div>
            }
            <div class="den-date">{{ den.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }

    .form-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.5rem; margin-bottom: 2rem; }
    .form-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.1rem; margin-bottom: 1.25rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; }
    .form-field.full { grid-column: 1 / -1; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--forest); margin-bottom: 5px; }
    .form-input { padding: .6rem .85rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: 'Nunito', sans-serif; font-size: 14px; background: white; resize: vertical; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.25rem; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; } p { color: var(--muted); font-size: 14px; } }

    .den-list { display: flex; flex-direction: column; gap: 1rem; }
    .den-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; }
    .den-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .75rem; gap: .5rem; }
    .den-titulo { display: block; font-size: .95rem; color: var(--forest); }
    .den-cat { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
    .den-desc { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: .5rem; white-space: pre-wrap; }
    .den-loc { font-size: 13px; color: var(--muted); margin-bottom: .5rem; }
    .den-date { font-size: 12px; color: var(--muted); text-align: right; margin-top: .5rem; }

    .gestor-note { background: #eff6ff; border-left: 3px solid #3b82f6; padding: .6rem .9rem; border-radius: 0 var(--r-sm) var(--r-sm) 0; font-size: 13px; color: var(--text); margin-bottom: .5rem; .muted { color: var(--muted); } }

    .status-pill { padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .pill-den-PENDENTE   { background: #fef3c7; color: #92400e; }
    .pill-den-EM_ANALISE { background: #dbeafe; color: #1e40af; }
    .pill-den-RESOLVIDA  { background: #d1fae5; color: #065f46; }
    .pill-den-ARQUIVADA  { background: #f3f4f6; color: #6b7280; }

    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class MyDenunciasComponent implements OnInit {
  private svc   = inject(DenunciaService);
  private toast = inject(ToastService);

  items   = signal<Denuncia[]>([]);
  loading = signal(true);
  saving  = signal(false);
  showForm = false;

  form: DenunciaRequest = { titulo: '', descricao: '', endereco: '', categoria: '' as DenunciaCategoria };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.mine().subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (!this.form.titulo.trim() || !this.form.descricao.trim() || !this.form.categoria) {
      this.toast.error('Preencha título, categoria e descrição.');
      return;
    }
    this.saving.set(true);
    const payload: DenunciaRequest = {
      titulo: this.form.titulo.trim(),
      descricao: this.form.descricao.trim(),
      categoria: this.form.categoria,
      endereco: this.form.endereco?.trim() || undefined
    };
    this.svc.criar(payload).subscribe({
      next: () => {
        this.toast.success('Denúncia registrada com sucesso!');
        this.showForm = false;
        this.form = { titulo: '', descricao: '', endereco: '', categoria: '' as DenunciaCategoria };
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  catLabel(c: string): string { return CAT_LABELS[c] ?? c; }
  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', RESOLVIDA: 'Resolvida', ARQUIVADA: 'Arquivada'
    };
    return map[s] ?? s;
  }
}
