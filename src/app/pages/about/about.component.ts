import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-enter">
      <section class="section">
        <div class="about-grid">
          <div>
            <div class="section-tag forest">Nossa história</div>
            <h2 class="section-title" style="margin-top:.5rem">Quem somos</h2>
            <p>A <strong>Conecta PET</strong> nasceu em 2018 de um grupo de veterinários e ativistas que viram a necessidade de conectar quem quer adotar com quem cuida dos animais em abrigos.</p>
            <p>Hoje somos uma ONG presente em 15 cidades, com 420 abrigos parceiros e 2.800 adoções realizadas. Nossa missão: <em>nenhum animal saudável deve ser sacrificado por falta de lar.</em></p>
            <p>Trabalhamos com transparência total: relatórios mensais de impacto e auditoria anual independente.</p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:2rem">
              <a routerLink="/como-doar" class="btn btn-teal">Apoiar causa →</a>
              <a routerLink="/seja-voluntario" class="btn btn-outline-teal">Ser voluntário</a>
            </div>
            <h3 style="font-weight:800;font-size:1rem;color:var(--forest);margin-top:2.5rem;margin-bottom:1rem">Nossa equipe</h3>
            <div class="team-grid">
              <div class="team-card"><div class="team-avatar av-teal">AM</div><div class="team-name">Ana Martins</div><div class="team-role">Fundadora / Vet</div></div>
              <div class="team-card"><div class="team-avatar av-rose">RL</div><div class="team-name">Rafael Lima</div><div class="team-role">Dir. Executivo</div></div>
              <div class="team-card"><div class="team-avatar av-forest">CS</div><div class="team-name">Carla Silva</div><div class="team-role">Coord. Adoções</div></div>
            </div>
          </div>
          <div class="about-visual">
            <div style="font-size:5rem;margin-bottom:1.5rem">🐾</div>
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
      </section>
    </div>
  `,
  styles: [`
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    p { color: var(--muted); line-height: 1.9; margin-bottom: 1rem; strong { color: var(--forest); } em { color: var(--teal-dark); } }
    .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .team-card { text-align: center; padding: 1.25rem; background: white; border-radius: var(--r); border: 1.5px solid var(--border); }
    .team-avatar { width: 52px; height: 52px; border-radius: 50%; margin: 0 auto .6rem; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: white;
      &.av-teal   { background: var(--teal);   color: var(--teal-dark); }
      &.av-rose   { background: var(--rose);   color: var(--rose-dark); }
      &.av-forest { background: var(--forest); color: white; }
    }
    .team-name { font-size: 13.5px; font-weight: 700; color: var(--forest); }
    .team-role { font-size: 11.5px; color: var(--muted); }
    .about-visual { background: var(--forest); border-radius: 24px; padding: 3rem; color: white; text-align: center;
      h3 { font-family: 'Lora', serif; font-size: 1.4rem; margin-bottom: .75rem; }
      p  { font-size: 13.5px; color: rgba(255,255,255,.75); line-height: 1.85; }
    }
    .about-stats { margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center; }
    .about-stats > div { background: rgba(255,255,255,.1); border-radius: var(--r-sm); padding: 1.25rem; }
    .stat-n { font-family: 'Lora', serif; font-size: 2rem; font-weight: 600; color: var(--teal-mid); }
    .stat-l { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.65); }
    @media (max-width: 900px) { .about-grid { grid-template-columns: 1fr; } .team-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AboutComponent {}
