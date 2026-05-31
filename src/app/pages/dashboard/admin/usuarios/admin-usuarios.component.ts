import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { UserAdmin, UserRole } from '../../../../shared/models';

const ROLE_LABELS: Record<string, string> = {
  USER: 'Usuário', ADMIN: 'Administrador', GESTOR_PUBLICO: 'Gestor Público'
};

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Usuários</h2>
      <span class="badge-total">{{ items().length }} cadastrados</span>
    </div>

    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (items().length === 0) {
      <div class="empty-state">
        <div class="icon">👥</div>
        <h3>Nenhum usuário encontrado</h3>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cidade</th>
              <th>Perfil</th>
              <th>Cadastro</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            @for (u of items(); track u.id) {
              <tr>
                <td class="muted">{{ u.id }}</td>
                <td><strong>{{ u.name }}</strong></td>
                <td class="muted">{{ u.email }}</td>
                <td class="muted">{{ u.city }}</td>
                <td>
                  <span class="role-pill" [ngClass]="'role-' + u.role">{{ roleLabel(u.role) }}</span>
                </td>
                <td class="muted">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  @if (u.role !== 'ADMIN') {
                    <button class="btn btn-sm btn-outline-teal" (click)="openChange(u)">Alterar perfil</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (changeTarget()) {
      <div class="modal-backdrop" (click)="closeChange()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Alterar perfil — {{ changeTarget()!.name }}</h3>
            <button class="modal-close" (click)="closeChange()">✕</button>
          </div>
          <p class="modal-desc">Perfil atual: <strong>{{ roleLabel(changeTarget()!.role) }}</strong></p>
          <div class="form-field">
            <label class="form-label">Novo perfil</label>
            <select class="form-input" [(ngModel)]="newRole">
              <option value="USER">Usuário</option>
              <option value="GESTOR_PUBLICO">Gestor Público</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="closeChange()">Cancelar</button>
            <button class="btn btn-teal" (click)="confirmChange()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .badge-total { background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; }

    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; .icon { font-size: 3rem; margin-bottom: 1rem; } h3 { font-family: 'Lora', serif; color: var(--forest); } }

    .table-wrap { overflow-x: auto; }
    .user-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .user-table th { text-align: left; padding: .6rem 1rem; font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid var(--border); }
    .user-table td { padding: .75rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .user-table tr:last-child td { border-bottom: none; }
    .user-table tr:hover td { background: var(--cream); }
    .muted { color: var(--muted); }

    .role-pill { padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .role-USER           { background: #f3f4f6; color: #374151; }
    .role-ADMIN          { background: #fef3c7; color: #92400e; }
    .role-GESTOR_PUBLICO { background: #dbeafe; color: #1e40af; }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-box { background: white; border-radius: var(--r); padding: 2rem; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; h3 { font-family: 'Lora', serif; font-size: 1.1rem; color: var(--forest); } }
    .modal-close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted); padding: 4px 8px; border-radius: var(--r-sm); &:hover { background: var(--cream); } }
    .modal-desc { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 1.5rem; }

    .form-field { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--forest); margin-bottom: 6px; }
    .form-input { width: 100%; padding: .6rem .85rem; border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: 'Nunito', sans-serif; font-size: 14px; background: white; box-sizing: border-box; }
    .spin-inline { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(0,0,0,.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
  `]
})
export class AdminUsuariosComponent implements OnInit {
  private svc   = inject(AdminService);
  private toast = inject(ToastService);

  items        = signal<UserAdmin[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  changeTarget = signal<UserAdmin | null>(null);
  newRole: 'USER' | 'GESTOR_PUBLICO' = 'USER';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.listUsers().subscribe({
      next: (r: any) => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openChange(u: UserAdmin): void {
    this.newRole = u.role === 'GESTOR_PUBLICO' ? 'GESTOR_PUBLICO' : 'USER';
    this.changeTarget.set(u);
  }

  closeChange(): void { this.changeTarget.set(null); }

  confirmChange(): void {
    const u = this.changeTarget();
    if (!u) return;
    this.saving.set(true);
    this.svc.alterarRole(u.id, { role: this.newRole }).subscribe({
      next: (updated: UserAdmin) => {
        this.items.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.toast.success('Perfil alterado com sucesso.');
        this.closeChange();
        this.saving.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  roleLabel(r: string): string { return ROLE_LABELS[r] ?? r; }
}
