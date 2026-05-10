import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService, AdoptionService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';
import { AdoptModalComponent } from '../../shared/components/adopt-modal/adopt-modal.component';
import { Animal } from '../../shared/models';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, FormsModule, PetCardComponent, AdoptModalComponent],
  template: `
    <div class="page-enter">
      <div class="animals-banner">Animais disponíveis para adoção</div>

      <div class="filter-bar">
        <span class="filter-label">Filtrar:</span>
        <button class="filter-btn" [class.active]="activeFilter === ''"         (click)="setFilter('')">Todos</button>
        <button class="filter-btn" [class.active]="activeFilter === 'cachorro'" (click)="setFilter('cachorro')">🐕 Cachorros</button>
        <button class="filter-btn" [class.active]="activeFilter === 'gato'"     (click)="setFilter('gato')">🐈 Gatos</button>
        <button class="filter-btn" [class.active]="activeFilter === 'outro'"    (click)="setFilter('outro')">🐾 Outros</button>
        <button class="filter-btn" [class.active]="activeFilter === 'pequeno'"  (click)="setFilter('pequeno')">Pequeno porte</button>
        <button class="filter-btn" [class.active]="activeFilter === 'grande'"   (click)="setFilter('grande')">Grande porte</button>

        <input
          class="form-input search-input"
          type="text"
          placeholder="🔍 Buscar por nome..."
          [ngModel]="searchQuery"
          (ngModelChange)="onSearch($event)" />
      </div>

      <div class="pet-grid">
        @if (loading()) {
          <div class="empty-state">
            <div class="spin-lg"></div>
          </div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">
            <div class="icon">🔍</div>
            <h3>Nenhum animal encontrado</h3>
            <p>Tente outros filtros ou termos de busca.</p>
          </div>
        } @else {
          @for (animal of filtered(); track animal.id; let i = $index) {
            <app-pet-card
              [animal]="animal"
              [index]="i"
              mode="adopt"
              (onAdopt)="openAdoptModal($event)" />
          }
        }
      </div>
    </div>

    <app-adopt-modal
      #adoptModal
      [visible]="modalVisible()"
      [animal]="selectedAnimal()"
      (onClose)="closeModal()"
      (onSubmit)="submitAdoption($event)" />
  `,
  styles: [`
    .filter-bar {
      display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
      max-width: 1100px; margin: 1.5rem auto 0; padding: 0 2rem;
    }
    .filter-label {
      font-size: 13px; font-weight: 700; color: var(--muted);
      margin-right: 4px; white-space: nowrap;
    }
    .filter-btn {
      padding: 0.38rem 1rem; border-radius: 99px; font-size: 13px;
      font-weight: 600; cursor: pointer; border: 1.5px solid var(--border);
      background: white; color: var(--forest);
      font-family: 'Nunito', sans-serif;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }
    .filter-btn:hover { background: var(--teal-light); border-color: var(--teal); }
    .filter-btn.active { background: var(--teal); border-color: var(--teal); color: white; }
    .pet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem; max-width: 1100px; margin: 1.5rem auto; padding: 0 2rem 3rem;
    }
    .empty-state { grid-column: 1/-1; text-align: center; padding: 4rem 1rem; }
    .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { font-family: 'Lora', serif; font-size: 1.4rem; color: var(--forest); }
    .empty-state p { color: var(--muted); font-size: 14px; margin-top: .5rem; }
    .animals-banner {
      background: var(--teal-light); text-align: center;
      padding: 2.5rem 1rem; font-family: 'Lora', serif;
      font-size: 1.8rem; color: var(--forest); font-weight: 700;
    }
    .search-input {
      max-width: 220px; margin-left: auto;
      padding: 0.38rem 0.75rem; font-size: 13px;
    }
    .spin-lg {
      width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4);
      border-top-color: var(--teal-dark); border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 3rem auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AnimalsComponent implements OnInit {
  private animalSvc   = inject(AnimalService);
  private adoptionSvc = inject(AdoptionService);
  private toast       = inject(ToastService);
  auth                = inject(AuthService);

  allAnimals     = signal<Animal[]>([]);
  filtered       = signal<Animal[]>([]);
  loading        = signal(true);
  activeFilter   = '';     // plain string, not signal — used with [class.active]
  searchQuery    = '';
  modalVisible   = signal(false);
  selectedAnimal = signal<Animal | null>(null);

  @ViewChild('adoptModal') adoptModal?: AdoptModalComponent;

  ngOnInit(): void {
    this.animalSvc.list({ status: 'DISPONIVEL' }).subscribe({
      next: (animals: any) => {
        this.allAnimals.set(animals);
        this.filtered.set(animals);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar animais. Verifique se o servidor está rodando.');
      }
    });
  }

  setFilter(value: string): void {
    this.activeFilter = value;
    this.searchQuery  = '';
    this.applyFilter();
  }

  onSearch(q: string): void {
    this.searchQuery  = q;
    this.activeFilter = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    let list = this.allAnimals();
    const f  = this.activeFilter.toLowerCase();
    const s  = this.searchQuery.toLowerCase();

    if (['cachorro', 'gato', 'outro'].includes(f)) {
      list = list.filter((a: any) => a.species === f);
    } else if (['pequeno', 'medio', 'grande'].includes(f)) {
      list = list.filter((a: any) => a.size === f);
    }

    if (s) {
      list = list.filter((a: any) =>
        a.name.toLowerCase().includes(s) ||
        (a.breed ?? '').toLowerCase().includes(s) ||
        (a.description ?? '').toLowerCase().includes(s)
      );
    }
    this.filtered.set(list);
  }

  openAdoptModal(animal: Animal): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Faça login para solicitar adoção.');
      return;
    }
    this.selectedAnimal.set(animal);
    this.modalVisible.set(true);
  }

  closeModal(): void {
    this.modalVisible.set(false);
    this.selectedAnimal.set(null);
    this.adoptModal?.setLoading(false);
  }

  submitAdoption(data: { message?: string }): void {
    const animal = this.selectedAnimal();
    if (!animal) return;
    this.adoptModal?.setLoading(true);
    this.adoptionSvc.request({ animalId: animal.id, ...data }).subscribe({
      next: () => {
        this.toast.success('Solicitação enviada com sucesso! 🐾');
        this.closeModal();
      },
      error: (err: any) => {
        this.toast.handleError(err);
        this.adoptModal?.setLoading(false);
      }
    });
  }
}
