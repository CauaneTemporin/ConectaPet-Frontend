import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-enter">
      <section class="section">
        <div class="section-tag">Fale conosco</div>
        <h2 class="section-title">Contato</h2>
        <p class="section-sub">Tem dúvidas, quer ser parceiro ou reportar um caso? Nossa equipe está aqui para você.</p>

        <div class="contact-grid">
          <div>
            <div class="contact-info">
              <h3>Informações</h3>
              <div class="contact-row"><div class="c-icon">📍</div><div class="c-text"><strong>Endereço</strong><span>Av. Paulista, 1000 — São Paulo, SP</span></div></div>
              <div class="contact-row"><div class="c-icon">📞</div><div class="c-text"><strong>Telefone</strong><span>(11) 3000-4444</span></div></div>
              <div class="contact-row"><div class="c-icon">✉️</div><div class="c-text"><strong>E-mail</strong><span>oi&#64;conectapet.org.br</span></div></div>
              <div class="contact-row"><div class="c-icon">🕐</div><div class="c-text"><strong>Horário</strong><span>Seg–Sex: 9h–18h | Sáb: 9h–13h</span></div></div>
            </div>
            <div class="vol-box">
              <h4>Seja voluntário</h4>
              <p>Cadastre-se e faça parte da nossa rede.</p>
              <a routerLink="/seja-voluntario" class="btn btn-teal">Quero ser voluntário</a>
            </div>
          </div>

          <div class="contact-form-card">
            <h3>Envie uma mensagem</h3>
            <div class="two-cols">
              <div class="form-field"><label class="form-label">Nome</label><input class="form-input" [(ngModel)]="name" placeholder="Seu nome"></div>
              <div class="form-field"><label class="form-label">Telefone</label><input class="form-input" [(ngModel)]="phone" placeholder="(11) 00000-0000"></div>
            </div>
            <div class="form-field"><label class="form-label">E-mail</label><input class="form-input" type="email" [(ngModel)]="email" placeholder="seu@email.com"></div>
            <div class="form-field">
              <label class="form-label">Assunto</label>
              <select class="form-input" [(ngModel)]="subject">
                <option>Dúvida sobre adoção</option>
                <option>Informações sobre doação</option>
                <option>Quero ser voluntário</option>
                <option>Quero ser padrinho</option>
                <option>Reportar maus-tratos</option>
                <option>Parceria institucional</option>
              </select>
            </div>
            <div class="form-field"><label class="form-label">Mensagem</label><textarea class="form-input" [(ngModel)]="message" rows="5" placeholder="Escreva sua mensagem..."></textarea></div>
            <button class="btn btn-teal btn-full" style="padding:.7rem;font-size:15px" (click)="send()" [disabled]="loading()">
              @if (loading()) { <span class="spin"></span> } Enviar mensagem →
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2.5rem; align-items: start; }
    .contact-info { background: var(--forest); border-radius: var(--r); padding: 2rem; color: white; margin-bottom: 1rem;
      h3 { font-family: 'Lora', serif; font-size: 1.2rem; margin-bottom: 1.25rem; }
    }
    .contact-row { display: flex; gap: 12px; align-items: flex-start; padding: .85rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); &:last-child { border-bottom: none; } }
    .c-icon { width: 36px; height: 36px; background: rgba(255,255,255,.12); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .c-text { strong { display: block; font-size: 13px; } span { font-size: 12.5px; color: rgba(255,255,255,.65); } }
    .vol-box { background: var(--teal-light); border-radius: var(--r); padding: 1.5rem;
      h4 { font-weight: 800; color: var(--forest); font-size: 14px; margin-bottom: .6rem; }
      p  { font-size: 13px; color: var(--muted); line-height: 1.7; margin-bottom: 1rem; }
    }
    .contact-form-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 2rem;
      h3 { font-weight: 800; font-size: 1.05rem; color: var(--forest); margin-bottom: 1.5rem; }
    }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } .two-cols { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent {
  private contactSvc = inject(ContactService);
  private toast      = inject(ToastService);

  name = ''; phone = ''; email = ''; subject = 'Dúvida sobre adoção'; message = '';
  loading = signal(false);

  send(): void {
    if (!this.name || !this.email || !this.message) { this.toast.error('Preencha nome, e-mail e mensagem.'); return; }
    this.loading.set(true);
    this.contactSvc.send({ name: this.name, email: this.email, phone: this.phone, subject: this.subject, message: this.message }).subscribe({
      next: () => {
        this.toast.success('Mensagem enviada! Responderemos em breve. ✉️');
        this.name = ''; this.email = ''; this.phone = ''; this.message = '';
        this.loading.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.loading.set(false); }
    });
  }
}
