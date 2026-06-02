import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OccurrenceService } from '../../../core/services/api.services';
import { Occurrence } from '../../../shared/models';

const TYPE_LABELS: Record<string, string> = {
  abandono: 'Abandono', maus_tratos: 'Maus-tratos', suspeita: 'Suspeita',
  comercio_ilegal: 'Comércio Ilegal', falta_saneamento: 'Falta Saneamento', outro: 'Outro'
};
const TYPE_ICONS: Record<string, string> = {
  abandono: '😢', maus_tratos: '⚠️', suspeita: '🔍',
  comercio_ilegal: '🚫', falta_saneamento: '🧹', outro: '📋'
};
const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em análise', resolvido: 'Resolvido', arquivado: 'Arquivado'
};

@Component({
  selector: 'app-my-denuncias',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="panel-header">
      <div>
        <h2 class="dash-title">Minhas Ocorrências</h2>
        <p class="panel-sub">Acompanhe o status das ocorrências que você registrou.</p>
      </div>
      <a routerLink="/ocorrencias" class="btn btn-teal">+ Nova Ocorrência</a>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">🚨</div>
        <h3>Nenhuma ocorrência registrada</h3>
        <p>Clique em "Nova Ocorrência" para registrar um relato de abandono ou maus-tratos.</p>
        <a routerLink="/ocorrencias" class="btn btn-teal" style="margin-top:1.25rem">Registrar ocorrência</a>
      </div>
    } @else {
      <div class="occ-list">
        @for (occ of items(); track occ.id) {
          <div class="occ-card" [class.card-pending]="occ.status === 'pendente'">
            <div class="occ-top">
              <div class="occ-type">
                <span class="type-icon">{{ typeIcon(occ.type) }}</span>
                <div>
                  <strong>{{ occ.titulo || typeLabel(occ.type) }}</strong>
                  @if (occ.titulo) { <span class="type-sub">{{ typeLabel(occ.type) }}</span> }
                </div>
              </div>
              <span class="status-pill" [ngClass]="'pill-' + occ.status">{{ statusLabel(occ.status) }}</span>
            </div>

            <p class="occ-desc">{{ occ.description }}</p>

            @if (occ.cidade || occ.estado || occ.endereco) {
              <div class="occ-loc">
                📍
                @if (occ.cidade) { {{ occ.cidade }}@if (occ.estado) {/{{ occ.estado }}} }
                @if (occ.endereco) { — {{ occ.endereco }} }
              </div>
            }

            @if (occ.adminNotes) {
              <div class="admin-note">
                <strong>Resposta:</strong> {{ occ.adminNotes }}
              </div>
            }

            <div class="occ-date">{{ occ.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .panel-sub  { color: var(--muted); font-size: 13px; margin-top: 2px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 3rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; } p { color: var(--muted); font-size: 14px; } }

    .occ-list { display: flex; flex-direction: column; gap: 1rem; }
    .occ-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; }
    .card-pending { border-color: #f59e0b; background: #fffbeb; }

    .occ-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .75rem; gap: .5rem; flex-wrap: wrap; }
    .occ-type { display: flex; align-items: flex-start; gap: 10px; }
    .type-icon { font-size: 1.3rem; margin-top: 2px; }
    .occ-type strong { display: block; font-size: .95rem; color: var(--forest); }
    .type-sub { font-size: 12px; color: var(--muted); }

    .occ-desc { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: .5rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
    .occ-loc { font-size: 13px; color: var(--muted); margin-bottom: .5rem; }
    .admin-note { background: #eff6ff; border-left: 3px solid #3b82f6; padding: .6rem .9rem; border-radius: 0 var(--r-sm) var(--r-sm) 0; font-size: 13px; color: var(--text); margin-bottom: .5rem; }
    .occ-date { font-size: 12px; color: var(--muted); text-align: right; }

    .status-pill { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .pill-pendente   { background: #fef3c7; color: #92400e; }
    .pill-em_analise { background: #dbeafe; color: #1e40af; }
    .pill-resolvido  { background: #d1fae5; color: #065f46; }
    .pill-arquivado  { background: #f3f4f6; color: #6b7280; }
  `]
})
export class MyDenunciasComponent implements OnInit {
  private svc = inject(OccurrenceService);

  items   = signal<Occurrence[]>([]);
  loading = signal(true);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.mine().subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  typeLabel(t: string): string  { return TYPE_LABELS[t]  ?? t; }
  typeIcon(t: string): string   { return TYPE_ICONS[t]   ?? '📋'; }
  statusLabel(s: string): string { return STATUS_LABELS[s] ?? s; }
}
