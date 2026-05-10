import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OccurrenceService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { OccurrenceType } from '../../shared/models';

@Component({
  selector: 'app-occurrence',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-enter">
      <div class="occ-hero">
        <div class="hero-icon">🚨</div>
        <h1>Registrar Ocorrência</h1>
        <p>Denuncie abandono ou maus-tratos de forma rápida e segura. Você pode se identificar ou permanecer anônimo.</p>
      </div>

      @if (sent()) {
        <div class="success-wrap">
          <div class="success-card">
            <div class="success-icon">✅</div>
            <h2>Ocorrência registrada!</h2>
            <p>Recebemos seu relato. Nossa equipe irá analisar e tomar as providências necessárias.</p>
            <div class="success-actions">
              <button class="btn btn-teal" (click)="reset()">Registrar outra</button>
              <a routerLink="/" class="btn btn-outline-teal">Voltar ao início</a>
            </div>
          </div>
        </div>
      } @else {
        <div class="section">
          <form class="occ-form" (ngSubmit)="submit()" #f="ngForm">

            <!-- Tipo -->
            <div class="form-section">
              <h3 class="form-section-title">Tipo de ocorrência</h3>
              <div class="type-grid">
                @for (opt of typeOptions; track opt.value) {
                  <button type="button" class="type-btn"
                    [class.selected]="form.type === opt.value"
                    (click)="form.type = opt.value">
                    <span class="type-icon">{{ opt.icon }}</span>
                    <span class="type-label">{{ opt.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Descrição -->
            <div class="form-section">
              <h3 class="form-section-title">Descrição <span class="required">*</span></h3>
              <textarea class="form-input" [(ngModel)]="form.description" name="description"
                placeholder="Descreva o que você viu com o máximo de detalhes possível: local, horário, condição do animal..."
                rows="5" required></textarea>
            </div>

            <!-- Endereço e animal -->
            <div class="form-section two-col">
              <div>
                <label class="form-label">Local da ocorrência</label>
                <input class="form-input" [(ngModel)]="form.address" name="address"
                  placeholder="Rua, bairro, cidade..." />
              </div>
              <div>
                <label class="form-label">Descrição do animal (se souber)</label>
                <input class="form-input" [(ngModel)]="form.animalDescription" name="animalDesc"
                  placeholder="Cor, porte, espécie..." />
              </div>
            </div>

            <!-- Identificação -->
            <div class="form-section">
              <h3 class="form-section-title">Sua identificação</h3>

              @if (auth.isLoggedIn()) {
                <div class="identity-toggle">
                  <button type="button" class="id-btn" [class.active]="!form.anonymous"
                    (click)="form.anonymous = false">
                    👤 Usar minha conta ({{ auth.currentUser()?.name }})
                  </button>
                  <button type="button" class="id-btn" [class.active]="form.anonymous"
                    (click)="form.anonymous = true">
                    🕵️ Permanecer anônimo
                  </button>
                </div>
                @if (!form.anonymous) {
                  <p class="id-note">Seu nome e e-mail serão vinculados à ocorrência internamente. Não serão exibidos publicamente.</p>
                }
              } @else {
                <p class="id-note">Você não está logado. Pode informar seus contatos opcionalmente ou deixar em branco para ser anônimo.</p>
                <div class="two-col">
                  <div>
                    <label class="form-label">Seu nome (opcional)</label>
                    <input class="form-input" [(ngModel)]="form.reporterName" name="reporterName"
                      placeholder="Nome completo" />
                  </div>
                  <div>
                    <label class="form-label">Seu e-mail (opcional)</label>
                    <input class="form-input" type="email" [(ngModel)]="form.reporterEmail" name="reporterEmail"
                      placeholder="para@email.com" />
                  </div>
                </div>
                <div class="anon-check">
                  <label class="check-label">
                    <input type="checkbox" [(ngModel)]="form.anonymous" name="anonymous" />
                    Quero que minha ocorrência seja registrada como anônima mesmo informando contato
                  </label>
                </div>
              }
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-submit"
                [disabled]="!form.type || !form.description.trim() || saving()">
                @if (saving()) { <span class="spin-inline"></span> }
                Enviar ocorrência
              </button>
            </div>

          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .occ-hero {
      background: #1a2a1a;
      padding: 4.5rem 2rem;
      text-align: center;
      color: white;
      .hero-icon { font-size: 3rem; margin-bottom: 1rem; }
      h1 { font-family: 'Lora', serif; font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-bottom: 1rem; }
      p  { font-size: 15px; color: rgba(255,255,255,.75); max-width: 540px; margin: 0 auto; line-height: 1.85; }
    }

    .occ-form { max-width: 720px; margin: 0 auto; }

    .form-section { margin-bottom: 2rem; }
    .form-section-title { font-family: 'Lora', serif; font-size: 1.05rem; color: var(--forest); margin-bottom: 1rem; }
    .required { color: #dc2626; }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 580px) { .two-col { grid-template-columns: 1fr; } }

    .type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: .75rem; }
    .type-btn {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 1rem; border: 1.5px solid var(--border); border-radius: var(--r);
      background: white; cursor: pointer; transition: all .2s; font-family: 'Nunito', sans-serif;
      &:hover { border-color: var(--teal); background: var(--teal-light); }
      &.selected { border-color: var(--forest); background: var(--teal-light); }
    }
    .type-icon { font-size: 1.75rem; }
    .type-label { font-size: 12.5px; font-weight: 700; color: var(--forest); text-align: center; }

    .identity-toggle { display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; }
    .id-btn {
      flex: 1; padding: .65rem 1rem; border: 1.5px solid var(--border); border-radius: var(--r-sm);
      background: white; font-family: 'Nunito', sans-serif; font-size: 13.5px; font-weight: 600;
      color: var(--muted); cursor: pointer; transition: all .2s;
      &:hover { border-color: var(--teal); }
      &.active { border-color: var(--forest); background: var(--teal-light); color: var(--forest); }
    }
    .id-note { font-size: 12.5px; color: var(--muted); line-height: 1.6; margin-bottom: 1rem; }

    .anon-check { margin-top: .75rem; }
    .check-label { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--muted); cursor: pointer; line-height: 1.5;
      input { margin-top: 2px; accent-color: var(--forest); }
    }

    .form-actions { display: flex; justify-content: flex-end; padding-top: .5rem; }
    .btn-submit {
      background: var(--forest); color: white; border: none; border-radius: 99px;
      padding: .75rem 2rem; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .2s;
      &:hover:not(:disabled) { background: var(--forest-mid); }
      &:disabled { opacity: .55; cursor: not-allowed; }
    }

    .success-wrap { display: flex; justify-content: center; padding: 4rem 1rem; }
    .success-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 3rem 2rem; max-width: 480px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,.06); }
    .success-icon { font-size: 3rem; margin-bottom: 1rem; }
    .success-card h2 { font-family: 'Lora', serif; font-size: 1.5rem; color: var(--forest); margin-bottom: .75rem; }
    .success-card p  { font-size: 14px; color: var(--muted); line-height: 1.75; margin-bottom: 1.5rem; }
    .success-actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }

    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OccurrenceComponent {
  auth    = inject(AuthService);
  private svc   = inject(OccurrenceService);
  private toast = inject(ToastService);

  saving = signal(false);
  sent   = signal(false);

  typeOptions: { value: OccurrenceType; label: string; icon: string }[] = [
    { value: 'abandono',    label: 'Abandono',     icon: '😢' },
    { value: 'maus_tratos', label: 'Maus-tratos',  icon: '⚠️' },
    { value: 'suspeita',    label: 'Suspeita',     icon: '🔍' },
    { value: 'outro',       label: 'Outro',        icon: '📋' },
  ];

  form = this.blank();

  private blank() {
    return {
      type: '' as OccurrenceType | '',
      description: '',
      address: '',
      animalDescription: '',
      reporterName: '',
      reporterEmail: '',
      anonymous: !this.auth.isLoggedIn(),
    };
  }

  reset(): void { this.form = this.blank(); this.sent.set(false); }

  submit(): void {
    if (!this.form.type || !this.form.description.trim()) return;
    this.saving.set(true);

    const user = this.auth.currentUser();
    this.svc.report({
      type:              this.form.type,
      description:       this.form.description.trim(),
      address:           this.form.address.trim() || undefined,
      animalDescription: this.form.animalDescription.trim() || undefined,
      reporterName:      this.form.anonymous ? undefined : (this.form.reporterName.trim() || user?.name),
      reporterEmail:     this.form.anonymous ? undefined : (this.form.reporterEmail.trim() || user?.email),
      anonymous:         this.form.anonymous,
      userId:            (!this.form.anonymous && user) ? user.id : undefined,
    }).subscribe({
      next: () => { this.sent.set(true); this.saving.set(false); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }
}
