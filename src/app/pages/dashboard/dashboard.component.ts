import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OngContextService } from '../../core/services/ong-context.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard-wrap page-enter">

      <div class="dash-sidebar">

        <!-- ONG context bar -->
        @if (ongCtx.hasOng()) {
          <div class="ong-context-bar">
            <div class="ong-context-logo">🐾</div>
            <div class="ong-context-info">
              <span class="ong-context-name">{{ ongCtx.selectedOng()!.nomeFantasia }}</span>
              <span class="ong-context-loc">{{ ongCtx.selectedOng()!.cidade }}, {{ ongCtx.selectedOng()!.estado }}</span>
            </div>
            <button class="ong-change-btn" (click)="trocarOng()" title="Trocar ONG">⇄</button>
          </div>
        }

        <h2>Painel</h2>

        @if (!auth.isAdmin() && !ongCtx.isOngAdmin()) {
          <a class="dash-nav-btn" routerLink="visao-geral"      routerLinkActive="active">📊 Visão Geral</a>
          <a class="dash-nav-btn" routerLink="minhas-adocoes"   routerLinkActive="active">🏠 Minhas Adoções</a>
          <a class="dash-nav-btn" routerLink="minhas-doacoes"   routerLinkActive="active">♥ Minhas Doações</a>
          <a class="dash-nav-btn" routerLink="meus-afilhados"   routerLinkActive="active">⭐ Meus Afilhados</a>
          <a class="dash-nav-btn" routerLink="meu-voluntariado" routerLinkActive="active">🙋 Voluntariado</a>
          <a class="dash-nav-btn" routerLink="minhas-denuncias" routerLinkActive="active">🚨 Minhas Ocorrências</a>
        }

        @if (ongCtx.hasOng()) {
            <div class="dash-divider"></div>
            <span class="dash-section-label">Minha ONG</span>
            <a class="dash-nav-btn" routerLink="ong/membros" routerLinkActive="active">👥 Membros</a>
        }

        @if (auth.isGestorOrAdmin()) {
          <div class="dash-divider"></div>
          <span class="dash-section-label">Gestor Público</span>
          <a class="dash-nav-btn" routerLink="gestor/denuncias" routerLinkActive="active">📋 Denúncias</a>
        }

        @if (auth.isAdmin() || ongCtx.isOngAdmin()) {
          <div class="dash-divider"></div>
          <span class="dash-section-label">Administração</span>
          <a class="dash-nav-btn" routerLink="admin/animais"         routerLinkActive="active">🐾 Gerenciar Animais</a>
          <a class="dash-nav-btn" routerLink="admin/adocoes"         routerLinkActive="active">📋 Adoção</a>
          <a class="dash-nav-btn" routerLink="admin/doacoes"         routerLinkActive="active">💰 Doações</a>
          <a class="dash-nav-btn" routerLink="admin/mensagens"       routerLinkActive="active">✉️ Mensagens</a>
          <a class="dash-nav-btn" routerLink="admin/voluntarios"     routerLinkActive="active">🤝 Voluntários</a>
          <a class="dash-nav-btn" routerLink="admin/apadrinhamentos" routerLinkActive="active">⭐ Apadrinhamentos</a>
          <a class="dash-nav-btn" routerLink="admin/ocorrencias"     routerLinkActive="active">🚨 Ocorrências</a>
          <a class="dash-nav-btn" routerLink="admin/visitas"         routerLinkActive="active">📅 Visitas</a>

          <a class="dash-nav-btn" routerLink="admin/configuracoes"   routerLinkActive="active">💰 Configurações Pix</a>
        }

        <div class="dash-spacer"></div>
        <button class="dash-nav-btn logout" (click)="auth.logout()">🚪 Sair</button>
      </div>

      <div class="dash-main">
        <router-outlet />
      </div>

    </div>
  `,
  styles: [`
    .dashboard-wrap {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: calc(100vh - 72px);
    }

    .dash-sidebar {
      background: var(--forest);
      padding: 0 1.25rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 4px;

      h2 {
        font-family: 'Lora', serif;
        font-size: 1rem;
        color: rgba(255,255,255,0.5);
        margin-bottom: 1rem;
        padding: 1.5rem 0 .75rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
    }

    .ong-context-bar {
      display: flex; align-items: center; gap: 8px;
      background: rgba(168,216,168,0.12);
      border-bottom: 1px solid rgba(168,216,168,0.15);
      padding: 10px 4px;
      margin: 0 -1.25rem;
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
    .ong-context-logo {
      width: 30px; height: 30px; background: rgba(168,216,168,0.2);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0;
    }
    .ong-context-info { flex: 1; min-width: 0; }
    .ong-context-name {
      display: block; color: white; font-size: 12px; font-weight: 700;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ong-context-loc {
      display: block; color: rgba(255,255,255,0.45); font-size: 10px; margin-top: 1px;
    }
    .ong-change-btn {
      background: none; border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer;
      border-radius: 6px; padding: 2px 6px; flex-shrink: 0;
      transition: all .2s;
      &:hover { background: rgba(255,255,255,0.1); color: white; }
    }

    .dash-nav-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      padding: 0.65rem 1rem;
      border-radius: var(--r-sm);
      text-align: left;
      font-family: 'Nunito', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      text-decoration: none;

      &:hover, &.active { background: rgba(255,255,255,0.12); color: white; }
      &.logout          { color: rgba(255,100,100,0.8); margin-top: 0; }
    }

    .dash-divider {
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 0.75rem 0;
    }

    .dash-section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: rgba(255,255,255,0.35);
      padding: 0 1rem;
      margin-bottom: 2px;
    }

    .dash-spacer { flex: 1; }

    .dash-main {
      padding: 2.5rem;
      overflow: auto;
      background: var(--cream);
    }

    @media (max-width: 900px) {
      .dashboard-wrap { grid-template-columns: 1fr; }
      .dash-sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        padding: 1rem;
        h2 { display: none; }
        .ong-context-bar { display: none; }
      }
      .dash-nav-btn { flex: 0 1 auto; font-size: 12px; padding: 0.4rem 0.75rem; }
      .dash-spacer  { display: none; }
    }
  `]
})
export class DashboardComponent {
  auth   = inject(AuthService);
  ongCtx = inject(OngContextService);
  private router = inject(Router);

  trocarOng(): void {
    this.ongCtx.clearOng();
    this.router.navigate(['/']);
  }
}
