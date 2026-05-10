import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContactService } from '../../../../core/services/api.services';
import { ToastService } from '../../../../core/services/toast.service';
import { Contact } from '../../../../shared/models';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Mensagens de Contato</h2>
      <span class="unread-badge">{{ unreadCount() }} não lidas</span>
    </div>
    @if (loading()) {
      <div class="loading-row"><div class="spin-big"></div></div>
    } @else if (contacts().length === 0) {
      <div class="empty-state">
        <div class="icon">✉️</div>
        <h3>Nenhuma mensagem ainda</h3>
        <p>As mensagens do formulário de contato aparecerão aqui.</p>
      </div>
    } @else {
      <div class="contact-list">
        @for (c of contacts(); track c.id) {
          <div class="contact-item" [class.unread]="!c.read">
            <div class="contact-header">
              <div class="contact-from">
                <strong>{{ c.name }}</strong>
                <span class="sub-text">{{ c.email }}</span>
                @if (c.phone) { <span class="sub-text">· {{ c.phone }}</span> }
              </div>
              <div class="contact-meta">
                @if (c.subject) { <span class="subject-pill">{{ c.subject }}</span> }
                <span class="date-text">{{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                @if (!c.read) {
                  <button class="btn btn-sm btn-outline-teal" (click)="markRead(c)">Marcar como lida</button>
                }
              </div>
            </div>
            <p class="contact-msg">{{ c.message }}</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .unread-badge { background: var(--rose-light); color: var(--rose-dark); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin-big { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .contact-list { display: flex; flex-direction: column; gap: 1rem; }
    .contact-item { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 1.25rem; }
    .contact-item.unread { border-color: var(--teal); background: var(--teal-light); }
    .contact-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .contact-from { display: flex; flex-direction: column; gap: 2px; }
    .contact-from strong { font-size: 1rem; color: var(--forest); }
    .contact-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .sub-text    { font-size: 12.5px; color: var(--muted); }
    .date-text   { font-size: 12px; color: var(--muted); }
    .subject-pill { background: var(--cream-warm); color: var(--forest); font-size: 11.5px; font-weight: 700; padding: 2px 10px; border-radius: 99px; }
    .contact-msg { font-size: 14px; color: var(--text); line-height: 1.7; white-space: pre-wrap; }
  `]
})
export class AdminContactsComponent implements OnInit {
  contactSvc = inject(ContactService);
  toast      = inject(ToastService);
  contacts   = signal<Contact[]>([]);
  loading    = signal(true);
  ngOnInit(): void {
    this.contactSvc.listAll().subscribe({
      next: (c: any) => { this.contacts.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
  unreadCount(): number { return this.contacts().filter((c: any) => !c.read).length; }
  markRead(contact: Contact): void {
    this.contactSvc.markAsRead(contact.id).subscribe({
      next: () => {
        this.contacts.update((list: any) => list.map((c: any) => c.id === contact.id ? { ...c, read: true } : c));
        this.toast.info('Mensagem marcada como lida.');
      },
      error: (err: any) => this.toast.handleError(err)
    });
  }
}
