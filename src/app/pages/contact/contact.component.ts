import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, OngService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { OngContextService } from '../../core/services/ong-context.service';
import { Ong } from '../../shared/models';

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

              @if (loadingOng()) {
                <div class="info-loading">Carregando informações...</div>
              } @else if (ong()) {
                <div class="contact-row">
                  <div class="c-icon">📍</div>
                  <div class="c-text">
                    <strong>Endereço</strong>
                    <span>{{ formatEndereco(ong()!) }}</span>
                  </div>
                </div>
                @if (ong()!.telefone) {
                  <div class="contact-row">
                    <div class="c-icon">📞</div>
                    <div class="c-text"><strong>Telefone</strong><span>{{ ong()!.telefone }}</span></div>
                  </div>
                }
                <div class="contact-row">
                  <div class="c-icon">✉️</div>
                  <div class="c-text"><strong>E-mail</strong><span>{{ ong()!.email }}</span></div>
                </div>
              } @else {
                <div class="contact-row"><div class="c-icon">📍</div><div class="c-text"><strong>Endereço</strong><span>—</span></div></div>
                <div class="contact-row"><div class="c-icon">📞</div><div class="c-text"><strong>Telefone</strong><span>—</span></div></div>
                <div class="contact-row"><div class="c-icon">✉️</div><div class="c-text"><strong>E-mail</strong><span>—</span></div></div>
              }
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
              <div class="form-field">
                <label class="form-label">Nome</label>
                <input class="form-input" [(ngModel)]="name" placeholder="Seu nome">
              </div>
              <div class="form-field">
                <label class="form-label">Telefone</label>
                <input class="form-input" [(ngModel)]="phone"
                  placeholder="(11) 00000-0000"
                  maxlength="15"
                  (input)="onPhoneInput($event)">
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">E-mail</label>
              <input class="form-input" [class.input-error]="emailTouched && !emailValid()"
                type="email" [(ngModel)]="email"
                placeholder="seu@email.com"
                (blur)="emailTouched = true">
              @if (emailTouched && !emailValid()) {
                <span class="field-error">Informe um e-mail válido</span>
              }
            </div>
            <div class="form-field">
              <label class="form-label">Assunto</label>
              <select class="form-input" [(ngModel)]="subject">
                <option>Dúvida sobre adoção</option>
                <option>Informações sobre doação</option>
                <option>Quero ser voluntário</option>
                <option>Quero ser padrinho</option>
                <option>Reportar maus-tratos</option>
                <option>Parceria institucional</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Mensagem</label>
              <textarea class="form-input" [(ngModel)]="message" rows="5" placeholder="Escreva sua mensagem..."></textarea>
            </div>
            <button class="btn btn-teal btn-full" style="padding:.7rem;font-size:15px"
              (click)="send()" [disabled]="loading()">
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
    .info-loading { font-size: 13px; color: rgba(255,255,255,0.55); }
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
    .input-error { border-color: #dc2626 !important; }
    .field-error { font-size: 11.5px; color: #dc2626; margin-top: 4px; display: block; }
    .spin { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr; } .two-cols { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent implements OnInit {
  private contactSvc = inject(ContactService);
  private ongSvc     = inject(OngService);
  private ongCtx     = inject(OngContextService);
  private toast      = inject(ToastService);

  name = ''; phone = ''; email = ''; subject = 'Dúvida sobre adoção'; message = '';
  emailTouched = false;
  loading  = signal(false);
  loadingOng = signal(false);
  ong      = signal<Ong | null>(null);

  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email));

  ngOnInit(): void {
    const id = this.ongCtx.selectedOngId();
    if (id) {
      this.loadingOng.set(true);
      this.ongSvc.buscarPorId(id).subscribe({
        next: (o) => { this.ong.set(o); this.loadingOng.set(false); },
        error: ()  => this.loadingOng.set(false)
      });
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    this.phone = v;
    input.value = v;
  }

  formatEndereco(o: Ong): string {
    const parts: string[] = [];
    if (o.endereco) parts.push(o.endereco);
    const locParts: string[] = [];
    if (o.cidade) locParts.push(o.cidade);
    if (o.estado) locParts.push(o.estado);
    if (locParts.length) parts.push(locParts.join(', '));
    const result = parts.join(' — ');
    return o.cep ? `${result} - ${o.cep}` : result;
  }

  send(): void {
    this.emailTouched = true;
    if (!this.name || !this.email || !this.message) { this.toast.error('Preencha nome, e-mail e mensagem.'); return; }
    if (!this.emailValid()) { this.toast.error('Informe um e-mail válido.'); return; }
    this.loading.set(true);
    this.contactSvc.send({ name: this.name, email: this.email, phone: this.phone, subject: this.subject, message: this.message }).subscribe({
      next: () => {
        this.toast.success('Mensagem enviada! Responderemos em breve. ✉️');
        this.name = ''; this.email = ''; this.phone = ''; this.message = '';
        this.emailTouched = false;
        this.loading.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.loading.set(false); }
    });
  }
}
