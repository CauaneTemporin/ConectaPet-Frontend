import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-brand-name">Conecta PET <span>Adoção &amp; Doação</span></div>
          <p>ONG dedicada a conectar animais abandonados a famílias amorosas em todo o Brasil.</p>
          <p class="cnpj">CNPJ 00.000.000/0001-00</p>
        </div>
        <div class="footer-col">
          <h4>Adoção</h4>
          <a routerLink="/animais">Ver animais</a>
          <a routerLink="/como-adotar">Como adotar</a>
          <a routerLink="/login">Minha conta</a>
        </div>
        <div class="footer-col">
          <h4>Apoiar</h4>
          <a routerLink="/como-doar">Fazer doação</a>
          <a routerLink="/seja-voluntario">Voluntário</a>
          <a routerLink="/seja-padrinho">Padrinho</a>
        </div>
        <div class="footer-col">
          <h4>Institucional</h4>
          <a routerLink="/quem-somos">Quem somos</a>
          <a routerLink="/contato">Contato</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Conecta PET. Todos os direitos reservados.</span>
        <span>Feito com ♥ pelos animais 🐾</span>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background: var(--forest);
      color: rgba(255,255,255,0.7);
      padding: 4rem 2rem 1.5rem;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 1.5rem;
    }

    .footer-brand-name {
      font-family: 'Lora', serif;
      font-size: 1.4rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.75rem;

      span {
        display: block;
        font-size: 0.65rem;
        font-weight: 400;
        color: var(--teal-mid);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-family: 'Nunito', sans-serif;
      }
    }

    .footer-brand p { font-size: 13.5px; line-height: 1.8; }
    .cnpj { font-size: 12.5px; margin-top: 0.6rem; }

    .footer-col {
      h4 {
        color: white;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 1rem;
      }

      a {
        display: block;
        font-size: 13.5px;
        margin-bottom: 0.5rem;
        color: rgba(255,255,255,0.6);
        text-decoration: none;
        transition: color 0.2s;

        &:hover { color: white; }
      }
    }

    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
    }

    @media (max-width: 900px) {
      .footer-inner { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 580px) {
      .footer-inner { grid-template-columns: 1fr; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
    }
  `]
})
export class FooterComponent {}
