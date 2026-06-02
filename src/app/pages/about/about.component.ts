import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OngContextService } from '../../core/services/ong-context.service';
import { OngService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { Ong } from '../../shared/models';

interface SocialField {
  key: string; label: string; color: string; placeholder: string; svg: string;
  isPhone?: boolean; isUsername?: boolean; helpText: string;
}

const SOCIALS: SocialField[] = [
  {
    key: 'facebook', label: 'Facebook', color: '#1877F2',
    placeholder: 'https://facebook.com/suaong',
    helpText: 'Acesse seu perfil, toque no botão com três pontinhos ao lado de "Editar perfil" e selecione Copiar link.',
    svg: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  {
    key: 'instagram', label: 'Instagram', color: '#E1306C',
    placeholder: 'https://instagram.com/suaong',
    helpText: 'Acesse seu perfil, toque em Compartilhar perfil e depois em Copiar link.',
    svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
  },
  {
    key: 'whatsapp', label: 'WhatsApp', color: '#25D366',
    placeholder: 'DDD + número (ex: 11999990000)',
    isPhone: true,
    helpText: 'Adicione o DDD + número sem espaços ou caracteres especiais (ex: 11999990000).',
    svg: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'
  },
  {
    key: 'youtube', label: 'YouTube', color: '#FF0000',
    placeholder: 'https://youtube.com/@suaong',
    helpText: 'Acesse a página principal do canal, clique no botão Compartilhar e selecione Copiar link.',
    svg: 'M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z'
  },
  {
    key: 'tiktok', label: 'TikTok', color: '#000000',
    placeholder: 'https://tiktok.com/@suaong',
    helpText: 'Acesse o aplicativo, toque em Perfil no canto inferior direito e selecione o botão Compartilhar perfil.',
    svg: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
  },
  {
    key: 'telegram', label: 'Telegram', color: '#26A5E4',
    placeholder: 'Nome de usuário (ex: suaong)',
    isUsername: true,
    helpText: 'Adicione seu nome de usuário (username) do Telegram sem o @. O link será gerado automaticamente.  Esse link só funciona se você tiver um Nome de Usuário configurado na sua conta.  Para criar acesse o menu principal clicando nas três linhas no canto superior esquerdo. Depois, clique em Configurações e procure pela opção Nome de usuário.',
    svg: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
  },
];

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-enter">
      <section class="section">

        @if (ong()) {
          <!-- ── Conteúdo dinâmico da ONG ── -->
          <div class="about-grid">

            <!-- Coluna esquerda -->
            <div>
              <div class="section-tag forest">Nossa história</div>
              <h2 class="section-title" style="margin-top:.5rem">{{ ong()!.nomeFantasia }}</h2>

              @if (!editing()) {
                @if (ong()!.historia) {
                  <div class="historia-text">{{ ong()!.historia }}</div>
                } @else {
                  <p class="empty-text">Nenhuma história cadastrada ainda.</p>
                }

                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:2rem">
                  <a routerLink="/como-doar" class="btn btn-teal">Apoiar causa →</a>
                  <a routerLink="/seja-voluntario" class="btn btn-outline-teal">Ser voluntário</a>
                </div>

                @if (ongCtx.isOngAdmin()) {
                  <button class="btn-edit" style="margin-top:1.5rem" (click)="startEdit()">
                    ✏️ Editar página
                  </button>
                }

              } @else {
                <!-- Formulário de edição -->
                <div class="edit-form">

                  <div class="edit-section-title">Identidade</div>

                  <div class="edit-row">
                    <div class="edit-field">
                      <label class="edit-label">URL da Logo</label>
                      <input class="edit-input" type="url" [(ngModel)]="editLogoUrl"
                        placeholder="https://suaong.org/logo.png">
                    </div>
                  </div>

                  <div class="edit-field">
                    <label class="edit-label">Nossa história</label>
                    <textarea class="edit-input" [(ngModel)]="editHistoria" rows="7"
                      placeholder="Conte a história da sua ONG..."></textarea>
                  </div>

                  <div class="edit-field">
                    <label class="edit-label">Nossa missão (exibida no painel direito)</label>
                    <textarea class="edit-input" [(ngModel)]="editMissao" rows="3"
                      placeholder="Qual é a missão da sua ONG?"></textarea>
                  </div>

                  <div class="edit-field">
                    <label class="edit-label">Descrição curta (listagens e cards)</label>
                    <textarea class="edit-input" [(ngModel)]="editDescricao" rows="2"
                      placeholder="Breve descrição da ONG..."></textarea>
                  </div>

                  <div class="edit-section-title" style="margin-top:1.25rem">Redes sociais</div>
                  <p class="edit-hint">Deixe em branco os que não deseja exibir. Clique em <strong>?</strong> para ver como obter o link de cada rede.</p>

                  <div class="socials-grid">
                    @for (s of socials; track s.key) {
                      <div class="edit-field">
                        <label class="edit-label">
                          <svg viewBox="0 0 24 24" width="13" height="13" [style.fill]="s.color" style="vertical-align:middle;margin-right:4px"><path [attr.d]="s.svg"/></svg>
                          {{ s.label }}
                          <button type="button" class="help-btn" (click)="openHelp(s)" title="Como obter o link">?</button>
                        </label>
                        @if (s.isPhone) {
                          <input class="edit-input" type="tel"
                            [ngModel]="editSocials[s.key]"
                            (input)="editSocials[s.key] = maskWhatsapp($event)"
                            [placeholder]="s.placeholder"
                            maxlength="11">
                        } @else if (s.isUsername) {
                          <input class="edit-input" type="text"
                            [(ngModel)]="editSocials[s.key]"
                            [placeholder]="s.placeholder">
                        } @else {
                          <input class="edit-input" type="url"
                            [(ngModel)]="editSocials[s.key]"
                            [placeholder]="s.placeholder">
                        }
                      </div>
                    }
                  </div>

                  <!-- Modal de ajuda -->
                  @if (helpSocial()) {
                    <div class="help-overlay" (click)="closeHelp()">
                      <div class="help-modal" (click)="$event.stopPropagation()">
                        <div class="help-modal-header">
                          <svg viewBox="0 0 24 24" width="20" height="20" [style.fill]="helpSocial()!.color"><path [attr.d]="helpSocial()!.svg"/></svg>
                          <span>{{ helpSocial()!.label }}</span>
                          <button class="help-modal-close" (click)="closeHelp()">✕</button>
                        </div>
                        <p class="help-modal-text">{{ helpSocial()!.helpText }}</p>
                      </div>
                    </div>
                  }

                  <div class="edit-actions">
                    <button class="btn btn-outline-teal" (click)="cancelEdit()">Cancelar</button>
                    <button class="btn btn-teal" (click)="salvar()" [disabled]="saving()">
                      @if (saving()) { <span class="spin"></span> } Salvar
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Coluna direita (visual panel) -->
            <div class="about-visual">

              <!-- Logo -->
              @if (ong()!.logoUrl) {
                <img [src]="ong()!.logoUrl" [alt]="ong()!.nomeFantasia" class="ong-logo">
              } @else {
                <div class="logo-placeholder">🐾</div>
              }

              <h3>Nossa missão</h3>
              <p>{{ ong()!.missao || ong()!.descricao || 'Conectar animais abandonados a famílias amorosas.' }}</p>

              <!-- Informações de contato -->
              <div class="about-info">
                <div class="info-item">
                  <span class="info-label">Localização</span>
                  <span>{{ ong()!.cidade }} — {{ ong()!.estado }}</span>
                </div>
                @if (ong()!.email) {
                  <div class="info-item">
                    <span class="info-label">E-mail</span>
                    <span>{{ ong()!.email }}</span>
                  </div>
                }
                @if (ong()!.telefone) {
                  <div class="info-item">
                    <span class="info-label">Telefone</span>
                    <span>{{ ong()!.telefone }}</span>
                  </div>
                }
                @if (ong()!.endereco) {
                  <div class="info-item">
                    <span class="info-label">Endereço</span>
                    <span>{{ ong()!.endereco }}</span>
                  </div>
                }
              </div>

              <!-- Redes sociais (apenas as preenchidas) -->
              @if (socialLinks().length > 0) {
                <div class="social-links">
                  @for (link of socialLinks(); track link.label) {
                    <a [href]="link.url" target="_blank" rel="noopener" class="social-btn">
                      <svg viewBox="0 0 24 24" width="14" height="14" [style.fill]="link.color"><path [attr.d]="link.svg"/></svg>
                      {{ link.label }}
                    </a>
                  }
                </div>
              }
            </div>
          </div>

        } @else {
          <!-- ── Conteúdo estático padrão ── -->
          <div class="about-grid">
            <div>
              <div class="section-tag forest">Nossa história</div>
              <h2 class="section-title" style="margin-top:.5rem">Quem somos</h2>
              <p>A <strong>Conecta PET</strong> nasceu em 2018 de um grupo de veterinários e ativistas que viram a necessidade de conectar quem quer adotar com quem cuida dos animais em abrigos.</p>
              <p>Hoje somos uma plataforma presente em diversas cidades, com centenas de abrigos parceiros e milhares de adoções realizadas. Nossa missão: <em>nenhum animal saudável deve ser sacrificado por falta de lar.</em></p>
              <p>Trabalhamos com transparência total: relatórios mensais de impacto e auditoria anual independente.</p>
              <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:2rem">
                <a routerLink="/como-doar" class="btn btn-teal">Apoiar causa →</a>
                <a routerLink="/seja-voluntario" class="btn btn-outline-teal">Ser voluntário</a>
              </div>
            </div>
            <div class="about-visual">
              <div class="logo-placeholder">🐾</div>
              <h3>Nossa missão</h3>
              <p>Conectar animais abandonados a famílias amorosas através de um processo humanizado, seguro e eficiente — em todo o Brasil.</p>
              <div class="about-stats">
                <div><div class="stat-n">2.8k</div><div class="stat-l">Adoções</div></div>
                <div><div class="stat-n">420+</div><div class="stat-l">Parceiros</div></div>
                <div><div class="stat-n">15</div><div class="stat-l">Cidades</div></div>
                <div><div class="stat-n">7k+</div><div class="stat-l">Voluntários</div></div>
              </div>
            </div>
          </div>
        }

      </section>
    </div>
  `,
  styles: [`
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
    p { color: var(--muted); line-height: 1.9; margin-bottom: 1rem;
      strong { color: var(--forest); } em { color: var(--teal-dark); } }

    .historia-text { color: var(--muted); line-height: 1.9; white-space: pre-wrap; font-size: 15px; }
    .empty-text { color: var(--muted); font-style: italic; font-size: 14px; }

    .btn-edit {
      background: transparent; border: 1.5px dashed var(--teal); color: var(--teal-dark);
      font-size: 13px; padding: .45rem 1rem; border-radius: var(--r-sm); cursor: pointer;
      font-family: 'Nunito', sans-serif; font-weight: 700; display: inline-block;
      &:hover { background: var(--teal-light); }
    }

    /* Edit form */
    .edit-form { display: flex; flex-direction: column; gap: .9rem; margin-top: 1rem; }
    .edit-section-title {
      font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em;
      color: var(--forest); padding-bottom: .4rem; border-bottom: 1.5px solid var(--border);
    }
    .edit-hint { font-size: 12px; color: var(--muted); margin: -.4rem 0 .3rem; }
    .edit-row { display: grid; grid-template-columns: 1fr; gap: .75rem; }
    .edit-field { display: flex; flex-direction: column; gap: 4px; }
    .edit-label { font-size: 13px; font-weight: 600; color: var(--forest); }
    .edit-input {
      padding: .6rem .85rem; border: 1.5px solid var(--border); border-radius: var(--r-sm);
      font-family: 'Nunito', sans-serif; font-size: 14px; resize: vertical; width: 100%;
      box-sizing: border-box;
      &:focus { outline: none; border-color: var(--teal); }
    }
    .socials-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .edit-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: .5rem; }

    .help-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--teal-dark); color: white;
      font-size: 10px; font-weight: 800; font-family: 'Nunito', sans-serif;
      border: none; cursor: pointer; margin-left: 5px; vertical-align: middle; flex-shrink: 0;
      &:hover { background: var(--forest); }
    }

    .help-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .help-modal {
      background: white; border-radius: 16px; padding: 1.75rem;
      max-width: 380px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,.18);
    }
    .help-modal-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 1rem;
      span { font-weight: 800; font-size: 1rem; color: var(--forest); flex: 1; }
    }
    .help-modal-close {
      background: none; border: none; cursor: pointer; font-size: 1rem;
      color: var(--muted); padding: 2px 6px; border-radius: 6px;
      &:hover { background: var(--border); }
    }
    .help-modal-text {
      font-size: 14px; color: var(--muted); line-height: 1.75; margin: 0;
    }

    /* Visual panel */
    .about-visual {
      background: var(--forest); border-radius: 24px; padding: 2.5rem; color: white; text-align: center;
      h3 { font-family: 'Lora', serif; font-size: 1.3rem; margin-bottom: .6rem; }
      p  { font-size: 13.5px; color: rgba(255,255,255,.75); line-height: 1.8; }
    }

    .ong-logo {
      width: 90px; height: 90px; object-fit: contain; border-radius: 16px;
      background: white; padding: 6px; margin-bottom: 1.25rem;
    }
    .logo-placeholder {
      font-size: 4rem; margin-bottom: 1.25rem; line-height: 1;
    }

    /* Contact info */
    .about-info { margin-top: 1.5rem; display: flex; flex-direction: column; gap: .65rem; text-align: left; }
    .info-item { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: rgba(255,255,255,.8); }
    .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.45); }

    /* Social links */
    .social-links {
      margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center;
    }
    .social-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,.12); color: white;
      border-radius: 99px; padding: .35rem .9rem; font-size: 12.5px; font-weight: 700;
      text-decoration: none; transition: background .15s;
      &:hover { background: rgba(255,255,255,.22); }
    }

    /* Static stats */
    .about-stats { margin-top: 1.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center; }
    .about-stats > div { background: rgba(255,255,255,.1); border-radius: var(--r-sm); padding: 1.25rem; }
    .stat-n { font-family: 'Lora', serif; font-size: 2rem; font-weight: 600; color: var(--teal-mid); }
    .stat-l { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.65); }

    .spin {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor;
      border-radius: 50%; animation: spin .7s linear infinite; margin-right: 4px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) { .about-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .socials-grid { grid-template-columns: 1fr; } }
  `]
})
export class AboutComponent implements OnInit {
  ongCtx  = inject(OngContextService);
  private ongSvc = inject(OngService);
  private toast  = inject(ToastService);

  readonly socials = SOCIALS;

  ong        = signal<Ong | null>(null);
  editing    = signal(false);
  saving     = signal(false);
  helpSocial = signal<SocialField | null>(null);

  editHistoria  = '';
  editMissao    = '';
  editDescricao = '';
  editLogoUrl   = '';
  editSocials: Record<string, string> = {};

  ngOnInit(): void {
    const selected = this.ongCtx.selectedOng();
    if (selected) {
      this.ongSvc.buscarPorId(selected.id).subscribe({
        next: (data) => this.ong.set(data),
        error: () => {}
      });
    }
  }

  socialLinks(): { svg: string; color: string; label: string; url: string }[] {
    const o = this.ong();
    if (!o) return [];
    const rec = o as unknown as Record<string, unknown>;
    return SOCIALS
      .filter(s => !!rec[s.key])
      .map(s => {
        const raw = rec[s.key] as string;
        const url = s.isPhone
          ? `https://wa.me/55${raw.replace(/\D/g, '')}`
          : s.isUsername
          ? `https://t.me/${raw.replace(/^@/, '').trim()}`
          : raw;
        return { svg: s.svg, color: s.color, label: s.label, url };
      });
  }

  startEdit(): void {
    const o = this.ong();
    if (!o) return;
    const rec = o as unknown as Record<string, unknown>;
    this.editHistoria  = o.historia  ?? '';
    this.editMissao    = o.missao    ?? '';
    this.editDescricao = o.descricao ?? '';
    this.editLogoUrl   = o.logoUrl   ?? '';
    this.editSocials   = {};
    SOCIALS.forEach(s => { this.editSocials[s.key] = (rec[s.key] as string) ?? ''; });
    this.editing.set(true);
  }

  openHelp(social: SocialField): void  { this.helpSocial.set(social); }
  closeHelp(): void                     { this.helpSocial.set(null); }

  maskWhatsapp(event: Event): string {
    const input = event.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(0, 11);
    input.value = v;
    return v;
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  salvar(): void {
    const o = this.ong();
    if (!o) return;
    this.saving.set(true);

    const sociais: Record<string, string | undefined> = {};
    SOCIALS.forEach(s => { sociais[s.key] = this.editSocials[s.key] || ''; });

    this.ongSvc.atualizarPerfil(o.id, {
      historia:  this.editHistoria,
      missao:    this.editMissao,
      descricao: this.editDescricao,
      logoUrl:   this.editLogoUrl,
      ...sociais
    }).subscribe({
      next: (updated) => {
        this.ong.set(updated);
        this.editing.set(false);
        this.saving.set(false);
        this.toast.success('Página atualizada com sucesso!');
      },
      error: (err: any) => {
        this.toast.handleError(err, 'Erro ao salvar.');
        this.saving.set(false);
      }
    });
  }
}
