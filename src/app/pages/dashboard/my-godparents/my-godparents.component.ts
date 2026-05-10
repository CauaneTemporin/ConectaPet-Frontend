import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GodparentService, AnimalService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { Godparent, Animal } from '../../../shared/models';

@Component({
  selector: 'app-my-godparents',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, TitleCasePipe, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Meus Afilhados</h2>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin"></div></div>
    } @else if (godparents().length === 0) {
      <div class="empty-state">
        <div class="icon">⭐</div>
        <h3>Nenhum afilhado ainda</h3>
        <p>Apadrinhe um dos pets disponíveis abaixo e ajude no cuidado deles no abrigo!</p>
      </div>
    } @else {
      <div class="gp-grid">
        @for (g of godparents(); track g.id) {
          <div class="gp-card">
            <div class="gp-photo">
              @if (isUrl(g.animalPhoto)) {
                <img [src]="g.animalPhoto" [alt]="g.animalName" class="gp-img">
              } @else {
                {{ emoji(g.animalSpecies) }}
              }
            </div>

            <div class="gp-info">
              <div class="gp-name">{{ g.animalName }}</div>
              <div class="gp-species">{{ g.animalSpecies | titlecase }}</div>
              <div class="gp-since">Desde {{ g.startedAt | date:'MM/yyyy' }}</div>
            </div>

            <div class="gp-right">
              <div class="gp-amount-val">
                @if (g.amount != null && g.amount > 0) {
                  {{ g.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}/mês
                } @else {
                  <span class="no-amount">Valor não informado</span>
                }
              </div>
              <span class="status-pill" [ngClass]="'pill-' + g.status.toLowerCase()">
                {{ statusLabel(g.status) }}
              </span>
              @if (g.status.toLowerCase() === 'pendente') {
                <div class="pending-note">Aguardando aprovação do abrigo</div>
              }
              <div class="gp-actions">
                <button class="btn-link-teal" (click)="openEdit(g)">Alterar valor</button>
                <button class="btn-link-danger" (click)="openCancel(g)">Desistir</button>
              </div>
            </div>
          </div>
        }
      </div>
    }

    <!-- Animais disponíveis para apadrinhar -->
    @if (availableAnimals().length > 0) {
      <div class="available-section">
        <div class="available-header">
          <h3 class="available-title">Animais disponíveis para apadrinhar</h3>
          <span class="available-count">{{ availableAnimals().length }} disponíve{{ availableAnimals().length === 1 ? 'l' : 'is' }}</span>
        </div>
        <div class="available-grid">
          @for (animal of availableAnimals(); track animal.id) {
            <div class="avail-card">
              <div class="avail-photo" [class.rose-bg]="animal.species === 'gato'" [class.forest-bg]="animal.species === 'outro'">
                @if (isUrl(animal.photoUrl)) {
                  <img [src]="animal.photoUrl" [alt]="animal.name" class="avail-img">
                } @else {
                  {{ emoji(animal.species) }}
                }
              </div>
              <div class="avail-body">
                <div class="avail-name">{{ animal.name }}</div>
                <div class="avail-species">{{ animal.species | titlecase }}
                  @if (animal.breed) { · {{ animal.breed }} }
                </div>
                @if (animal.description) {
                  <div class="avail-desc">{{ animal.description }}</div>
                }
                <div class="avail-chips">
                  @if (animal.vaccinated) { <span class="chip chip-teal">Vacinado</span> }
                  @if (animal.neutered)   { <span class="chip chip-forest">Castrado</span> }
                  @if (animal.size)       { <span class="chip chip-rose">{{ animal.size | titlecase }}</span> }
                </div>
                <button class="btn-sponsor" (click)="openSponsor(animal)">Apadrinhar ⭐</button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- MODAL: alterar valor -->
    @if (editTarget()) {
      <div class="modal-backdrop" (click)="closeEdit()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Alterar valor — {{ editTarget()!.animalName }}</h3>
            <button class="modal-close" (click)="closeEdit()">✕</button>
          </div>
          <p class="modal-desc">Informe o novo valor mensal. O apadrinhamento voltará para <strong>pendente</strong> até o abrigo aprovar novamente.</p>
          <div class="amount-field">
            <span class="amount-prefix">R$</span>
            <input type="number" class="amount-input" [(ngModel)]="editAmount"
              placeholder="0,00" min="1" step="0.01" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeEdit()">Cancelar</button>
            <button class="btn btn-teal" (click)="confirmEdit()"
              [disabled]="!editAmount || editAmount <= 0 || saving()">
              @if (saving()) { <span class="spin-inline"></span> } Salvar alteração
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: confirmar desistência -->
    @if (cancelTarget()) {
      <div class="modal-backdrop" (click)="closeCancel()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Desistir de {{ cancelTarget()!.animalName }}?</h3>
            <button class="modal-close" (click)="closeCancel()">✕</button>
          </div>
          <p class="modal-desc">Tem certeza que deseja encerrar o apadrinhamento de <strong>{{ cancelTarget()!.animalName }}</strong>? Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeCancel()">Voltar</button>
            <button class="btn btn-danger-solid" (click)="confirmCancel()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Confirmar desistência
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL: apadrinhar novo animal -->
    @if (sponsorTarget()) {
      <div class="modal-backdrop" (click)="closeSponsor()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Apadrinhar {{ sponsorTarget()!.name }}</h3>
            <button class="modal-close" (click)="closeSponsor()">✕</button>
          </div>
          <p class="modal-desc">Defina o valor mensal de contribuição para o cuidado de <strong>{{ sponsorTarget()!.name }}</strong> no abrigo.</p>
          <div class="amount-field">
            <span class="amount-prefix">R$</span>
            <input type="number" class="amount-input" [(ngModel)]="sponsorAmount"
              placeholder="0,00" min="1" step="0.01" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeSponsor()">Cancelar</button>
            <button class="btn btn-teal" (click)="confirmSponsor()"
              [disabled]="!sponsorAmount || sponsorAmount <= 0 || saving()">
              @if (saving()) { <span class="spin-inline"></span> } Confirmar apadrinhamento
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .gp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .gp-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; }
    .gp-photo { font-size: 2.5rem; width: 56px; height: 56px; background: var(--teal-light); border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
    .gp-img { width: 100%; height: 100%; object-fit: cover; }
    .gp-info { flex: 1; }
    .gp-name { font-weight: 800; font-size: 1rem; color: var(--forest); }
    .gp-species { font-size: 12.5px; color: var(--muted); }
    .gp-since { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
    .gp-right { text-align: right; flex-shrink: 0; }
    .gp-amount-val { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--teal-dark); font-weight: 600; margin-bottom: 4px; }
    .no-amount { font-family: 'Nunito', sans-serif; font-size: 12px; color: var(--muted); font-weight: 400; }
    .pending-note { font-size: 11px; color: #b45309; margin-top: 4px; }

    .pill-pendente { background: #fef3c7; color: #b45309; }
    .pill-aprovado  { background: #d1fae5; color: #065f46; }

    .gp-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    .btn-link-teal  { background: none; border: none; color: var(--teal-dark); font-size: 12px; font-weight: 700; cursor: pointer; padding: 2px 0; text-decoration: underline; font-family: 'Nunito', sans-serif; }
    .btn-link-danger { background: none; border: none; color: #dc2626; font-size: 12px; font-weight: 700; cursor: pointer; padding: 2px 0; text-decoration: underline; font-family: 'Nunito', sans-serif; }

    /* Available section */
    .available-section { margin-top: 1rem; }
    .available-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 1.5px solid var(--border); }
    .available-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.15rem; }
    .available-count { font-size: 12px; background: var(--teal-light); color: var(--teal-dark); padding: 2px 10px; border-radius: 99px; font-weight: 700; }

    .available-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .avail-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); overflow: hidden; transition: transform .2s, box-shadow .2s; &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); } }
    .avail-photo { height: 130px; background: var(--teal-light); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; overflow: hidden; }
    .avail-photo.rose-bg   { background: var(--rose-light); }
    .avail-photo.forest-bg { background: #E8F0EB; }
    .avail-img { width: 100%; height: 100%; object-fit: cover; }
    .avail-body { padding: 1rem; }
    .avail-name { font-weight: 800; font-size: .95rem; color: var(--forest); margin-bottom: 2px; }
    .avail-species { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .avail-desc { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .avail-chips { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
    .btn-sponsor { width: 100%; background: var(--rose); color: var(--rose-dark); border: none; border-radius: var(--r-sm); padding: .45rem; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; &:hover { background: var(--rose-dark); color: white; } }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; h3 { font-family: 'Lora', serif; font-size: 1.2rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
    .amount-field { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: var(--r-sm); overflow: hidden; margin-bottom: 1.5rem; &:focus-within { border-color: var(--teal); } }
    .amount-prefix { padding: .75rem 1rem; background: var(--cream); font-size: 15px; font-weight: 700; color: var(--forest); border-right: 1.5px solid var(--border); }
    .amount-input { flex: 1; border: none; outline: none; padding: .75rem 1rem; font-size: 16px; font-family: 'Nunito', sans-serif; color: var(--text); &::placeholder { color: var(--muted); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-danger-solid { background: #dc2626; color: white; border: none; border-radius: var(--r-sm); padding: .6rem 1.25rem; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: #b91c1c; } &:disabled { opacity: .6; cursor: not-allowed; } }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
  `]
})
export class MyGodparentsComponent implements OnInit {
  private svc        = inject(GodparentService);
  private animalSvc  = inject(AnimalService);
  private toast      = inject(ToastService);

  godparents       = signal<Godparent[]>([]);
  availableAnimals = signal<Animal[]>([]);
  loading          = signal(true);
  saving           = signal(false);
  editTarget       = signal<Godparent | null>(null);
  cancelTarget     = signal<Godparent | null>(null);
  sponsorTarget    = signal<Animal | null>(null);
  editAmount       = 0;
  sponsorAmount    = 0;

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      godparents: this.svc.mine(),
      animals:    this.animalSvc.list()
    }).subscribe({
      next: ({ godparents, animals }: any) => {
        const gps: Godparent[] = Array.isArray(godparents) ? godparents : [];
        const all: Animal[]    = Array.isArray(animals) ? animals : [];
        const myIds = new Set(gps.map((gp: any) => gp.animalId));
        this.godparents.set(gps);
        this.availableAnimals.set(all.filter(x => x.status === 'disponivel' && !myIds.has(x.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openEdit(g: Godparent): void  { this.editAmount = g.amount ?? 0; this.editTarget.set(g); }
  closeEdit(): void { this.editTarget.set(null); this.editAmount = 0; }

  confirmEdit(): void {
    const g = this.editTarget();
    if (!g || !this.editAmount || this.editAmount <= 0) return;
    this.saving.set(true);
    this.svc.updateAmount(g.id, { amount: this.editAmount }).subscribe({
      next: () => {
        this.toast.success('Valor atualizado! Aguardando reaprovação do abrigo.');
        this.closeEdit();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  openCancel(g: Godparent): void { this.cancelTarget.set(g); }
  closeCancel(): void { this.cancelTarget.set(null); }

  confirmCancel(): void {
    const g = this.cancelTarget();
    if (!g) return;
    this.saving.set(true);
    this.svc.delete(g.id).subscribe({
      next: () => {
        this.toast.success(`Apadrinhamento de ${g.animalName} encerrado.`);
        this.closeCancel();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  openSponsor(animal: Animal): void { this.sponsorAmount = 0; this.sponsorTarget.set(animal); }
  closeSponsor(): void { this.sponsorTarget.set(null); this.sponsorAmount = 0; }

  confirmSponsor(): void {
    const animal = this.sponsorTarget();
    if (!animal || !this.sponsorAmount || this.sponsorAmount <= 0) return;
    this.saving.set(true);
    this.svc.register({ animalId: animal.id, amount: this.sponsorAmount }).subscribe({
      next: () => {
        this.toast.success(`Apadrinhamento de ${animal.name} registrado! ⭐`);
        this.closeSponsor();
        this.saving.set(false);
        this.load();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  statusLabel(status: string): string {
    return status.toLowerCase() === 'aprovado' ? 'Aprovado' : 'Pendente';
  }
  emoji(species: string): string {
    const map: Record<string, string> = { cachorro: '🐕', gato: '🐱', outro: '🐾' };
    return map[species] ?? '🐾';
  }
  isUrl(photo?: string): boolean { return (photo ?? '').length > 4; }
}
