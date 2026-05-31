import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OngService } from '../../core/services/api.services';
import { OngContextService } from '../../core/services/ong-context.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OngResumo } from '../../shared/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-enter">

      <!-- HERO -->
      <div class="hero">
        <div class="hero-left">
          <div class="hero-left-inner">
            <div class="tag">🐾 Conectando corações</div>
            <h1>Animais que precisam de um lar <em>cheio de amor</em></h1>
            <p>A Conecta PET une ONGs, adotantes e voluntários em uma única plataforma. Selecione uma ONG parceira para começar.</p>
            <div class="hero-ctas">
              <a href="#ongs" class="btn btn-teal">Ver ONGs parceiras 🐾</a>
              <a routerLink="/registrar-ong" class="btn btn-outline-teal">Registrar minha ONG</a>
            </div>
            <div class="hero-stats">
              <div>
                <div class="stat-num">{{ ongs().length > 0 ? ongs().length : '–' }}</div>
                <div class="stat-label">ONGs ativas</div>
              </div>
              <div>
                <div class="stat-num">420+</div>
                <div class="stat-label">Parceiros</div>
              </div>
              <div>
                <div class="stat-num">7k+</div>
                <div class="stat-label">Voluntários</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="hero-pet-icon">🐾</div>
          <div class="hero-right-content">
            <h3>Como funciona</h3>
            <div class="step"><div class="step-num">1</div><div><strong>Selecione uma ONG</strong><span>Encontre a organização mais próxima de você</span></div></div>
            <div class="step"><div class="step-num">2</div><div><strong>Acesse os serviços</strong><span>Adote, doe, seja voluntário ou padrinho</span></div></div>
            <div class="step"><div class="step-num">3</div><div><strong>Acompanhe tudo</strong><span>Gerencie adoções e doações no seu painel</span></div></div>
          </div>
          @if (!auth.isLoggedIn()) {
            <a routerLink="/login" class="btn btn-forest btn-full">Entrar / Cadastrar</a>
          } @else {
            <a routerLink="/dashboard" class="btn btn-forest btn-full">Acessar meu painel</a>
          }
        </div>
      </div>

      <!-- ONG DIRECTORY -->
      <section class="ong-directory" id="ongs">
        <div class="dir-header">
          <div>
            <h2>ONGs Parceiras</h2>
            <p>Selecione uma ONG para acessar seus serviços</p>
          </div>
          <a routerLink="/registrar-ong" class="btn btn-outline-teal">+ Registrar ONG</a>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <div class="spin-lg"></div>
            <p>Carregando ONGs...</p>
          </div>
        } @else if (ongs().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🏢</div>
            <h3>Nenhuma ONG cadastrada ainda</h3>
            <p>Seja a primeira a registrar sua ONG na plataforma Conecta PET!</p>
            <a routerLink="/registrar-ong" class="btn btn-teal">Registrar minha ONG</a>
          </div>
        } @else {
          <div class="ong-grid">
            @for (ong of ongs(); track ong.id) {
              <div class="ong-card">
                <div class="ong-logo">
                  @if (ong.logoUrl) {
                    <img [src]="ong.logoUrl" [alt]="ong.nomeFantasia" />
                  } @else {
                    <div class="ong-logo-placeholder">🐾</div>
                  }
                </div>
                <div class="ong-body">
                  <h3>{{ ong.nomeFantasia }}</h3>
                  <p class="ong-razao">{{ ong.razaoSocial }}</p>
                  <p class="ong-location">📍 {{ ong.cidade }}, {{ ong.estado }}</p>
                  @if (ong.descricao) {
                    <p class="ong-desc">{{ ong.descricao }}</p>
                  }
                  @if (ong.totalAnimais != null) {
                    <div class="ong-stat">🐾 {{ ong.totalAnimais }} animais disponíveis</div>
                  }
                </div>
                <button class="btn btn-teal btn-full" (click)="selecionar(ong)">Acessar ONG</button>
              </div>
            }
          </div>
        }
      </section>

    </div>
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
    .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 0; }
    .hero-stats {
      display: flex; gap: 2rem; margin-top: 2.5rem;
      padding-top: 2rem; border-top: 1.5px solid var(--border);
    }
    .stat-num   { font-family: 'Lora', serif; font-size: 1.7rem; color: var(--teal); font-weight: 600; }
    .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

    .hero-right {
      background: var(--forest);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem; gap: 1.5rem;
    }
    .hero-pet-icon {
      width: 100px; height: 100px; background: rgba(168,216,168,0.15);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 3.5rem; border: 2px solid rgba(168,216,168,0.2);
    }
    .hero-right-content { width: 100%; max-width: 320px; }
    .hero-right-content h3 {
      font-family: 'Lora', serif; color: white; font-size: 1.2rem;
      margin-bottom: 1.25rem; text-align: center;
    }
    .step {
      display: flex; gap: 14px; align-items: flex-start;
      padding: .9rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .step:last-child { border-bottom: none; }
    .step-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--teal); color: var(--forest);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; flex-shrink: 0;
    }
    .step strong { display: block; color: white; font-size: 13.5px; }
    .step span   { display: block; color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 2px; }
    .btn-full { width: 100%; max-width: 320px; justify-content: center; }

    .ong-directory {
      padding: 4rem 2rem;
      background: var(--cream);
    }
    .dir-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      max-width: 1200px; margin: 0 auto 2.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .dir-header h2 {
      font-family: 'Lora', serif; font-size: 1.8rem; color: var(--forest); margin-bottom: .25rem;
    }
    .dir-header p { color: var(--muted); font-size: 14px; margin: 0; }

    .loading-state {
      text-align: center; padding: 4rem 2rem;
      p { margin-top: 1rem; color: var(--muted); }
    }
    .spin-lg {
      width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4);
      border-top-color: var(--teal-dark); border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center; padding: 5rem 2rem; max-width: 480px; margin: 0 auto;
      .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
      h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; }
      p  { color: var(--muted); margin-bottom: 1.5rem; }
    }

    .ong-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      max-width: 1200px; margin: 0 auto;
    }
    .ong-card {
      background: white; border-radius: var(--r); border: 1.5px solid var(--border);
      padding: 1.5rem; display: flex; flex-direction: column; gap: .75rem;
      transition: transform .2s, box-shadow .2s;
    }
    .ong-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }

    .ong-logo {
      width: 64px; height: 64px; border-radius: 14px;
      background: var(--teal-light); display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .ong-logo-placeholder { font-size: 2rem; }

    .ong-body { flex: 1; }
    .ong-body h3 { font-weight: 800; font-size: 1rem; color: var(--forest); margin-bottom: 2px; }
    .ong-razao   { font-size: 11px; color: var(--muted); margin-bottom: .5rem; }
    .ong-location{ font-size: 13px; color: var(--muted); margin-bottom: .5rem; }
    .ong-desc    { font-size: 13px; color: var(--text); line-height: 1.6; margin-bottom: .5rem;
                   display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .ong-stat    { font-size: 12px; color: var(--teal-dark); font-weight: 600; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-right { padding: 2.5rem 1.5rem; }
    }
    @media (max-width: 580px) {
      .hero-left { padding: 3rem 1.5rem; }
      .ong-directory { padding: 3rem 1rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private ongSvc  = inject(OngService);
  private ongCtx  = inject(OngContextService);
  private router  = inject(Router);
  private toast   = inject(ToastService);
  auth            = inject(AuthService);

  ongs    = signal<OngResumo[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.ongSvc.listar().subscribe({
      next: (list: any) => {
        this.ongs.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Não foi possível carregar as ONGs. Verifique se o servidor está rodando.');
      }
    });
  }

  selecionar(ong: OngResumo): void {
    this.ongCtx.selectOng(ong);
    this.router.navigate(['/dashboard']);
  }
}
