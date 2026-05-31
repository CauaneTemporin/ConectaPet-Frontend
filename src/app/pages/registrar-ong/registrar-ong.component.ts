import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OngService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { OngContextService } from '../../core/services/ong-context.service';
import { ToastService } from '../../core/services/toast.service';
import { CriarOngRequest } from '../../shared/models';

@Component({
  selector: 'app-registrar-ong',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-enter reg-page">

      <div class="reg-header">
        <a routerLink="/" class="back-link">← Voltar</a>
        <div class="reg-title-wrap">
          <div class="reg-icon">🏢</div>
          <div>
            <h1>Registrar ONG</h1>
            <p>Cadastre sua organização na plataforma Conecta PET.</p>
          </div>
        </div>
      </div>

      @if (sucesso()) {
        <div class="success-card">
          <div class="success-icon">✅</div>
          <h2>ONG cadastrada com sucesso!</h2>
          <p>Sua organização já está ativa na plataforma Conecta PET.</p>
          <a routerLink="/" class="btn btn-teal">Voltar para o início</a>
        </div>
      } @else {
        <div class="form-card">

          @if (!auth.isLoggedIn()) {
            <h2 class="form-section-title">Dados do Responsável</h2>
            <p class="section-desc">Crie sua conta de administrador da ONG.</p>

            <div class="form-grid">
              <div class="form-field full">
                <label class="form-label">Nome completo *</label>
                <input class="form-input" type="text" [(ngModel)]="adminNome" placeholder="Seu nome completo" />
              </div>

              <div class="form-field">
                <label class="form-label">E-mail de acesso *</label>
                <input class="form-input" type="email" [(ngModel)]="adminEmail" placeholder="seu@email.com" />
              </div>

              <div class="form-field">
                <label class="form-label">Senha *</label>
                <input class="form-input" type="password" [(ngModel)]="adminSenha" placeholder="Mínimo 6 caracteres" />
              </div>

              <div class="form-field full">
                <label class="form-label">Confirmar senha *</label>
                <input class="form-input" type="password" [(ngModel)]="adminSenhaConfirm" placeholder="Repita a senha" />
              </div>
            </div>

            <div class="section-divider"></div>
          }

          <h2 class="form-section-title">Dados da Organização</h2>

          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">CNPJ *</label>
              <input class="form-input" type="text" [(ngModel)]="form.cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX" maxlength="18"
                (input)="maskCnpj($event)" />
            </div>

            <div class="form-field">
              <label class="form-label">E-mail da ONG *</label>
              <input class="form-input" type="email" [(ngModel)]="form.email"
                placeholder="contato@suaong.org.br" />
            </div>

            <div class="form-field full">
              <label class="form-label">Razão Social *</label>
              <input class="form-input" type="text" [(ngModel)]="form.razaoSocial"
                placeholder="Razão social conforme CNPJ" />
            </div>

            <div class="form-field full">
              <label class="form-label">Nome Fantasia *</label>
              <input class="form-input" type="text" [(ngModel)]="form.nomeFantasia"
                placeholder="Nome pelo qual a ONG é conhecida" />
            </div>

            <div class="form-field">
              <label class="form-label">Cidade *</label>
              <input class="form-input" type="text" [(ngModel)]="form.cidade"
                placeholder="São Paulo" />
            </div>

            <div class="form-field">
              <label class="form-label">Estado *</label>
              <select class="form-input" [(ngModel)]="form.estado">
                <option value="">Selecione...</option>
                @for (uf of ufs; track uf) {
                  <option [value]="uf">{{ uf }}</option>
                }
              </select>
            </div>

            <div class="form-field">
              <label class="form-label">Telefone</label>
              <input class="form-input" type="text" [(ngModel)]="form.telefone"
                placeholder="(11) 99999-9999" />
            </div>

            <div class="form-field">
              <label class="form-label">Endereço</label>
              <input class="form-input" type="text" [(ngModel)]="form.endereco"
                placeholder="Rua, número, bairro" />
            </div>

            <div class="form-field full">
              <label class="form-label">Descrição</label>
              <textarea class="form-input" [(ngModel)]="form.descricao" rows="4"
                placeholder="Conte sobre a missão e os trabalhos da sua ONG..."></textarea>
            </div>
          </div>

          <div class="form-info">
            <span class="info-icon">ℹ️</span>
            Campos marcados com <strong>*</strong> são obrigatórios.
          </div>

          <div class="form-actions">
            <a routerLink="/" class="btn btn-outline-teal">Cancelar</a>
            <button class="btn btn-teal" (click)="submit()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> }
              Registrar ONG
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .reg-page {
      max-width: 780px; margin: 0 auto; padding: 3rem 1.5rem;
    }
    .reg-header { margin-bottom: 2rem; }
    .back-link {
      display: inline-block; color: var(--muted); font-size: 13px; text-decoration: none;
      margin-bottom: 1.25rem;
      &:hover { color: var(--forest); }
    }
    .reg-title-wrap {
      display: flex; gap: 1rem; align-items: flex-start;
    }
    .reg-icon {
      width: 56px; height: 56px; border-radius: 14px; background: var(--teal-light);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; flex-shrink: 0;
    }
    .reg-title-wrap h1 {
      font-family: 'Lora', serif; font-size: 1.6rem; color: var(--forest); margin-bottom: .25rem;
    }
    .reg-title-wrap p { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }

    .success-card {
      background: white; border-radius: var(--r); border: 1.5px solid #d1fae5;
      padding: 3rem 2rem; text-align: center;
      .success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
      h2 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .75rem; }
      p  { color: var(--muted); font-size: 14px; line-height: 1.7; margin-bottom: 1.75rem; }
    }

    .form-card {
      background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 2rem;
    }
    .form-section-title {
      font-family: 'Lora', serif; color: var(--forest); font-size: 1.15rem; margin-bottom: .4rem;
      padding-bottom: .75rem; border-bottom: 1.5px solid var(--border);
    }
    .section-desc {
      font-size: 13px; color: var(--muted); margin-bottom: 1.25rem; margin-top: .5rem;
    }
    .section-divider {
      border-top: 1.5px solid var(--border); margin: 1.75rem 0;
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;
    }
    .form-field { display: flex; flex-direction: column; }
    .form-field.full { grid-column: 1 / -1; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--forest); margin-bottom: 5px; }
    .form-input {
      padding: .6rem .85rem; border: 1.5px solid var(--border); border-radius: var(--r-sm);
      font-family: 'Nunito', sans-serif; font-size: 14px; background: white;
      resize: vertical; box-sizing: border-box;
      &:focus { outline: none; border-color: var(--teal); }
    }

    .form-info {
      background: #eff6ff; border-radius: var(--r-sm); padding: .75rem 1rem;
      font-size: 13px; color: #374151; line-height: 1.6; margin-bottom: 1.5rem;
      display: flex; gap: .5rem; align-items: flex-start;
      .info-icon { flex-shrink: 0; }
    }

    .form-actions { display: flex; gap: 10px; justify-content: flex-end; }

    .spin-inline {
      display: inline-block; width: 12px; height: 12px;
      border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor;
      border-radius: 50%; animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 580px) {
      .reg-page { padding: 2rem 1rem; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RegistrarOngComponent {
  private ongSvc  = inject(OngService);
  private ongCtx  = inject(OngContextService);
  private router  = inject(Router);
  auth            = inject(AuthService);
  private toast   = inject(ToastService);

  saving  = signal(false);
  sucesso = signal(false);

  adminNome         = '';
  adminEmail        = '';
  adminSenha        = '';
  adminSenhaConfirm = '';

  form: CriarOngRequest = {
    cnpj: '', razaoSocial: '', nomeFantasia: '',
    email: '', cidade: '', estado: '',
    telefone: '', endereco: '', descricao: ''
  };

  readonly ufs = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  maskCnpj(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
    input.value = v;
    this.form.cnpj = v;
  }

  submit(): void {
    const { cnpj, razaoSocial, nomeFantasia, email, cidade, estado } = this.form;
    if (!cnpj || !razaoSocial || !nomeFantasia || !email || !cidade || !estado) {
      this.toast.error('Preencha todos os campos obrigatórios da ONG.');
      return;
    }

    const payload: CriarOngRequest = {
      cnpj, razaoSocial, nomeFantasia, email, cidade, estado,
      telefone:  this.form.telefone?.trim()  || undefined,
      endereco:  this.form.endereco?.trim()  || undefined,
      descricao: this.form.descricao?.trim() || undefined
    };

    this.saving.set(true);

    if (this.auth.isLoggedIn()) {
      this.criarOng(payload);
    } else {
      this.registrarECriar(payload);
    }
  }

  private criarOng(payload: CriarOngRequest): void {
    this.ongSvc.criar(payload).subscribe({
      next: (ong) => {
        this.saving.set(false);
        this.ongSvc.minhasOngs().subscribe({
          next: (lista) => {
            const criada = lista.find(o => o.id === ong.id) ?? lista[0];
            if (criada) this.ongCtx.selectOng(criada);
            this.router.navigate(['/dashboard']);
          },
          error: () => this.router.navigate(['/dashboard'])
        });
      },
      error: (err: any) => { this.toast.handleError(err, 'Erro ao registrar ONG.'); this.saving.set(false); }
    });
  }

  private registrarECriar(payload: CriarOngRequest): void {
    if (!this.adminNome || !this.adminEmail || !this.adminSenha) {
      this.toast.error('Preencha todos os campos do responsável.');
      this.saving.set(false);
      return;
    }
    if (this.adminSenha.length < 6) {
      this.toast.error('A senha deve ter no mínimo 6 caracteres.');
      this.saving.set(false);
      return;
    }
    if (this.adminSenha !== this.adminSenhaConfirm) {
      this.toast.error('As senhas não coincidem.');
      this.saving.set(false);
      return;
    }

    this.auth.register({ name: this.adminNome, email: this.adminEmail, password: this.adminSenha }).subscribe({
      next: () => this.criarOng(payload),
      error: (err: any) => { this.toast.handleError(err, 'Erro ao criar conta.'); this.saving.set(false); }
    });
  }
}
