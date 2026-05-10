import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard-wrap page-enter">

      <div class="dash-sidebar">
        <h2>Painel</h2>

        <a class="dash-nav-btn" routerLink="visao-geral"     routerLinkActive="active">📊 Visão Geral</a>
        <a class="dash-nav-btn" routerLink="minhas-adocoes"   routerLinkActive="active">🏠 Minhas Adoções</a>
        <a class="dash-nav-btn" routerLink="minhas-doacoes"   routerLinkActive="active">♥ Minhas Doações</a>
        <a class="dash-nav-btn" routerLink="meus-afilhados"   routerLinkActive="active">⭐ Meus Afilhados</a>
        <a class="dash-nav-btn" routerLink="meu-voluntariado" routerLinkActive="active">🙋 Voluntariado</a>

        @if (auth.isAdmin()) {
          <div class="dash-divider"></div>
          <a class="dash-nav-btn" routerLink="admin/animais"     routerLinkActive="active">🐾 Gerenciar Animais</a>
          <a class="dash-nav-btn" routerLink="admin/adocoes"     routerLinkActive="active">📋 Solicitações</a>
          <a class="dash-nav-btn" routerLink="admin/doacoes"     routerLinkActive="active">💰 Doações</a>
          <a class="dash-nav-btn" routerLink="admin/mensagens"   routerLinkActive="active">✉️ Mensagens</a>
          <a class="dash-nav-btn" routerLink="admin/voluntarios"     routerLinkActive="active">🤝 Voluntários</a>
          <a class="dash-nav-btn" routerLink="admin/apadrinhamentos" routerLinkActive="active">⭐ Apadrinhamentos</a>
          <a class="dash-nav-btn" routerLink="admin/ocorrencias"     routerLinkActive="active">🚨 Ocorrências</a>
          <a class="dash-nav-btn" routerLink="admin/visitas"         routerLinkActive="active">📅 Visitas</a>
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
      padding: 2rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 4px;

      h2 {
        font-family: 'Lora', serif;
        font-size: 1rem;
        color: rgba(255,255,255,0.5);
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
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
      }
      .dash-nav-btn { flex: 0 1 auto; font-size: 12px; padding: 0.4rem 0.75rem; }
      .dash-spacer  { display: none; }
    }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
