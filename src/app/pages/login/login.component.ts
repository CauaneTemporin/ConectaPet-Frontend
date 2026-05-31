import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OngService } from '../../core/services/api.services';
import { OngContextService } from '../../core/services/ong-context.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-overlay page-enter">

      <!-- LEFT: form -->
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo">
            <div class="icon-ring">🐾</div>
            <h2>Conecta PET</h2>
            <p>Acesse sua conta</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab" [class.active]="tab() === 'login'"    (click)="tab.set('login')">Entrar</button>
            <button class="auth-tab" [class.active]="tab() === 'register'" (click)="tab.set('register')">Criar conta</button>
          </div>

          <!-- LOGIN -->
          @if (tab() === 'login') {
            <div>
              <label class="form-label-forest">Login:</label>
              <input class="form-input-underline" type="email"    [(ngModel)]="loginEmail" placeholder="seu@email.com">
              <label class="form-label-forest">Senha:</label>
              <input class="form-input-underline" type="password" [(ngModel)]="loginPw"    placeholder="••••••••">

              <div class="login-actions">
                <a routerLink="/" class="btn btn-outline-teal">Pular</a>
                <button class="btn btn-forest" (click)="doLogin()" [disabled]="loading()">
                  @if (loading()) { <span class="spin"></span> } Entra
                </button>
              </div>
            </div>
          }

          <!-- REGISTER -->
          @if (tab() === 'register') {
            <div>
              <div class="two-cols">
                <div>
                  <label class="form-label-forest">Nome:</label>
                  <input class="form-input-underline" type="text" [(ngModel)]="regName" placeholder="Nome">
                </div>
                <div>
                  <label class="form-label-forest">Sobrenome:</label>
                  <input class="form-input-underline" type="text" [(ngModel)]="regLast" placeholder="Sobrenome">
                </div>
              </div>
              <label class="form-label-forest">Login:</label>
              <input class="form-input-underline" type="email"    [(ngModel)]="regEmail"   placeholder="seu@email.com">
              <label class="form-label-forest">Senha:</label>
              <input class="form-input-underline" type="password" [(ngModel)]="regPw"      placeholder="Mínimo 6 caracteres">
              <label class="form-label-forest">Telefone:</label>
              <input class="form-input-underline" type="text"     [(ngModel)]="regPhone"   placeholder="(11) 98765-4321">
              <label class="form-label-forest">CPF:</label>
              <input class="form-input-underline" type="text"     [(ngModel)]="regCpf"     placeholder="000.000.000-00">
              <label class="form-label-forest">Endereço:</label>
              <input class="form-input-underline" type="text"     [(ngModel)]="regAddress" placeholder="Rua das Flores, 123">

              <button class="btn btn-teal btn-full" style="padding:.7rem" (click)="doRegister()" [disabled]="loading()">
                @if (loading()) { <span class="spin"></span> } Criar conta gratuita
              </button>
            </div>
          }
        </div>

        <div class="ong-register-link">
          <span>Representa uma ONG?</span>
          <a routerLink="/registrar-ong">Cadastre sua organização →</a>
        </div>
      </div>

      <!-- RIGHT: features panel -->
      <div class="login-right">
        <div class="login-right-content">
          <h3>Sua jornada começa aqui</h3>
          <p>Com sua conta você acompanha adoções, gerencia doações, agenda visitas e muito mais.</p>
          <div class="login-feature"><div class="feat-icon">🐾</div><div><strong>Adoção facilitada</strong><span>Acompanhe todo o processo</span></div></div>
          <div class="login-feature"><div class="feat-icon">♥</div><div><strong>Histórico de doações</strong><span>Veja o impacto de cada contribuição</span></div></div>
          <div class="login-feature"><div class="feat-icon">⭐</div><div><strong>Seja padrinho</strong><span>Apadrinhe seu pet no abrigo</span></div></div>
          <div class="login-feature"><div class="feat-icon">🙋</div><div><strong>Voluntariado</strong><span>Gerencie suas atividades</span></div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-overlay {
      background: var(--forest);
      min-height: calc(100vh - 72px);
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .login-left {
      background: var(--cream-warm);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem; gap: 1.25rem;
    }

    .ong-register-link {
      width: 100%; max-width: 380px;
      text-align: center; font-size: 13px;
      span { color: var(--muted); }
      a { color: var(--teal-dark); font-weight: 700; text-decoration: none; margin-left: 6px;
          &:hover { text-decoration: underline; } }
    }

    .login-card {
      background: var(--teal-light);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%; max-width: 380px;
      border: 1px solid rgba(168,216,168,0.4);
    }

    .login-logo {
      text-align: center; margin-bottom: 2rem;
      display: flex; flex-direction: column; align-items: center; gap: 10px;

      .icon-ring {
        width: 64px; height: 64px;
        background: var(--forest);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.8rem;
      }
      h2 { font-family: 'Lora', serif; font-size: 1.3rem; color: var(--forest); }
      p  { font-size: 13.5px; color: var(--muted); }
    }

    .return-note {
      background: rgba(168,216,168,0.25);
      border: 1px solid rgba(168,216,168,0.5);
      border-radius: 10px;
      padding: .65rem 1rem;
      font-size: 13px;
      color: var(--forest);
      margin-bottom: 1rem;
      text-align: center;
    }

    .auth-tabs {
      display: flex;
      background: rgba(0,0,0,0.06);
      border-radius: 99px;
      padding: 4px;
      margin-bottom: 1.75rem;
    }

    .auth-tab {
      flex: 1; text-align: center;
      padding: 0.45rem;
      border-radius: 99px;
      font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
      border: none; background: transparent;
      font-family: 'Nunito', sans-serif;
      color: var(--muted);

      &.active { background: var(--teal); color: var(--teal-dark); }
    }

    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    .login-actions { display: flex; gap: 12px; margin-top: 1rem; .btn { flex: 1; justify-content: center; } }

    .login-right {
      display: flex; align-items: center; justify-content: center;
      padding: 3rem;
    }

    .login-right-content {
      max-width: 360px; color: white;

      h3 { font-family: 'Lora', serif; font-size: 1.6rem; margin-bottom: 1rem; line-height: 1.3; }
      p  { font-size: 14px; line-height: 1.85; color: rgba(255,255,255,0.75); margin-bottom: 1.5rem; }
    }

    .login-feature {
      display: flex; align-items: center; gap: 12px;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);

      &:last-child { border-bottom: none; }

      strong { display: block; font-size: 14px; }
      span   { font-size: 12px; color: rgba(255,255,255,0.65); }
    }

    .feat-icon {
      width: 40px; height: 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; flex-shrink: 0;
    }

    .spin {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,0.15);
      border-top-color: currentColor; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .login-overlay { grid-template-columns: 1fr; }
      .login-right   { display: none; }
    }
  `]
})
export class LoginComponent {
  private authSvc = inject(AuthService);
  private ongSvc  = inject(OngService);
  private ongCtx  = inject(OngContextService);
  private toast   = inject(ToastService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  tab     = signal<'login' | 'register'>('login');
  loading = signal(false);

  returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

  // Login fields
  loginEmail = ''; loginPw = '';

  // Register fields
  regName = ''; regLast = ''; regEmail = ''; regPw = '';
  regPhone = ''; regCpf = ''; regAddress = '';

  doLogin(): void {
    if (!this.loginEmail || !this.loginPw) { this.toast.error('Preencha e-mail e senha.'); return; }
    this.loading.set(true);
    this.authSvc.login({ email: this.loginEmail, password: this.loginPw }).subscribe({
      next: (res: any) => {
        this.toast.success(`Bem-vindo, ${res.user.name.split(' ')[0]}! 🐾`);
        this.autoSelectOngAndNavigate();
      },
      error: (err: any) => { this.toast.handleError(err, 'E-mail ou senha incorretos.'); this.loading.set(false); }
    });
  }

  doRegister(): void {
    const name = `${this.regName} ${this.regLast}`.trim();
    if (!name || !this.regEmail || !this.regPw) { this.toast.error('Preencha todos os campos.'); return; }
    if (this.regPw.length < 6) { this.toast.error('Senha deve ter no mínimo 6 caracteres.'); return; }
    this.loading.set(true);
    this.authSvc.register({ name, email: this.regEmail, password: this.regPw, phone: this.regPhone, cpf: this.regCpf, address: this.regAddress }).subscribe({
      next: () => { this.toast.success('Conta criada com sucesso! 🐾'); this.autoSelectOngAndNavigate(); },
      error: (err: any) => { this.toast.handleError(err); this.loading.set(false); }
    });
  }

  private autoSelectOngAndNavigate(): void {
    this.ongSvc.minhasOngs().subscribe({
      next: (lista) => {
        if (lista.length > 0 && !this.ongCtx.hasOng()) {
          this.ongCtx.selectOng(lista[0]);
        }
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => this.router.navigateByUrl(this.returnUrl)
    });
  }
}
