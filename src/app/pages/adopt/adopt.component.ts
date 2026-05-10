import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adopt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-enter">
      <section class="section">
        <div class="section-tag">Processo de adoção</div>
        <h2 class="section-title">Como adotar</h2>
        <p class="section-sub">Processo simples, humano e seguro. Garantimos o match perfeito entre você e seu novo companheiro.</p>

        <div class="steps-grid" style="margin-bottom:3.5rem">
          <div class="step-card"><div class="step-num">01</div><h3>Cadastro</h3><p>Crie sua conta gratuita e preencha o perfil familiar com informações sobre seu estilo de vida.</p></div>
          <div class="step-card"><div class="step-num">02</div><h3>Escolha o pet</h3><p>Navegue pelos animais, filtre por porte, espécie e temperamento e encontre seu match.</p></div>
          <div class="step-card"><div class="step-num">03</div><h3>Entrevista</h3><p>Nossa equipe entra em contato para uma conversa e análise de compatibilidade.</p></div>
          <div class="step-card"><div class="step-num">04</div><h3>Visita</h3><p>Agende visita em um dos abrigos parceiros para conhecer o animal pessoalmente.</p></div>
          <div class="step-card"><div class="step-num">05</div><h3>Adoção</h3><p>Assine o termo de adoção responsável e leve seu novo melhor amigo para casa.</p></div>
          <div class="step-card"><div class="step-num">06</div><h3>Acompanhamento</h3><p>Suporte durante os 30 primeiros dias de adaptação.</p></div>
        </div>

        <div class="req-box">
          <h3>Documentos necessários</h3>
          <div class="req-grid">
            <div class="req-item"><div>📋</div><strong>Documento com foto</strong><p>RG ou CNH válido</p></div>
            <div class="req-item"><div>🏠</div><strong>Comprovante de residência</strong><p>Últimos 3 meses</p></div>
            <div class="req-item"><div>👤</div><strong>Maioridade</strong><p>18 anos ou mais</p></div>
            <div class="req-item"><div>✅</div><strong>Entrevista aprovada</strong><p>Análise da equipe</p></div>
          </div>
        </div>

        <div style="text-align:center;margin-top:2.5rem">
          <a routerLink="/animais" class="btn btn-teal" style="padding:.75rem 2.5rem;font-size:1rem">Ver animais disponíveis →</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .req-box { background: var(--teal-light); border-radius: var(--r); padding: 2rem; }
    .req-box h3 { font-weight: 800; color: var(--forest); font-size: 1.05rem; margin-bottom: 1.25rem; }
    .req-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; }
    .req-item { background: white; border-radius: var(--r-sm); padding: 1.1rem;
      div  { font-size: 1.4rem; margin-bottom: 6px; }
      strong { font-size: 14px; color: var(--forest); display: block; }
      p { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
    }
  `]
})
export class AdoptComponent {}
