import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService, GodparentService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';
import { Animal } from '../../shared/models';

@Component({
  selector: 'app-godparent',
  standalone: true,
  imports: [CommonModule, FormsModule, PetCardComponent],
  template: `
    <div class="page-enter">
      <div class="gp-hero">
        <div style="font-size:3.5rem;margin-bottom:1rem">⭐</div>
        <h1>Seja Padrinho</h1>
        <p>Apadrinhe um pet que ainda não encontrou lar e ajude com recursos para o seu cuidado no abrigo.</p>
      </div>
      <section class="section">
        <div class="section-tag rose">Animais para apadrinhar</div>
        <h2 class="section-title">Escolha seu afilhado</h2>
        <div class="pet-grid">
          @if (loading()) {
            <div class="empty-state"><div class="spin-lg"></div></div>
          } @else if (animals().length === 0) {
            <div class="empty-state">
              <div style="font-size:2.5rem;margin-bottom:.75rem">🐾</div>
              <h3>Nenhum animal disponível no momento</h3>
              <p>Volte em breve — novos pets chegam com frequência!</p>
            </div>
          } @else {
            @for (animal of animals(); track animal.id; let i = $index) {
              <app-pet-card [animal]="animal" [index]="i" mode="godparent" (onGodparent)="openGodparent($event)" />
            }
          }
        </div>
      </section>
    </div>

    @if (selectedAnimal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Apadrinhar {{ selectedAnimal()!.name }}</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <p class="modal-desc">Defina o valor mensal de contribuição para o cuidado de <strong>{{ selectedAnimal()!.name }}</strong> no abrigo.</p>
          <div class="amount-field">
            <span class="amount-prefix">R$</span>
            <input type="number" class="amount-input" [(ngModel)]="amountValue"
              placeholder="0,00" min="1" step="0.01" #amountInput />
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-teal" (click)="confirmGodparent()" [disabled]="!amountValue || amountValue <= 0 || saving()">
              @if (saving()) { <span class="spin-inline"></span> } Confirmar apadrinhamento
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .gp-hero { background: #1a4a32; padding: 5rem 2rem; text-align: center; color: white;
      h1 { font-family: 'Lora', serif; font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 1rem; }
      p  { font-size: 15px; color: rgba(255,255,255,0.8); max-width: 520px; margin: 0 auto; line-height: 1.85; }
    }
    .spin-lg { width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; margin: 3rem auto; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; h3 { font-family: 'Lora', serif; font-size: 1.25rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
    .amount-field { display: flex; align-items: center; border: 1.5px solid var(--border); border-radius: var(--r-sm); overflow: hidden; margin-bottom: 1.5rem; &:focus-within { border-color: var(--teal); } }
    .amount-prefix { padding: .75rem 1rem; background: var(--cream); font-size: 15px; font-weight: 700; color: var(--forest); border-right: 1.5px solid var(--border); }
    .amount-input { flex: 1; border: none; outline: none; padding: .75rem 1rem; font-size: 16px; font-family: 'Nunito', sans-serif; color: var(--text); &::placeholder { color: var(--muted); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class GodparentComponent implements OnInit {
  private animalSvc    = inject(AnimalService);
  private godparentSvc = inject(GodparentService);
  private auth         = inject(AuthService);
  private toast        = inject(ToastService);

  animals         = signal<Animal[]>([]);
  loading         = signal(true);
  saving          = signal(false);
  selectedAnimal  = signal<Animal | null>(null);
  amountValue     = 0;

  ngOnInit(): void {
    this.animalSvc.list().subscribe({
      next: (a: any) => {
        const all: Animal[] = Array.isArray(a) ? a : [];
        this.animals.set(all.filter(x => x.status === 'disponivel'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openGodparent(animal: Animal): void {
    if (!this.auth.isLoggedIn()) { this.toast.info('Faça login para apadrinhar.'); return; }
    this.amountValue = 0;
    this.selectedAnimal.set(animal);
  }

  closeModal(): void {
    this.selectedAnimal.set(null);
    this.amountValue = 0;
  }

  confirmGodparent(): void {
    const animal = this.selectedAnimal();
    if (!animal || !this.amountValue || this.amountValue <= 0) return;
    this.saving.set(true);
    this.godparentSvc.register({ animalId: animal.id, amount: this.amountValue }).subscribe({
      next: () => {
        this.toast.success(`Apadrinhamento de ${animal.name} registrado! ⭐`);
        this.closeModal();
        this.saving.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }
}
