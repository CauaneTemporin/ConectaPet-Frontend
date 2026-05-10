import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnimalService, AdoptionService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdoptModalComponent } from '../../shared/components/adopt-modal/adopt-modal.component';
import { Animal, AnimalRequest } from '../../shared/models';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, RouterLink, AdoptModalComponent],
  template: `
    @if (loading()) {
      <div class="loading-full">
        <div class="spin-big"></div>
      </div>
    } @else if (!animal()) {
      <div class="not-found">
        <div class="nf-icon">🐾</div>
        <h2>Animal não encontrado</h2>
        <p>Este animal pode ter sido removido ou o link está incorreto.</p>
        <a routerLink="/animais" class="btn btn-teal">Ver todos os animais</a>
      </div>
    } @else {
      <div class="page-enter detail-page">

        <!-- BREADCRUMB -->
        <div class="breadcrumb">
          <a routerLink="/">Início</a>
          <span>/</span>
          <a routerLink="/animais">Animais</a>
          <span>/</span>
          <span>{{ animal()!.name }}</span>
        </div>

        <div class="detail-layout">

          <!-- LEFT: foto + chips -->
          <div class="detail-left">
            <div class="animal-photo" [class]="photoBg()">
              <span class="status-badge" [class]="statusClass()">{{ statusLabel() }}</span>
              @if (isPhotoUrl()) {
                <img [src]="animal()!.photoUrl" alt="{{ animal()!.name }}" class="photo-img">
              } @else {
                <div class="photo-emoji">{{ photoContent() }}</div>
              }
            </div>

            <div class="chips-section">
              @if (animal()!.vaccinated) { <span class="chip chip-teal">✓ Vacinado</span> }
              @if (animal()!.neutered)   { <span class="chip chip-forest">✓ Castrado</span> }
              @if (animal()!.size)       { <span class="chip chip-rose">{{ animal()!.size | titlecase }}</span> }
              @if (animal()!.gender)     { <span class="chip chip-rose">{{ animal()!.gender | titlecase }}</span> }
            </div>

            <!-- ação usuário comum -->
            @if (!auth.isAdmin()) {
              @if (animal()!.status === 'disponivel') {
                <button class="btn btn-teal btn-action" (click)="openAdoptModal()">
                  🐾 Quero adotar
                </button>
              } @else {
                <div class="status-info">
                  <span class="status-pill" [ngClass]="'pill-' + animal()!.status">{{ statusLabel() }}</span>
                  <p>Este animal não está disponível para adoção no momento.</p>
                </div>
              }
            }

            <!-- ações admin -->
            @if (auth.isAdmin()) {
              <div class="admin-actions">
                <button class="btn btn-outline-teal" (click)="toggleEdit()">
                  {{ editMode() ? '✕ Cancelar' : '✏️ Editar' }}
                </button>
                <button class="btn-danger-full" (click)="deleteAnimal()">
                  🗑️ Remover animal
                </button>
              </div>
            }
          </div>

          <!-- RIGHT: detalhes -->
          <div class="detail-right">

            <!-- VIEW MODE -->
            @if (!editMode()) {
              <div class="info-section">
                <h1 class="animal-name">{{ animal()!.name }}</h1>
                <p class="animal-species">{{ animal()!.species | titlecase }}
                  @if (animal()!.breed) { · {{ animal()!.breed }} }
                  @if (animal()!.ageYears) { · {{ animal()!.ageYears }} anos }
                </p>

                @if (animal()!.description) {
                  <div class="info-block">
                    <div class="info-label">Sobre</div>
                    <p class="info-text">{{ animal()!.description }}</p>
                  </div>
                }

                @if (animal()!.temperament) {
                  <div class="info-block">
                    <div class="info-label">Temperamento</div>
                    <p class="info-text">{{ animal()!.temperament }}</p>
                  </div>
                }

                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-item-label">Espécie</div>
                    <div class="info-item-val">{{ animal()!.species | titlecase }}</div>
                  </div>
                  @if (animal()!.breed) {
                    <div class="info-item">
                      <div class="info-item-label">Raça</div>
                      <div class="info-item-val">{{ animal()!.breed }}</div>
                    </div>
                  }
                  @if (animal()!.ageYears) {
                    <div class="info-item">
                      <div class="info-item-label">Idade</div>
                      <div class="info-item-val">{{ animal()!.ageYears }} anos</div>
                    </div>
                  }
                  @if (animal()!.size) {
                    <div class="info-item">
                      <div class="info-item-label">Porte</div>
                      <div class="info-item-val">{{ animal()!.size | titlecase }}</div>
                    </div>
                  }
                  @if (animal()!.gender) {
                    <div class="info-item">
                      <div class="info-item-label">Gênero</div>
                      <div class="info-item-val">{{ animal()!.gender | titlecase }}</div>
                    </div>
                  }
                  <div class="info-item">
                    <div class="info-item-label">Vacinado</div>
                    <div class="info-item-val">{{ animal()!.vaccinated ? 'Sim' : 'Não' }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-item-label">Castrado</div>
                    <div class="info-item-val">{{ animal()!.neutered ? 'Sim' : 'Não' }}</div>
                  </div>
                  @if (animal()!.shelterName) {
                    <div class="info-item">
                      <div class="info-item-label">Abrigo</div>
                      <div class="info-item-val">{{ animal()!.shelterName }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- EDIT MODE (admin only) -->
            @if (editMode()) {
              <div class="edit-form">
                <h2 class="edit-title">Editar Animal</h2>

                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label">Nome *</label>
                    <input class="form-input" [(ngModel)]="form.name" placeholder="Nome do animal">
                  </div>
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
                  <div class="form-field">
                    <label class="form-label">Raça</label>
                    <input class="form-input" [(ngModel)]="form.breed" placeholder="Raça ou SRD">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Gênero</label>
                    <select class="form-input" [(ngModel)]="form.gender">
                      <option value="MACHO">Macho</option>
                      <option value="FEMEA">Fêmea</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Idade (anos)</label>
                    <input class="form-input" type="number" [(ngModel)]="form.ageYears" placeholder="2">
                  </div>
                  <div class="form-field">
                    <label class="form-label">Porte</label>
                    <select class="form-input" [(ngModel)]="form.size">
                      <option value="PEQUENO">Pequeno</option>
                      <option value="MEDIO">Médio</option>
                      <option value="GRANDE">Grande</option>
                    </select>
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-label">Status</label>
                  <select class="form-input" [(ngModel)]="form.status">
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="ADOTADO">Adotado</option>
                    <option value="APADRINHADO">Apadrinhado</option>
                  </select>
                </div>

                <div class="form-field">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-input" [(ngModel)]="form.description" rows="3"
                    placeholder="Ideal para famílias ativas..."></textarea>
                </div>

                <div class="form-field">
                  <label class="form-label">Temperamento</label>
                  <input class="form-input" [(ngModel)]="form.temperament" placeholder="Dócil, brincalhão...">
                </div>

                <div class="form-field">
                  <label class="form-label">Foto (emoji ou URL)</label>
                  <input class="form-input" [(ngModel)]="form.photoUrl" placeholder="🐕 ou https://...">
                </div>

                <div class="check-row">
                  <label><input type="checkbox" [(ngModel)]="form.vaccinated"> Vacinado</label>
                  <label><input type="checkbox" [(ngModel)]="form.neutered"> Castrado</label>
                </div>

                <div class="form-actions">
                  <button class="btn btn-outline-teal" (click)="editMode.set(false)">Cancelar</button>
                  <button class="btn btn-teal" (click)="saveAnimal()" [disabled]="saving()">
                    @if (saving()) { <span class="spin-inline"></span> }
                    Salvar alterações
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    }

    <!-- ADOPT MODAL -->
    <app-adopt-modal
      [visible]="modalVisible()"
      [animal]="animal()"
      (onClose)="modalVisible.set(false)"
      (onSubmit)="submitAdoption($event)" />
  `,
  styles: [`
    .loading-full {
      display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - 72px);
    }
    .spin-big {
      width: 44px; height: 44px;
      border: 4px solid rgba(168,216,168,0.4);
      border-top-color: var(--teal-dark);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .not-found {
      text-align: center; padding: 6rem 2rem;
      .nf-icon { font-size: 5rem; margin-bottom: 1rem; }
      h2 { font-family: 'Lora', serif; font-size: 1.8rem; color: var(--forest); margin-bottom: .5rem; }
      p  { color: var(--muted); font-size: 15px; margin-bottom: 1.5rem; }
    }

    .breadcrumb {
      display: flex; align-items: center; gap: 8px;
      padding: 1rem 2rem; font-size: 13px; color: var(--muted);
      max-width: 1100px; margin: 0 auto;
      a { color: var(--teal-dark); text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
    }

    .detail-page { max-width: 1100px; margin: 0 auto; padding: 0 2rem 4rem; }

    .detail-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* LEFT */
    .detail-left { position: sticky; top: 88px; }

    .animal-photo {
      border-radius: var(--r); height: 300px;
      display: flex; align-items: center; justify-content: center;
      position: relative; background: var(--teal-light);
      margin-bottom: 1rem; overflow: hidden;
    }
    .photo-img { width: 100%; height: 100%; object-fit: cover; }
    .animal-photo.rose-bg   { background: var(--rose-light); }
    .animal-photo.forest-bg { background: #E8F0EB; }
    .photo-emoji { font-size: 7rem; }

    .status-badge {
      position: absolute; top: 14px; right: 14px;
      background: var(--teal); color: white;
      font-size: 11px; font-weight: 700; padding: 4px 12px;
      border-radius: 99px; text-transform: uppercase; letter-spacing: .05em;
    }
    .status-badge.rose { background: var(--rose); color: var(--rose-dark); }
    .status-badge.gray { background: var(--muted); color: white; }

    .chips-section { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }

    .btn-action {
      width: 100%; justify-content: center;
      padding: .75rem; font-size: 15px; border-radius: var(--r-sm);
      margin-bottom: .75rem;
    }

    .status-info {
      background: var(--cream-warm); border-radius: var(--r-sm);
      padding: 1rem; text-align: center;
      p { font-size: 13px; color: var(--muted); margin-top: .5rem; line-height: 1.6; }
    }

    .admin-actions {
      display: flex; flex-direction: column; gap: .75rem; margin-top: .5rem;
      button { width: 100%; justify-content: center; padding: .7rem; font-size: 14px; }
    }

    .btn-danger-full {
      width: 100%; background: #fee2e2; color: #991b1b;
      border: 1.5px solid #fca5a5; border-radius: var(--r-sm);
      padding: .7rem; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: 'Nunito', sans-serif;
      transition: background .2s;
      &:hover { background: #fca5a5; }
    }

    /* RIGHT */
    .info-section { }

    .animal-name {
      font-family: 'Lora', serif; font-size: 2.2rem;
      color: var(--forest); margin-bottom: .25rem;
    }
    .animal-species { font-size: 15px; color: var(--muted); margin-bottom: 1.75rem; }

    .info-block {
      margin-bottom: 1.5rem;
      .info-label { font-size: 11.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
      .info-text  { font-size: 15px; color: var(--text); line-height: 1.85; }
    }

    .info-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;
      margin-top: 1.5rem;
    }
    .info-item {
      background: white; border: 1.5px solid var(--border);
      border-radius: var(--r-sm); padding: 1rem;
    }
    .info-item-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
    .info-item-val   { font-weight: 700; font-size: 14px; color: var(--forest); }

    /* EDIT FORM */
    .edit-form { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 2rem; }
    .edit-title { font-family: 'Lora', serif; font-size: 1.5rem; color: var(--forest); margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .check-row { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
    .check-row label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
      .detail-left { position: static; }
      .breadcrumb { padding: 1rem; }
      .detail-page { padding: 0 1rem 3rem; }
    }
  `]
})
export class AnimalDetailComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private animalSvc   = inject(AnimalService);
  private adoptionSvc = inject(AdoptionService);
  private toast       = inject(ToastService);
  auth                = inject(AuthService);

  animal       = signal<Animal | null>(null);
  loading      = signal(true);
  editMode     = signal(false);
  saving       = signal(false);
  modalVisible = signal(false);

  form: AnimalRequest = this.emptyForm();

  private readonly BG = ['', 'rose-bg', 'forest-bg', ''];
  private readonly EMOJIS: Record<string, string> = { cachorro: '🐕', gato: '🐱', outro: '🐾' };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.loading.set(false); return; }

    this.animalSvc.getById(id).subscribe({
      next: (a: any) => { this.animal.set(a); this.loading.set(false); },
      error: ()      => { this.loading.set(false); }
    });
  }

  photoBg(): string {
    const idx = (this.animal()?.id ?? 0) % this.BG.length;
    return this.BG[idx];
  }

  isPhotoUrl(): boolean {
    return (this.animal()?.photoUrl ?? '').length > 4;
  }

  photoContent(): string {
    const a = this.animal();
    if (!a) return '🐾';
    const url = a.photoUrl ?? '';
    return url && url.length <= 4 ? url : (this.EMOJIS[a.species] ?? '🐾');
  }

  statusLabel(): string {
    const map: Record<string, string> = { disponivel: 'Disponível', adotado: 'Adotado', apadrinhado: 'Apadrinhado' };
    return map[this.animal()?.status ?? ''] ?? (this.animal()?.status ?? '');
  }

  statusClass(): string {
    const s = this.animal()?.status;
    return s === 'adotado' ? 'gray' : s === 'apadrinhado' ? 'rose' : '';
  }

  toggleEdit(): void {
    const a = this.animal();
    if (!a) return;
    this.form = {
      name:        a.name,
      species:     a.species.toUpperCase(),
      breed:       a.breed ?? '',
      gender:      a.gender?.toUpperCase() ?? 'FEMEA',
      ageYears:    a.ageYears,
      size:        a.size?.toUpperCase() ?? 'MEDIO',
      description: a.description ?? '',
      temperament: a.temperament ?? '',
      vaccinated:  a.vaccinated,
      neutered:    a.neutered,
      status:      a.status.toUpperCase(),
      photoUrl:    a.photoUrl ?? ''
    };
    this.editMode.update(v => !v);
  }

  saveAnimal(): void {
    const a = this.animal();
    if (!a || !this.form.name) { this.toast.error('Nome é obrigatório.'); return; }
    this.saving.set(true);
    this.animalSvc.update(a.id, this.form).subscribe({
      next: (updated: any) => {
        this.animal.set(updated);
        this.editMode.set(false);
        this.saving.set(false);
        this.toast.success('Animal atualizado com sucesso! ✅');
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  deleteAnimal(): void {
    const a = this.animal();
    if (!a) return;
    if (!confirm(`Remover ${a.name} permanentemente?`)) return;
    this.animalSvc.delete(a.id).subscribe({
      next: () => {
        this.toast.success(`${a.name} foi removido.`);
        this.router.navigate(['/animais']);
      },
      error: (err: any) => this.toast.handleError(err)
    });
  }

  openAdoptModal(): void {
    if (!this.auth.isLoggedIn()) { this.toast.info('Faça login para solicitar adoção.'); return; }
    this.modalVisible.set(true);
  }

  submitAdoption(data: { message?: string }): void {
    const a = this.animal();
    if (!a) return;
    this.adoptionSvc.request({ animalId: a.id, ...data }).subscribe({
      next: () => { this.toast.success('Solicitação de adoção enviada! 🐾'); this.modalVisible.set(false); },
      error: (err: any) => this.toast.handleError(err)
    });
  }

  private emptyForm(): AnimalRequest {
    return { name: '', species: 'CACHORRO', breed: '', gender: 'FEMEA', ageYears: undefined, size: 'MEDIO', description: '', temperament: '', vaccinated: false, neutered: false, status: 'DISPONIVEL', photoUrl: '' };
  }
}
