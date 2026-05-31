import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OngService } from '../../../../core/services/api.services';
import { OngContextService } from '../../../../core/services/ong-context.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { OngMembro, OngMembroRole } from '../../../../shared/models';

@Component({
  selector: 'app-ong-membros',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <div>
        <h2 class="dash-title">Membros da ONG</h2>
        @if (ongCtx.selectedOng()) {
          <p class="panel-sub">{{ ongCtx.selectedOng()!.nomeFantasia }}</p>
        }
      </div>
    </div>

    @if (!ongCtx.hasOng()) {
      <div class="empty-state">
        <div class="icon">🏢</div>
        <h3>Nenhuma ONG selecionada</h3>
        <p>Selecione uma ONG na página inicial para ver seus membros.</p>
      </div>
    } @else if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">👥</div>
        <h3>Nenhum membro encontrado</h3>
        <p>Esta ONG ainda não possui membros cadastrados.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="membros-table">
          <thead>
            <tr>
              <th>Membro</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (m of items(); track m.id) {
              <tr>
                <td class="col-name">
                  <div class="member-avatar">{{ initials(m.userName) }}</div>
                  <span>{{ m.userName }}</span>
                  @if (m.userId === auth.currentUser()?.id) {
                    <span class="you-badge">você</span>
                  }
                </td>
                <td class="col-email">{{ m.userEmail }}</td>
                <td class="col-role">
                  <span class="role-pill" [ngClass]="'pill-' + m.role">
                    {{ roleLabel(m.role) }}
                  </span>
                </td>
                <td class="col-date">{{ m.joinedAt | date:'dd/MM/yyyy' }}</td>
                <td class="col-actions">
                  @if (m.userId !== auth.currentUser()?.id) {
                    <button class="btn btn-sm btn-outline-teal" (click)="openEdit(m)">Alterar perfil</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Modal alterar role -->
    @if (editTarget()) {
      <div class="modal-backdrop" (click)="closeEdit()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Alterar perfil — {{ editTarget()!.userName }}</h3>
            <button class="modal-close" (click)="closeEdit()">✕</button>
          </div>
          <div class="form-field">
            <label class="form-label">Novo perfil</label>
            <div class="role-options">
              <button class="role-option" [class.selected]="editRole === 'ONG_ADMIN'"
                (click)="editRole = 'ONG_ADMIN'">
                <strong>🛡️ ONG Admin</strong>
                <span>Pode gerenciar animais, adoções e membros</span>
              </button>
              <button class="role-option" [class.selected]="editRole === 'ONG_MEMBRO'"
                (click)="editRole = 'ONG_MEMBRO'">
                <strong>👤 ONG Membro</strong>
                <span>Acesso padrão aos serviços da ONG</span>
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeEdit()">Cancelar</button>
            <button class="btn btn-teal" (click)="saveRole()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> }
              Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-header { margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .panel-sub  { color: var(--muted); font-size: 13px; margin-top: 2px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); margin-bottom: .5rem; } p { color: var(--muted); font-size: 14px; } }

    .table-wrap { overflow-x: auto; background: white; border-radius: var(--r); border: 1.5px solid var(--border); }
    .membros-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .membros-table thead tr { border-bottom: 1.5px solid var(--border); background: var(--cream); }
    .membros-table th { padding: .75rem 1rem; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    .membros-table td { padding: .85rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .membros-table tbody tr:last-child td { border-bottom: none; }
    .membros-table tbody tr:hover { background: var(--cream); }

    .col-name { display: flex; align-items: center; gap: .6rem; }
    .member-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--teal-light); color: var(--forest);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; flex-shrink: 0;
    }
    .you-badge { background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 99px; }
    .col-email  { color: var(--muted); font-size: 13px; }
    .col-date   { color: var(--muted); font-size: 12px; white-space: nowrap; }
    .col-actions { }

    .role-pill { padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .pill-ONG_ADMIN { background: #fefce8; color: #854d0e; }
    .pill-ONG_MEMBRO { background: #eff6ff; color: #1e40af; }

    .btn-sm { padding: .3rem .75rem; font-size: 12px; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; h3 { font-family: 'Lora', serif; font-size: 1.05rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }

    .form-field { margin-bottom: .5rem; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--forest); margin-bottom: .75rem; }

    .role-options { display: flex; flex-direction: column; gap: .75rem; }
    .role-option {
      background: white; border: 1.5px solid var(--border); border-radius: var(--r-sm);
      padding: .9rem 1rem; text-align: left; cursor: pointer; transition: all .2s;
      font-family: 'Nunito', sans-serif;
      strong { display: block; color: var(--forest); font-size: 14px; margin-bottom: 2px; }
      span   { display: block; font-size: 12px; color: var(--muted); }
      &:hover  { border-color: var(--teal); background: var(--teal-light); }
      &.selected { border-color: var(--teal-dark); background: var(--teal-light); }
    }
  `]
})
export class OngMembrosComponent implements OnInit {
  private svc   = inject(OngService);
  private toast = inject(ToastService);
  ongCtx        = inject(OngContextService);
  auth          = inject(AuthService);

  items      = signal<OngMembro[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  editTarget = signal<OngMembro | null>(null);
  editRole: OngMembroRole = 'ONG_MEMBRO';

  ngOnInit(): void {
    const ongId = this.ongCtx.selectedOngId();
    if (!ongId) { this.loading.set(false); return; }
    this.load(ongId);
  }

  load(ongId: number): void {
    this.loading.set(true);
    this.svc.listarMembros(ongId).subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openEdit(m: OngMembro): void {
    this.editRole = m.role;
    this.editTarget.set(m);
  }

  closeEdit(): void { this.editTarget.set(null); }

  saveRole(): void {
    const m = this.editTarget();
    const ongId = this.ongCtx.selectedOngId();
    if (!m || !ongId) return;
    this.saving.set(true);
    this.svc.alterarRoleMembro(ongId, m.userId, { role: this.editRole }).subscribe({
      next: () => {
        this.toast.success('Perfil do membro atualizado com sucesso.');
        this.closeEdit();
        this.saving.set(false);
        this.load(ongId);
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  roleLabel(role: OngMembroRole): string {
    return role === 'ONG_ADMIN' ? 'ONG Admin' : 'Membro';
  }
}
