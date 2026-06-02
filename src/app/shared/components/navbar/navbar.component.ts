import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { OngContextService } from '../../../core/services/ong-context.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav>
      <div class="nav-logo-area">
        <a routerLink="/" class="logo-link">
          <div class="logo-icon">🐾</div>
          <div class="logo-text">
            Conecta PET
            @if (ongCtx.selectedOng(); as ong) {
              <span>{{ ong.nomeFantasia }}</span>
            }
          </div>
        </a>
      </div>

      <div class="nav-links-area">
        <a routerLink="/"               routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Início</a>
        <a routerLink="/quem-somos"     routerLinkActive="active">Quem Somos</a>
        <a routerLink="/animais"        routerLinkActive="active">Adoção</a>
        <a routerLink="/como-doar"      routerLinkActive="active">Doações</a>
        <a routerLink="/seja-voluntario" routerLinkActive="active">Seja Voluntário</a>
        <a routerLink="/seja-padrinho"  routerLinkActive="active">Seja Padrinho</a>
        <a routerLink="/contato"        routerLinkActive="active">Fale Conosco</a>
        <a routerLink="/ocorrencias"    routerLinkActive="active">🚨 Denunciar</a>

        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="btn-login" routerLinkActive="active">
            {{ auth.getUserInitials() }} · Painel
          </a>
        } @else {
          <a routerLink="/login" class="btn-login">Entrar</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    nav {
      display: flex;
      align-items: stretch;
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 200;
    }

    .nav-logo-area {
      background: var(--cream-warm);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 2rem;
      min-width: 240px;
      border-bottom: 1px solid var(--border);
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: var(--teal);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .logo-text {
      font-family: 'Lora', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--forest);
      line-height: 1.1;

      span {
        display: block;
        font-size: 0.65rem;
        font-weight: 400;
        color: var(--teal-dark);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-family: 'Nunito', sans-serif;
      }
    }

    .nav-links-area {
      background: var(--teal);
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 1.5rem;
      gap: 2px;
      flex-wrap: wrap;

      a {
        color: var(--teal-dark);
        text-decoration: none;
        font-size: 13px;
        font-weight: 600;
        padding: 0.4rem 0.8rem;
        border-radius: 99px;
        transition: background 0.2s, color 0.2s;
        white-space: nowrap;

        &:hover, &.active {
          background: rgba(46,74,46,0.12);
          color: var(--teal-dark);
        }
      }

      .btn-login {
        background: white;
        color: var(--teal-dark);
        margin-left: 0.5rem;
        font-weight: 700;

        &:hover { background: var(--cream); }
        &.active { background: var(--cream); }
      }
    }

    @media (max-width: 768px) {
      .nav-logo-area { min-width: 0; padding: 0 1rem; }
      .nav-links-area a:not(.btn-login) { display: none; }
    }
  `]
})
export class NavbarComponent {
  auth   = inject(AuthService);
  ongCtx = inject(OngContextService);
}
