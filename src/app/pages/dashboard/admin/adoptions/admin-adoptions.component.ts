import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdoptionService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Adoption } from '../../../../shared/models';

@Component({
  selector: 'app-admin-adoptions',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Solicitações de Adoção</h2>
      <select class="form-input filter-select" [(ngModel)]="filterStatus" (ngModelChange)="load()">
        <option value="">Todos os status</option>
        <option value="PENDENTE">Pendentes</option>
        <option value="APROVADO">Aprovados</option>
        <option value="RECUSADO">Recusados</option>
        <option value="CONCLUIDO">Concluídos</option>
      </select>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (adoptions().length === 0) {
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>Nenhuma solicitação</h3>
        <p>{{ filterStatus ? 'Nenhuma solicitação com este status.' : 'Nenhuma solicitação registrada.' }}</p>
      </div>
    } @else {
      <div class="cards-list">
        @for (a of adoptions(); track a.id) {
          <div class="adoption-card" [class.expanded]="isOpen(a.id)">

            <!-- LINHA PRINCIPAL -->
            <div class="card-row">
              <div class="animal-col">
                <div class="col-label">Animal</div>
                <strong>{{ a.animalName }}</strong>
                <div class="sub-text">{{ a.animalSpecies | titlecase }}</div>
              </div>

              <div class="user-col">
                <div class="col-label">Solicitante</div>
                <strong>{{ a.userName }}</strong>
                <div class="sub-text">{{ a.userEmail }}</div>
              </div>

              <div class="status-col">
                <div class="col-label">Status</div>
                <span class="status-pill" [ngClass]="'pill-' + a.status.toLowerCase()">
                  {{ a.status | titlecase }}
                </span>
              </div>

              <div class="date-col">
                <div class="col-label">Data</div>
                <span class="date-text">{{ a.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>

              <div class="actions-col">
                <button class="btn-details" (click)="toggle(a.id)">
                  {{ isOpen(a.id) ? '▲ Fechar' : '▼ Detalhes' }}
                </button>
                <div class="action-btns">
                  @if (a.status.toLowerCase() === 'pendente') {
                    <button class="btn btn-teal btn-sm" (click)="review(a.id, 'APROVADO')">✔ Aprovar</button>
                    <button class="btn-danger" (click)="review(a.id, 'RECUSADO')">✖ Recusar</button>
                  }
                  @if (a.status.toLowerCase() === 'aprovado') {
                    <button class="btn btn-forest btn-sm" (click)="review(a.id, 'CONCLUIDO')">✅ Concluir</button>
                  }
                </div>
              </div>
            </div>

            <!-- PAINEL DE DETALHES (expansível) -->
            @if (isOpen(a.id)) {
              <div class="detail-panel">

                <div class="detail-section">
                  <h4>📞 Contato do solicitante</h4>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">Nome</div>
                      <div class="detail-val">{{ a.userName }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">E-mail</div>
                      <div class="detail-val">
                        <a [href]="'mailto:' + a.userEmail" class="link">{{ a.userEmail }}</a>
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Telefone</div>
                      <div class="detail-val">
                        @if (a.userPhone) {
                          <a [href]="'tel:' + a.userPhone" class="link">{{ a.userPhone }}</a>
                        } @else {
                          <span class="no-info">Não informado</span>
                        }
                      </div>
                    </div>
                    @if (a.reviewedAt) {
                      <div class="detail-item">
                        <div class="detail-label">Revisado em</div>
                        <div class="detail-val">{{ a.reviewedAt | date:'dd/MM/yyyy HH:mm' }}</div>
                      </div>
                    }
                  </div>
                </div>

                <div class="detail-section">
                  <h4>📝 Mensagem do solicitante</h4>
                  @if (a.message) {
                    <p class="detail-text">{{ a.message }}</p>
                  } @else {
                    <div class="no-info">Nenhuma mensagem informada.</div>
                  }
                </div>

              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .filter-select { width: auto; font-size: 13px; padding: 0.38rem 0.75rem; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* CARDS */
    .cards-list { display: flex; flex-direction: column; gap: .75rem; }

    .adoption-card {
      background: white; border-radius: var(--r);
      border: 1.5px solid var(--border); overflow: hidden;
      transition: border-color .2s;
      &.expanded { border-color: var(--teal); }
    }

    /* LINHA PRINCIPAL */
    .card-row {
      display: grid;
      grid-template-columns: 1.4fr 1.6fr 110px 100px auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
    }

    .col-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
    .sub-text  { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .date-text { font-size: 13px; color: var(--text); }

    .actions-col { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

    .btn-details {
      background: none; border: 1.5px solid var(--border);
      color: var(--muted); font-family: 'Nunito', sans-serif;
      font-size: 12px; font-weight: 700; padding: 4px 12px;
      border-radius: 99px; cursor: pointer; white-space: nowrap;
      transition: all .2s;
      &:hover { border-color: var(--teal); color: var(--teal-dark); background: var(--teal-light); }
    }

    .action-btns { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .btn-danger  { background: #fee2e2; color: #991b1b; border-radius: var(--r-sm); border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13px; padding: 0.4rem 1rem; }

    /* PAINEL DE DETALHES */
    .detail-panel {
      border-top: 1.5px solid var(--teal-light);
      padding: 1.25rem 1.5rem;
      background: var(--teal-light);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .detail-section {
      h4 { font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 800; color: var(--forest); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 1rem; }
    }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: 1rem; }

    .detail-item { }
    .detail-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
    .detail-val   { font-size: 13.5px; font-weight: 600; color: var(--forest); }

    .link { color: var(--teal-dark); text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }

    .detail-text-block { margin-bottom: .75rem; }
    .detail-text { font-size: 13.5px; color: var(--text); line-height: 1.75; margin-top: 4px; white-space: pre-wrap; }

    .no-info { font-size: 12.5px; color: var(--muted); font-style: italic; margin-bottom: .5rem; }

    @media (max-width: 900px) {
      .card-row { grid-template-columns: 1fr 1fr; }
      .date-col { display: none; }
      .detail-panel { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .card-row { grid-template-columns: 1fr; }
      .actions-col { align-items: flex-start; }
    }
  `]
})
export class AdminAdoptionsComponent implements OnInit {
  adoptionSvc = inject(AdoptionService);
  toast       = inject(ToastService);

  adoptions    = signal<Adoption[]>([]);
  loading      = signal(true);
  filterStatus = '';
  openIds      = new Set<number>();

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.openIds.clear();
    this.adoptionSvc.listAll(this.filterStatus || undefined).subscribe({
      next: (a: any) => { this.adoptions.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggle(id: number): void {
    this.openIds.has(id) ? this.openIds.delete(id) : this.openIds.add(id);
  }

  isOpen(id: number): boolean { return this.openIds.has(id); }

  review(id: number, status: 'APROVADO' | 'RECUSADO' | 'CONCLUIDO'): void {
    this.adoptionSvc.review(id, { status }).subscribe({
      next: (updated: any) => {
        const labels: Record<string, string> = { APROVADO: 'aprovada', RECUSADO: 'recusada', CONCLUIDO: 'concluída' };
        this.toast.success(`Solicitação ${labels[status]}!`);
        this.adoptions.update((list: any) => list.map((a: any) => a.id === id ? updated : a));
      },
      error: (err: any) => this.toast.handleError(err)
    });
  }
}
