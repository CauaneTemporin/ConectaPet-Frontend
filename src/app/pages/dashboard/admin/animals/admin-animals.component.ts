import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Animal, AnimalRequest } from '../../../../shared/models';

@Component({
  selector: 'app-admin-animals',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Gerenciar Animais</h2>
      <button class="btn btn-teal btn-sm" (click)="openForm()">+ Adicionar animal</button>
    </div>

    @if (showForm()) {
      <div class="animal-form">
        <h3>{{ editingId() ? 'Editar animal' : 'Novo animal' }}</h3>
        <div class="form-row">
          <div class="form-field"><label class="form-label">Nome *</label><input class="form-input" [(ngModel)]="form.name" placeholder="Nome do animal"></div>
          <div class="form-field">
            <label class="form-label">Espécie *</label>
            <select class="form-input" [(ngModel)]="form.species">
              <option value="CACHORRO">Cachorro</option>
              <option value="GATO">Gato</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field"><label class="form-label">Raça</label><input class="form-input" [(ngModel)]="form.breed" placeholder="Raça ou SRD"></div>
          <div class="form-field">
            <label class="form-label">Gênero</label>
            <select class="form-input" [(ngModel)]="form.gender">
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Fêmea</option>
            </select>
          </div>
          <div class="form-field"><label class="form-label">Idade (anos)</label><input class="form-input" type="number" [(ngModel)]="form.ageYears" placeholder="2.5"></div>
          <div class="form-field">
            <label class="form-label">Porte</label>
            <select class="form-input" [(ngModel)]="form.size">
              <option value="PEQUENO">Pequeno</option>
              <option value="MEDIO">Médio</option>
              <option value="GRANDE">Grande</option>
            </select>
          </div>
        </div>
        <div class="form-field"><label class="form-label">Descrição</label><textarea class="form-input" [(ngModel)]="form.description" rows="3" placeholder="Ideal para famílias ativas..."></textarea></div>
        <div class="form-field"><label class="form-label">Temperamento</label><input class="form-input" [(ngModel)]="form.temperament" placeholder="Dócil, brincalhão..."></div>
        <div class="form-field"><label class="form-label">Foto (emoji ou URL)</label><input class="form-input" [(ngModel)]="form.photoUrl" placeholder="🐕 ou https://..."></div>
        <div class="check-row">
          <label><input type="checkbox" [(ngModel)]="form.vaccinated"> Vacinado</label>
          <label><input type="checkbox" [(ngModel)]="form.neutered"> Castrado</label>
        </div>
        <div class="form-actions">
          <button class="btn btn-outline-teal" (click)="showForm.set(false)">Cancelar</button>
          <button class="btn btn-teal" (click)="saveAnimal()" [disabled]="saving()">
            @if (saving()) { <span class="spin-inline"></span> } Salvar
          </button>
        </div>
      </div>
    }

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else {
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Espécie</th><th>Raça</th><th>Porte</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            @for (a of animals(); track a.id) {
              <tr>
                <td><strong>{{ a.name }}</strong></td>
                <td>{{ a.species | titlecase }}</td>
                <td>{{ a.breed || '–' }}</td>
                <td>{{ a.size | titlecase }}</td>
                <td><span class="status-pill" [ngClass]="'pill-' + a.status">{{ a.status | titlecase }}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-outline-teal btn-sm" (click)="editAnimal(a)">✏️ Editar</button>
                    <button class="btn-danger" (click)="deleteAnimal(a.id)">🗑 Remover</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .animal-form { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.75rem; margin-bottom: 1.5rem; }
    .animal-form h3 { font-family: 'Lora', serif; font-size: 1.2rem; color: var(--forest); margin-bottom: 1.25rem; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .check-row { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
    .check-row label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
    .btn-danger { background: #fee2e2; color: #991b1b; border-radius: var(--r-sm); border: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13px; padding: 0.4rem 1rem; }
  `]
})
export class AdminAnimalsComponent implements OnInit {
  animalSvc = inject(AnimalService);
  toast     = inject(ToastService);

  animals   = signal<Animal[]>([]);
  loading   = signal(true);
  showForm  = signal(false);
  saving    = signal(false);
  editingId = signal<number | null>(null);

  form: AnimalRequest = this.emptyForm();

  ngOnInit(): void { this.loadAnimals(); }

  loadAnimals(): void {
    this.loading.set(true);
    this.animalSvc.list().subscribe({
      next: (a: any) => { this.animals.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm(): void { this.editingId.set(null); this.form = this.emptyForm(); this.showForm.set(true); }

  editAnimal(a: Animal): void {
    this.editingId.set(a.id);
    this.form = {
      name: a.name,
      species: a.species.toUpperCase(),
      breed: a.breed ?? '',
      gender: a.gender?.toUpperCase() ?? 'FEMEA',
      ageYears: a.ageYears,
      size: a.size?.toUpperCase() ?? 'MEDIO',
      description: a.description ?? '',
      temperament: a.temperament ?? '',
      vaccinated: a.vaccinated,
      neutered: a.neutered,
      status: a.status?.toUpperCase(),
      photoUrl: a.photoUrl ?? ''
    };
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveAnimal(): void {
    if (!this.form.name) { this.toast.error('Nome é obrigatório.'); return; }
    this.saving.set(true);
    const id = this.editingId();
    const obs = id ? this.animalSvc.update(id, this.form) : this.animalSvc.create(this.form);
    obs.subscribe({
      next: () => {
        this.toast.success(id ? 'Animal atualizado!' : 'Animal cadastrado! 🐾');
        this.showForm.set(false);
        this.saving.set(false);
        this.loadAnimals();
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  deleteAnimal(id: number): void {
    if (!confirm('Remover este animal?')) return;
    this.animalSvc.delete(id).subscribe({
      next: () => { this.toast.success('Animal removido.'); this.loadAnimals(); },
      error: (err: any) => this.toast.handleError(err)
    });
  }

  private emptyForm(): AnimalRequest {
    return { name: '', species: 'CACHORRO', breed: '', gender: 'FEMEA', ageYears: undefined, size: 'MEDIO', description: '', temperament: '', vaccinated: false, neutered: false, status: 'DISPONIVEL', photoUrl: '' };
  }
}
