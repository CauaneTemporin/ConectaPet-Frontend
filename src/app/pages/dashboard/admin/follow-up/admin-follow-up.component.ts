import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FollowUpService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { FollowUpVisit, FollowUpStatus } from '../../../../shared/models';

@Component({
  selector: 'app-admin-follow-up',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Visitas de Acompanhamento</h2>
      <button class="btn btn-teal btn-sm" (click)="openNew()">+ Agendar visita</button>
    </div>

    <!-- Filtros de status -->
    <div class="filter-row">
      @for (f of filters; track f.value) {
        <button class="filter-chip" [class.active]="filterStatus === f.value"
          (click)="filterStatus = f.value">
          {{ f.label }}
          @if (countByStatus(f.value) > 0) {
            <span class="chip-count">{{ countByStatus(f.value) }}</span>
          }
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (filtered().length === 0) {
      <div class="empty-state">
        <div class="icon">📅</div>
        <h3>Nenhuma visita {{ filterStatus ? statusLabel(filterStatus) : '' }}</h3>
        <p>Agende visitas de acompanhamento pós-adoção para garantir o bem-estar dos animais adotados.</p>
      </div>
    } @else {
      <div class="visit-list">
        @for (v of filtered(); track v.id) {
          <div class="visit-card" [class.overdue]="isOverdue(v)">
            <div class="visit-left">
              <div class="visit-animal">{{ v.animalName }}</div>
              @if (v.adopterName) {
                <div class="visit-adopter">{{ v.adopterName }}
                  @if (v.adopterEmail) { <span class="muted-text">· {{ v.adopterEmail }}</span> }
                </div>
              }
              @if (v.notes) {
                <div class="visit-notes">{{ v.notes }}</div>
              }
            </div>

            <div class="visit-center">
              <div class="col-label">Data agendada</div>
              <strong class="visit-date" [class.overdue-date]="isOverdue(v)">
                {{ v.scheduledDate | date:'dd/MM/yyyy' }}
                @if (isOverdue(v)) { <span class="overdue-tag">Atrasada</span> }
              </strong>
              @if (v.nextVisitDate) {
                <div class="next-visit">Próxima: {{ v.nextVisitDate | date:'dd/MM/yyyy' }}</div>
              }
            </div>

            <div class="visit-status-col">
              <div class="col-label">Status</div>
              <span class="status-pill" [ngClass]="'pill-visit-' + v.status">{{ statusLabel(v.status) }}</span>
            </div>

            <div class="visit-result-col">
              @if (v.result) {
                <div class="col-label">Resultado</div>
                <div class="result-text">{{ v.result }}</div>
              }
            </div>

            <div class="visit-actions">
              @if (v.status === 'agendada') {
                <button class="btn btn-sm btn-teal" (click)="openResult(v)">Registrar resultado</button>
              }
              <button class="btn btn-sm btn-outline-teal" (click)="openEdit(v)">Editar</button>
              <button class="btn btn-sm btn-outline-teal" (click)="confirmDelete(v)">Excluir</button>
            </div>
          </div>
        }
      </div>
    }

    <!-- MODAL: nova visita / editar -->
    @if (formTarget() !== null) {
      <div class="modal-backdrop" (click)="closeForm()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ formTarget()!.id ? 'Editar visita' : 'Agendar visita' }}</h3>
            <button class="modal-close" (click)="closeForm()">✕</button>
          </div>
          <div class="form-field">
            <label class="form-label">Nome do animal <span class="required">*</span></label>
            <input class="form-input" [(ngModel)]="formData.animalName" placeholder="Ex: Rex" />
          </div>
          <div class="two-col">
            <div class="form-field">
              <label class="form-label">Nome do adotante</label>
              <input class="form-input" [(ngModel)]="formData.adopterName" placeholder="Nome completo" />
            </div>
            <div class="form-field">
              <label class="form-label">E-mail do adotante</label>
              <input class="form-input" [(ngModel)]="formData.adopterEmail" placeholder="email@..." />
            </div>
          </div>
          <div class="two-col">
            <div class="form-field">
              <label class="form-label">Data agendada <span class="required">*</span></label>
              <input class="form-input" type="date" [(ngModel)]="formData.scheduledDate" />
            </div>
            <div class="form-field">
              <label class="form-label">Status</label>
              <select class="form-input" [(ngModel)]="formData.status">
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Observações</label>
            <textarea class="form-input" [(ngModel)]="formData.notes" rows="2"
              placeholder="Informações relevantes para a visita..."></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeForm()">Cancelar</button>
            <button class="btn btn-teal" (click)="saveForm()"
              [disabled]="!formData.animalName || !formData.scheduledDate || saving()">
              @if (saving()) { <span class="spin-inline"></span> }
              {{ formTarget()!.id ? 'Salvar' : 'Agendar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: registrar resultado -->
    @if (resultTarget()) {
      <div class="modal-backdrop" (click)="closeResult()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Resultado — {{ resultTarget()!.animalName }}</h3>
            <button class="modal-close" (click)="closeResult()">✕</button>
          </div>
          <div class="form-field">
            <label class="form-label">Resultado da visita <span class="required">*</span></label>
            <textarea class="form-input" [(ngModel)]="resultText" rows="4"
              placeholder="Descreva as condições do animal, do lar, observações gerais..."></textarea>
          </div>
          <div class="form-field">
            <label class="form-label">Data da próxima visita (opcional)</label>
            <input class="form-input" type="date" [(ngModel)]="nextVisitDate" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeResult()">Cancelar</button>
            <button class="btn btn-teal" (click)="saveResult()"
              [disabled]="!resultText.trim() || saving()">
              @if (saving()) { <span class="spin-inline"></span> } Salvar resultado
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
            <h3>Excluir visita de {{ deleteTarget()!.animalName }}?</h3>
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
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }

    .filter-row { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .filter-chip {
      padding: .35rem .9rem; border: 1.5px solid var(--border); border-radius: 99px;
      background: white; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600;
      color: var(--muted); cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 5px;
      &:hover { border-color: var(--teal); color: var(--teal-dark); }
      &.active { background: var(--teal-light); border-color: var(--teal-dark); color: var(--teal-dark); }
    }
    .chip-count { background: var(--teal-dark); color: white; font-size: 10px; padding: 1px 6px; border-radius: 99px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .visit-list { display: flex; flex-direction: column; gap: .75rem; }
    .visit-card {
      background: white; border-radius: var(--r); border: 1.5px solid var(--border);
      padding: 1rem 1.25rem; display: grid;
      grid-template-columns: 2fr 1.2fr 1fr 2fr auto;
      align-items: center; gap: 1rem;
    }
    .visit-card.overdue { border-color: #f59e0b; background: #fffbeb; }

    .visit-animal { font-weight: 800; color: var(--forest); font-size: .95rem; }
    .visit-adopter { font-size: 12.5px; color: var(--muted); margin-top: 2px; }
    .muted-text { color: var(--muted); }
    .visit-notes { font-size: 12px; color: var(--muted); margin-top: 4px; font-style: italic; }
    .col-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 3px; }
    .visit-date { font-size: .95rem; color: var(--forest); }
    .visit-date.overdue-date { color: #b45309; }
    .overdue-tag { background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 99px; margin-left: 6px; font-style: normal; }
    .next-visit { font-size: 11.5px; color: var(--muted); margin-top: 3px; }
    .result-text { font-size: 13px; color: var(--text); line-height: 1.5; }

    .pill-visit-agendada  { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-visit-realizada { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-visit-cancelada { background: #fee2e2; color: #991b1b; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }

    .visit-actions { display: flex; flex-direction: column; gap: .4rem; align-items: flex-end; }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 520px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; h3 { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: .5rem; }
    .btn-danger-solid { background: #dc2626; color: white; border: none; border-radius: var(--r-sm); padding: .6rem 1.25rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: #b91c1c; } &:disabled { opacity: .6; cursor: not-allowed; } }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    @media (max-width: 900px) {
      .visit-card { grid-template-columns: 1fr 1fr; }
      .visit-result-col { display: none; }
    }
  `]
})
export class AdminFollowUpComponent implements OnInit {
  private svc   = inject(FollowUpService);
  private toast = inject(ToastService);

  items        = signal<FollowUpVisit[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  filterStatus = '';
  formTarget   = signal<Partial<FollowUpVisit> | null>(null);
  resultTarget = signal<FollowUpVisit | null>(null);
  deleteTarget = signal<FollowUpVisit | null>(null);

  formData: Partial<FollowUpVisit> & { adopterName?: string; adopterEmail?: string } = this.blankForm();
  resultText  = '';
  nextVisitDate = '';

  filters = [
    { value: '',          label: 'Todas' },
    { value: 'agendada',  label: 'Agendadas' },
    { value: 'realizada', label: 'Realizadas' },
    { value: 'cancelada', label: 'Canceladas' },
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listAll().subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filtered(): FollowUpVisit[] {
    return this.filterStatus
      ? this.items().filter(v => v.status === this.filterStatus)
      : this.items();
  }

  countByStatus(s: string): number {
    return s ? this.items().filter(v => v.status === s).length : this.items().length;
  }

  isOverdue(v: FollowUpVisit): boolean {
    if (v.status !== 'agendada') return false;
    return new Date(v.scheduledDate) < new Date();
  }

  private blankForm(): Partial<FollowUpVisit> {
    return { animalName: '', scheduledDate: '', status: 'agendada', notes: '', adopterName: '', adopterEmail: '' } as any;
  }

  openNew(): void   { this.formData = this.blankForm(); this.formTarget.set({}); }
  openEdit(v: FollowUpVisit): void { this.formData = { ...v }; this.formTarget.set(v); }
  closeForm(): void { this.formTarget.set(null); }

  saveForm(): void {
    if (!this.formData.animalName || !this.formData.scheduledDate) return;
    this.saving.set(true);
    const id = (this.formTarget() as any)?.id;
    const obs = id
      ? this.svc.update(id, this.formData)
      : this.svc.create({
          animalName:    this.formData.animalName!,
          scheduledDate: this.formData.scheduledDate!,
          notes:         (this.formData as any).notes || undefined,
          adoptionId:    (this.formData as any).adoptionId || undefined,
          animalId:      (this.formData as any).animalId || undefined,
        });
    obs.subscribe({
      next: () => {
        this.toast.success(id ? 'Visita atualizada.' : 'Visita agendada!');
        this.closeForm();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  openResult(v: FollowUpVisit): void { this.resultText = v.result ?? ''; this.nextVisitDate = v.nextVisitDate ?? ''; this.resultTarget.set(v); }
  closeResult(): void { this.resultTarget.set(null); this.resultText = ''; this.nextVisitDate = ''; }

  saveResult(): void {
    const v = this.resultTarget();
    if (!v || !this.resultText.trim()) return;
    this.saving.set(true);
    this.svc.update(v.id, {
      status:        'realizada',
      result:        this.resultText.trim(),
      nextVisitDate: this.nextVisitDate || undefined,
    }).subscribe({
      next: () => {
        this.toast.success('Resultado registrado!');
        this.closeResult();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  confirmDelete(v: FollowUpVisit): void { this.deleteTarget.set(v); }

  doDelete(): void {
    const v = this.deleteTarget();
    if (!v) return;
    this.saving.set(true);
    this.svc.delete(v.id).subscribe({
      next: () => {
        this.toast.success('Visita excluída.');
        this.deleteTarget.set(null);
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { agendada: 'Agendada', realizada: 'Realizada', cancelada: 'Cancelada', '': 'Todas' };
    return map[s] ?? s;
  }
}
