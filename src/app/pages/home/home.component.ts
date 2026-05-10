import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimalService, AdoptionService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PetCardComponent } from '../../shared/components/pet-card/pet-card.component';
import { AdoptModalComponent } from '../../shared/components/adopt-modal/adopt-modal.component';
import { Animal } from '../../shared/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PetCardComponent, AdoptModalComponent],
  template: `
    <div class="page-enter">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-left">
          <div class="hero-left-inner">
            <div class="tag">🐾 Conectando corações</div>
            <h1>Animais que precisam de um lar <em>cheio de amor</em></h1>
            <p>A Conecta PET aproxima quem quer adotar de quem cuida. Seja adotante, padrinho ou voluntário — juntos salvamos mais vidas.</p>
            <div class="hero-ctas">
              <a routerLink="/animais"   class="btn btn-teal">Adotar agora 🐾</a>
              <a routerLink="/como-doar" class="btn btn-rose">Fazer doação ♥</a>
            </div>
            <div class="hero-stats">
              <div>
                <div class="stat-num">{{ adoptedCount() > 0 ? adoptedCount() : '–' }}</div>
                <div class="stat-label">Adoções</div>
              </div>
              <div>
                <div class="stat-num">420+</div>
                <div class="stat-label">Parceiros</div>
              </div>
              <div>
                <div class="stat-num">{{ availableCount() > 0 ? availableCount() : '–' }}</div>
                <div class="stat-label">Disponíveis</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-pet-icon">🐱</div>
          <ul class="hero-nav-list">
            <li><a routerLink="/quem-somos">Quem somos</a></li>
            <li><a routerLink="/animais">Adoção</a></li>
            <li><a routerLink="/como-doar">Doações</a></li>
            <li><a routerLink="/seja-voluntario">Seja voluntário</a></li>
            <li><a routerLink="/seja-padrinho">Seja padrinho</a></li>
            <li><a routerLink="/contato">Fale Conosco</a></li>
          </ul>
        </div>
      </div>

      <!-- ANIMALS -->
      <div class="animals-banner">Animais em destaque</div>

      <div class="pet-grid">
        @if (loading()) {
          <div class="empty-state">
            <div class="spin-lg"></div>
          </div>
        } @else if (animals().length === 0) {
          <div class="empty-state">
            <div class="icon">🐾</div>
            <h3>Nenhum animal disponível</h3>
            <p>Verifique se o servidor Java está rodando em <strong>localhost:8080</strong></p>
          </div>
        } @else {
          @for (animal of animals(); track animal.id; let i = $index) {
            <app-pet-card
              [animal]="animal"
              [index]="i"
              mode="adopt"
              (onAdopt)="openAdoptModal($event)" />
          }
        }
      </div>

      <!-- ROLES -->
      <div class="roles-section">
        <div class="roles-inner">
          <div class="profile-banner">
            <div class="profile-avatar">{{ auth.getUserInitials() }}</div>
            <div>
              <div class="profile-name">
                {{ auth.isLoggedIn() ? auth.currentUser()?.name : 'Faça login para acessar sua conta' }}
              </div>
              <div class="profile-sub">
                {{ auth.isLoggedIn() ? 'Membro da comunidade Conecta PET' : 'Adote, doe ou seja voluntário na Conecta PET' }}
              </div>
            </div>
            <div class="profile-action">
              @if (auth.isLoggedIn()) {
                <a routerLink="/dashboard" class="btn btn-outline-teal">Meu painel</a>
              } @else {
                <a routerLink="/login" class="btn btn-outline-teal">Entrar</a>
              }
            </div>
          </div>

          <div class="roles-grid">
            <a routerLink="/seja-voluntario" class="role-card">
              <div class="role-icon role-icon-teal">🙋</div>
              <h3>Voluntário</h3>
              <p>Ajude nos abrigos, transporte ou divulgação dos animais disponíveis.</p>
              <span class="btn btn-teal btn-sm">Ver mais</span>
            </a>
            <a routerLink="/animais" class="role-card">
              <div class="role-icon role-icon-rose">🏠</div>
              <h3>Adotante</h3>
              <p>Dê um lar definitivo a um animal que merece uma segunda chance.</p>
              <span class="btn btn-rose btn-sm">Ver mais</span>
            </a>
            <a routerLink="/seja-padrinho" class="role-card">
              <div class="role-icon role-icon-forest">⭐</div>
              <h3>Padrinho</h3>
              <p>Apadrinhe um pet no abrigo, contribuindo com recursos e visitas.</p>
              <span class="btn btn-forest btn-sm">Ver mais</span>
            </a>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL -->
    <app-adopt-modal
      #adoptModal
      [visible]="modalVisible()"
      [animal]="selectedAnimal()"
      (onClose)="closeModal()"
      (onSubmit)="submitAdoption($event)" />
  `,
  styles: [`
    .hero {
      display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 72px);
    }
    .hero-left {
      background: var(--cream-warm);
      display: flex; align-items: center; justify-content: center;
      padding: 4rem 3rem;
    }
    .hero-left-inner { max-width: 460px; }
    .tag {
      display: inline-block; background: var(--teal-light); color: var(--teal-dark);
      font-size: 11px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; padding: 4px 14px; border-radius: 99px; margin-bottom: 1rem;
    }
    h1 {
      font-family: 'Lora', serif; font-size: clamp(2rem, 3.5vw, 3rem);
      color: var(--forest); line-height: 1.2; margin-bottom: 1rem;
    }
    h1 em { font-style: italic; color: var(--teal-dark); }
    p { color: var(--muted); font-size: 15px; line-height: 1.85; margin-bottom: 2rem; }
    .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero-stats {
      display: flex; gap: 2rem; margin-top: 2.5rem;
      padding-top: 2rem; border-top: 1.5px solid var(--border);
    }
    .stat-num   { font-family: 'Lora', serif; font-size: 1.7rem; color: var(--teal); font-weight: 600; }
    .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .hero-right {
      background: var(--teal);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem; position: relative; overflow: hidden;
    }
    .hero-right::before {
      content: ''; position: absolute; width: 340px; height: 340px;
      border-radius: 50%; background: rgba(46,74,46,0.05); top: -80px; right: -80px;
    }
    .hero-pet-icon {
      width: 160px; height: 160px; background: rgba(46,74,46,0.1);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 6rem; margin-bottom: 2rem; position: relative; z-index: 1;
      border: 3px solid rgba(46,74,46,0.2);
    }
    .hero-nav-list {
      list-style: none; width: 100%; max-width: 280px; position: relative; z-index: 1;
    }
    .hero-nav-list li { border-bottom: 1px solid rgba(46,74,46,0.15); }
    .hero-nav-list li:last-child { border-bottom: none; }
    .hero-nav-list a {
      display: block; color: var(--teal-dark); text-decoration: none;
      font-size: 15px; font-weight: 600; padding: 0.85rem 1rem;
      transition: background 0.2s, padding-left 0.2s; border-radius: var(--r-sm);
    }
    .hero-nav-list a:hover { background: rgba(46,74,46,0.08); padding-left: 1.5rem; }

    .spin-lg {
      width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4);
      border-top-color: var(--teal-dark); border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 3rem auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .roles-section { background: white; border-top: 1px solid var(--border); padding: 4rem 2rem; }
    .roles-inner   { max-width: 1200px; margin: 0 auto; }

    .profile-banner {
      background: var(--rose-light); border-radius: var(--r); padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
      border: 1.5px solid rgba(247,184,208,0.5);
    }
    .profile-avatar {
      width: 52px; height: 52px; background: var(--rose); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 1.1rem; flex-shrink: 0;
    }
    .profile-name { font-weight: 700; font-size: 1rem; color: var(--forest); }
    .profile-sub  { font-size: 13px; color: var(--muted); }
    .profile-action { margin-left: auto; }

    .roles-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;
    }
    .role-card {
      background: var(--cream); border-radius: var(--r); border: 1.5px solid var(--border);
      padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; display: block;
    }
    .role-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .role-card h3 { font-weight: 800; font-size: 1rem; color: var(--forest); margin-bottom: 0.4rem; }
    .role-card p  { font-size: 12.5px; color: var(--muted); line-height: 1.6; margin-bottom: 1rem; }

    .role-icon {
      width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; margin-bottom: 1rem;
    }
    .role-icon-teal   { background: var(--teal-light); }
    .role-icon-rose   { background: var(--rose-light); }
    .role-icon-forest { background: #E8F0EB; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-right { min-height: 50vw; }
      .hero-nav-list { display: none; }
    }
    @media (max-width: 580px) {
      .hero-left { padding: 3rem 1.5rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private animalSvc   = inject(AnimalService);
  private adoptionSvc = inject(AdoptionService);
  private toast       = inject(ToastService);
  auth                = inject(AuthService);

  animals        = signal<Animal[]>([]);
  loading        = signal(true);
  availableCount = signal(0);
  adoptedCount   = signal(0);
  modalVisible   = signal(false);
  selectedAnimal = signal<Animal | null>(null);

  @ViewChild('adoptModal') adoptModal?: AdoptModalComponent;

  ngOnInit(): void {
    this.animalSvc.list({ status: 'DISPONIVEL' }).subscribe({
      next: (a: any) => {
        this.animals.set(a.slice(0, 6));
        this.availableCount.set(a.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar os animais. Verifique se o servidor Java está rodando.');
      }
    });

    this.animalSvc.list({ status: 'ADOTADO' }).subscribe({
      next: (a: any) => this.adoptedCount.set(a.length),
      error: () => {}
    });
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
        this.toast.success('Solicitação de adoção enviada com sucesso! 🐾');
        this.closeModal();
      },
      error: (err: any) => {
        this.toast.handleError(err);
        this.adoptModal?.setLoading(false);
      }
    });
  }
}
