import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GodparentService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Godparent } from '../../../../shared/models';

@Component({
  selector: 'app-admin-godparents',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, DatePipe, CurrencyPipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Apadrinhamentos</h2>
      <select class="form-input filter-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
        <option value="">Todos os status</option>
        <option value="PENDENTE">Pendentes</option>
        <option value="APROVADO">Aprovados</option>
      </select>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">⭐</div>
        <h3>Nenhum apadrinhamento</h3>
        <p>{{ filterStatus ? 'Nenhum registro com este status.' : 'Nenhum apadrinhamento registrado.' }}</p>
      </div>
    } @else {
      <div class="cards-list">
        @for (g of items(); track g.id) {
          <div class="gp-row">

            <div class="animal-col">
              <div class="col-label">Animal</div>
              <strong>{{ g.animalName }}</strong>
              <div class="sub-text">{{ g.animalSpecies | titlecase }}</div>
            </div>

            <div class="user-col">
              <div class="col-label">Padrinho</div>
              <strong>{{ g.userName ?? '—' }}</strong>
              <div class="sub-text">{{ g.userEmail ?? '' }}</div>
            </div>

            <div class="amount-col">
              <div class="col-label">Valor/mês</div>
              @if (g.amount != null && g.amount > 0) {
                <strong>{{ g.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
              } @else {
                <span class="sub-text">Não informado</span>
              }
            </div>

            <div class="status-col">
              <div class="col-label">Status</div>
              <span class="status-pill" [ngClass]="'pill-' + g.status.toLowerCase()">
                {{ g.status | titlecase }}
              </span>
            </div>

            <div class="date-col">
              <div class="col-label">Data</div>
              <span class="date-text">{{ g.startedAt | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="actions-col">
              @if (g.status.toLowerCase() === 'pendente') {
                <button class="btn btn-teal btn-sm" (click)="approve(g)"
                  [disabled]="approving() === g.id">
                  @if (approving() === g.id) { <span class="spin-inline"></span> }
                  ✔ Aprovar
                </button>
              } @else {
                <span class="approved-tag">✅ Aprovado</span>
              }
              <button class="btn btn-danger btn-sm" (click)="openDelete(g)"
                [disabled]="deleting() === g.id" style="margin-top: 4px;">
                @if (deleting() === g.id) { <span class="spin-inline"></span> } @else { 🗑 }
                Remover
              </button>
            </div>

          </div>
        }
      </div>
    }

    <!-- MODAL: confirmar remoção -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="closeDelete()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Remover apadrinhamento?</h3>
            <button class="modal-close" (click)="closeDelete()">✕</button>
          </div>
          <p class="modal-desc">
            Tem certeza que deseja remover o apadrinhamento de
            <strong>{{ deleteTarget()!.userName ?? deleteTarget()!.userEmail }}</strong>
            pelo animal <strong>{{ deleteTarget()!.animalName }}</strong>?
          </p>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeDelete()">Cancelar</button>
            <button class="btn btn-danger-solid" (click)="confirmDelete()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Confirmar remoção
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .filter-select { max-width: 200px; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .cards-list { display: flex; flex-direction: column; gap: .75rem; }
    .gp-row {
      background: white; border-radius: var(--r); border: 1.5px solid var(--border);
      padding: 1rem 1.25rem; display: grid;
      grid-template-columns: 1.5fr 1.8fr 1fr 1fr 1fr auto;
      align-items: center; gap: 1rem;
    }
    .col-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }
    .sub-text { font-size: 12px; color: var(--muted); }
    .date-text { font-size: 13px; color: var(--text); }
    .amount-col strong { font-family: 'Lora', serif; color: var(--teal-dark); }

    .pill-pendente { background: #fef3c7; color: #b45309; }
    .pill-aprovado  { background: #d1fae5; color: #065f46; }

    .approved-tag { font-size: 13px; color: #065f46; font-weight: 700; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    .btn-danger { background: #fee2e2; color: #dc2626; border: none; border-radius: var(--r-sm); padding: .35rem .75rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; &:hover { background: #fca5a5; } &:disabled { opacity: .5; cursor: not-allowed; } }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; h3 { font-family: 'Lora', serif; font-size: 1.2rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-outline { background: none; border: 1.5px solid var(--border); color: var(--text); border-radius: var(--r-sm); padding: .6rem 1.25rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; &:hover { background: var(--cream); } }
    .btn-danger-solid { background: #dc2626; color: white; border: none; border-radius: var(--r-sm); padding: .6rem 1.25rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: #b91c1c; } &:disabled { opacity: .6; cursor: not-allowed; } }

    @media (max-width: 900px) {
      .gp-row { grid-template-columns: 1fr 1fr; }
      .date-col { display: none; }
    }
  `]
})
export class AdminGodparentsComponent implements OnInit {
  private svc   = inject(GodparentService);
  private toast = inject(ToastService);

  items        = signal<Godparent[]>([]);
  loading      = signal(true);
  approving    = signal<number | null>(null);
  deleting     = signal<number | null>(null);
  deleteTarget = signal<Godparent | null>(null);
  saving       = signal(false);
  filterStatus = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listAll(this.filterStatus || undefined).subscribe({
      next: (g: any) => { this.items.set(Array.isArray(g) ? g : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  approve(g: Godparent): void {
    this.approving.set(g.id);
    this.svc.approve(g.id).subscribe({
      next: () => {
        this.toast.success(`${g.animalName} — apadrinhamento aprovado!`);
        this.approving.set(null);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.approving.set(null); }
    });
  }

  openDelete(g: Godparent): void { this.deleteTarget.set(g); }
  closeDelete(): void { this.deleteTarget.set(null); }

  confirmDelete(): void {
    const g = this.deleteTarget();
    if (!g) return;
    this.saving.set(true);
    this.deleting.set(g.id);
    this.svc.adminDelete(g.id).subscribe({
      next: () => {
        this.toast.success(`Apadrinhamento de ${g.animalName} removido.`);
        this.closeDelete();
        this.saving.set(false);
        this.deleting.set(null);
        this.load();
      },
      error: (err: any) => {
        this.toast.handleError(err);
        this.saving.set(false);
        this.deleting.set(null);
      }
    });
  }
}
