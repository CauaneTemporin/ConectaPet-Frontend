import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteerService } from '../../../core/services/api.services';
import { ToastService } from '../../../core/services/toast.service';
import { Volunteer, SkillEntry } from '../../../shared/models';

@Component({
  selector: 'app-my-volunteer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-vol-page">
      <div class="page-header">
        <h2 class="page-title">Meu Voluntariado</h2>
        <p class="page-sub">Gerencie suas habilidades e disponibilidade como voluntário.</p>
      </div>

      @if (loading()) {
        <div class="state-box"><div class="spin-lg"></div></div>
      } @else if (!volunteer()) {
        <div class="state-box empty">
          <div class="state-icon">🙋‍♀️</div>
          <h3>Você ainda não é voluntário</h3>
          <p>Cadastre-se para começar a contribuir com os animais.</p>
          <div class="vol-form card">
            <p class="form-hint">Selecione as habilidades e marque os dias disponíveis para cada uma.</p>
            <div class="skill-form-list">
              @for (sk of allSkills; track sk.value) {
                <div class="skill-form-row" [class.active]="isSelectedNew(sk.value)">
                  <label class="skill-toggle">
                    <input type="checkbox" [checked]="isSelectedNew(sk.value)"
                      (change)="toggleSkillNew(sk.value)">
                    <span class="skill-toggle-label">{{ sk.emoji }} {{ sk.label }}</span>
                  </label>
                  @if (isSelectedNew(sk.value)) {
                    <div class="days-row">
                      <span class="days-label">Dias disponíveis:</span>
                      @for (day of weekDays; track day) {
                        <span class="day-pill" [class.on]="isNewDaySelected(sk.value, day)"
                              (click)="toggleNewDay(sk.value, day)">{{ day }}</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
            <div class="form-field" style="margin-top:1.25rem">
              <label class="form-label">Motivação (opcional)</label>
              <textarea class="form-input" [(ngModel)]="motivation" rows="3" placeholder="Por que quer ser voluntário?"></textarea>
            </div>
            <button class="btn btn-teal btn-full" style="padding:.7rem;margin-top:.75rem" (click)="register()" [disabled]="saving()">
              @if (saving()) { <span class="spin-inline"></span> } Cadastrar como voluntário
            </button>
          </div>
        </div>
      } @else {
        <div class="vol-profile card">
          <div class="status-row">
            <span class="status-badge" [class]="volunteer()!.status">{{ statusLabel() }}</span>
            @if (volunteer()!.status === 'PENDENTE') {
              <span class="status-hint">Aguardando aprovação do administrador</span>
            }
          </div>

          @if (editMode()) {
            <div class="resubmit-alert">⚠️ Ao salvar, sua solicitação será reenviada para aprovação.</div>
            <div class="skill-form-list">
              @for (sk of allSkills; track sk.value) {
                <div class="skill-form-row" [class.active]="isSelectedEdit(sk.value)">
                  <label class="skill-toggle">
                    <input type="checkbox" [checked]="isSelectedEdit(sk.value)"
                      (change)="toggleSkillEdit(sk.value)">
                    <span class="skill-toggle-label">{{ sk.emoji }} {{ sk.label }}</span>
                  </label>
                  @if (isSelectedEdit(sk.value)) {
                    <div class="days-row">
                      <span class="days-label">Dias disponíveis:</span>
                      @for (day of weekDays; track day) {
                        <span class="day-pill" [class.on]="isEditDaySelected(sk.value, day)"
                              (click)="toggleEditDay(sk.value, day)">{{ day }}</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
            <div class="form-field" style="margin-top:1.25rem">
              <label class="form-label">Motivação (opcional)</label>
              <textarea class="form-input" [(ngModel)]="motivation" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-outline-teal" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-teal" (click)="saveEdit()" [disabled]="saving()">
                @if (saving()) { <span class="spin-inline"></span> } Salvar alterações
              </button>
            </div>
          } @else if (cancelMode()) {
            <div class="cancel-panel">
              <div class="cancel-title">Selecione as habilidades que deseja remover:</div>
              <div class="cancel-list">
                @for (entry of parseEntries(volunteer()!.skills); track entry.skill) {
                  <label class="cancel-row" [class.selected]="isSkillToRemove(entry.skill)">
                    <input type="checkbox" [checked]="isSkillToRemove(entry.skill)"
                      (change)="toggleSkillToRemove(entry.skill)">
                    <span class="entry-emoji">{{ emojiFor(entry.skill) }}</span>
                    <span>{{ labelFor(entry.skill) }}</span>
                  </label>
                }
              </div>
              <div class="cancel-actions">
                <button class="btn btn-outline-teal" (click)="closeCancelMode()">Voltar</button>
                <button class="btn-danger" (click)="confirmRemove()" [disabled]="!skillsToRemove.length || saving()">
                  @if (saving()) { <span class="spin-inline"></span> }
                  Remover selecionadas
                </button>
              </div>
            </div>
          } @else {
            <div class="skill-entries-view">
              @for (entry of parseEntries(volunteer()!.skills); track entry.skill) {
                <div class="entry-row">
                  <div class="entry-skill">
                    <span class="entry-emoji">{{ emojiFor(entry.skill) }}</span>
                    {{ labelFor(entry.skill) }}
                  </div>
                  <div class="entry-avail">
                    @if (entry.availability.length) {
                      <div class="days-display">
                        @for (day of entry.availability; track day) {
                          <span class="day-tag">{{ day }}</span>
                        }
                      </div>
                    } @else {
                      <span class="muted-dash">—</span>
                    }
                  </div>
                </div>
              }
            </div>
            @if (volunteer()!.motivation) {
              <div class="motivation-box">
                <div class="info-label">Motivação</div>
                <div class="info-val">{{ volunteer()!.motivation }}</div>
              </div>
            }
            <div class="info-item" style="margin-bottom:1.5rem">
              <div class="info-label">Cadastro em</div>
              <div class="info-val">{{ volunteer()!.createdAt | date:'dd/MM/yyyy' }}</div>
            </div>
            <div class="profile-actions">
              <button class="btn btn-outline-teal" (click)="startEdit()">✏️ Editar perfil</button>
              <button class="btn-danger" (click)="openCancelMode()">🗑️ Remover habilidades</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-vol-page { max-width: 680px; }
    .page-title { font-family: 'Lora', serif; font-size: 1.6rem; color: var(--forest); margin-bottom: .25rem; }
    .page-sub   { font-size: 14px; color: var(--muted); margin-bottom: 2rem; }
    .card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 2rem; }
    .state-box { text-align: center; padding: 2rem 1rem; }
    .state-box.empty .state-icon { font-size: 3rem; margin-bottom: 1rem; }
    .state-box h3 { font-family: 'Lora', serif; font-size: 1.3rem; color: var(--forest); }
    .state-box p  { color: var(--muted); font-size: 14px; margin: .5rem 0 1.5rem; }
    .vol-form.card { text-align: left; margin-top: 1.5rem; }
    .form-hint { font-size: 13px; color: var(--muted); margin-bottom: 1.25rem; }

    .status-row { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .status-badge { padding: 4px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
    .status-badge.PENDENTE  { background: #fef3c7; color: #92400e; }
    .status-badge.APROVADO  { background: var(--teal-light); color: var(--teal-dark); }
    .status-badge.REJEITADO { background: #fee2e2; color: #991b1b; }
    .status-hint { font-size: 13px; color: var(--muted); }

    .skill-entries-view { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.25rem; }
    .entry-row { display: grid; grid-template-columns: 180px 1fr auto; align-items: center; background: var(--cream); border-radius: var(--r-sm); padding: .75rem 1rem; gap: 1rem; }
    .btn-remove-skill { background: none; border: none; color: var(--muted); font-size: 13px; cursor: pointer; padding: 2px 6px; border-radius: var(--r-sm); transition: background .15s, color .15s; &:hover { background: #fee2e2; color: #991b1b; } }
    .entry-skill { font-weight: 700; font-size: 14px; color: var(--forest); display: flex; align-items: center; gap: 8px; }
    .entry-emoji { font-size: 1.2rem; }
    .entry-avail { font-size: 13px; color: var(--muted); }
    .days-display { display: flex; flex-wrap: wrap; gap: 3px; }
    .day-tag { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: var(--teal-light); color: var(--teal-dark); }
    .muted-dash { color: var(--muted); }
    .motivation-box { background: var(--cream); border-radius: var(--r-sm); padding: 1rem; margin-bottom: 1rem; }
    .info-item { background: var(--cream); border-radius: var(--r-sm); padding: 1rem; }
    .info-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
    .info-val   { font-size: 14px; font-weight: 700; color: var(--forest); }
    .profile-actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .skill-form-list { display: flex; flex-direction: column; gap: 8px; }
    .skill-form-row { border: 1.5px solid var(--border); border-radius: var(--r-sm); overflow: hidden; transition: border-color .2s; &.active { border-color: var(--teal); } }
    .skill-toggle { display: flex; align-items: center; gap: 10px; padding: .75rem 1rem; cursor: pointer; input { width: 16px; height: 16px; accent-color: var(--teal); cursor: pointer; } }
    .skill-toggle-label { font-size: 14px; font-weight: 600; color: var(--forest); }
    .days-row { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; padding: .55rem 1rem .65rem; border-top: 1px solid var(--border); background: #f5faf8; }
    .days-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-right: 4px; }
    .day-pill { padding: 4px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border); background: white; color: var(--muted); transition: all .15s; user-select: none; &.on { background: var(--teal); border-color: var(--teal); color: white; } &:hover { border-color: var(--teal); color: var(--teal-dark); } }

    .cancel-panel { background: #fff8f8; border: 1.5px solid #fca5a5; border-radius: var(--r-sm); padding: 1.25rem; margin-bottom: 1rem; }
    .cancel-title { font-size: 13.5px; font-weight: 700; color: #991b1b; margin-bottom: 1rem; }
    .cancel-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.25rem; }
    .cancel-row { display: flex; align-items: center; gap: 10px; padding: .65rem 1rem; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: white; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--forest); transition: border-color .15s, background .15s; input { width: 16px; height: 16px; accent-color: #dc2626; cursor: pointer; } &.selected { border-color: #fca5a5; background: #fff1f1; } &:hover { border-color: #fca5a5; } }
    .cancel-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .resubmit-alert { background: #fef3c7; color: #92400e; border-radius: var(--r-sm); padding: .7rem 1rem; font-size: 13px; font-weight: 600; margin-bottom: 1.25rem; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 1.25rem; }
    .btn-full { width: 100%; justify-content: center; }
    .btn-danger { padding: .55rem 1.1rem; border-radius: var(--r-sm); background: #fee2e2; color: #991b1b; border: 1.5px solid #fca5a5; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; display: flex; align-items: center; gap: 6px; transition: background .2s; &:hover { background: #fca5a5; } &:disabled { opacity: .5; cursor: not-allowed; } }
    .spin-lg { width: 36px; height: 36px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto; }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 500px) { .entry-row { grid-template-columns: 1fr; } }
  `]
})
export class MyVolunteerComponent implements OnInit {
  private volunteerSvc = inject(VolunteerService);
  private toast        = inject(ToastService);

  volunteer      = signal<Volunteer | null>(null);
  loading        = signal(true);
  saving         = signal(false);
  editMode       = signal(false);
  cancelMode     = signal(false);
  motivation     = '';
  skillsToRemove: string[] = [];

  newSelectedSkills: string[] = [];
  newAvailMap: Record<string, string[]> = {};
  editSelectedSkills: string[] = [];
  availMap: Record<string, string[]> = {};

  readonly weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  readonly allSkills = [
    { value: 'fotografia',     label: 'Fotografia',     emoji: '📸' },
    { value: 'transporte',     label: 'Transporte',     emoji: '🚗' },
    { value: 'lar_temporario', label: 'Lar temporário', emoji: '🏠' },
    { value: 'divulgacao',     label: 'Divulgação',     emoji: '📢' },
    { value: 'veterinaria',    label: 'Veterinária',    emoji: '🩺' },
  ];

  ngOnInit(): void {
    this.volunteerSvc.mine().subscribe({
      next: (v: any) => { this.volunteer.set(v); this.loading.set(false); },
      error: (err: any) => { if (err.status === 404) this.volunteer.set(null); this.loading.set(false); }
    });
  }

  isSelectedNew(val: string): boolean  { return this.newSelectedSkills.includes(val); }
  isSelectedEdit(val: string): boolean { return this.editSelectedSkills.includes(val); }
  emojiFor(skill: string): string { return this.allSkills.find(s => s.value === skill)?.emoji ?? '🐾'; }
  labelFor(skill: string): string { return this.allSkills.find(s => s.value === skill)?.label ?? skill; }
  statusLabel(): string { return { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REJEITADO: 'Rejeitado' }[this.volunteer()?.status ?? ''] ?? ''; }

  isNewDaySelected(skill: string, day: string): boolean  { return (this.newAvailMap[skill] ?? []).includes(day); }
  isEditDaySelected(skill: string, day: string): boolean { return (this.availMap[skill] ?? []).includes(day); }

  toggleNewDay(skill: string, day: string): void {
    const curr = this.newAvailMap[skill] ?? [];
    this.newAvailMap = { ...this.newAvailMap, [skill]: curr.includes(day) ? curr.filter(d => d !== day) : [...curr, day] };
  }

  toggleEditDay(skill: string, day: string): void {
    const curr = this.availMap[skill] ?? [];
    this.availMap = { ...this.availMap, [skill]: curr.includes(day) ? curr.filter(d => d !== day) : [...curr, day] };
  }

  parseEntries(raw: string): SkillEntry[] {
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p.map((e: any) => ({
        skill: e.skill,
        availability: Array.isArray(e.availability) ? e.availability
          : (e.availability ? String(e.availability).split(',').filter(Boolean) : [])
      }));
    } catch {}
    return raw.split(',').map(s => ({ skill: s.trim(), availability: [] })).filter(e => e.skill);
  }

  private toRequest(skills: string[], map: Record<string, string[]>) {
    return { skills: JSON.stringify(skills.map(s => ({ skill: s, availability: map[s] ?? [] }))), motivation: this.motivation || undefined };
  }

  toggleSkillNew(val: string): void {
    if (this.newSelectedSkills.includes(val)) {
      this.newSelectedSkills = this.newSelectedSkills.filter(s => s !== val);
      const m = { ...this.newAvailMap }; delete m[val]; this.newAvailMap = m;
    } else { this.newSelectedSkills = [...this.newSelectedSkills, val]; }
  }

  toggleSkillEdit(val: string): void {
    if (this.editSelectedSkills.includes(val)) {
      this.editSelectedSkills = this.editSelectedSkills.filter(s => s !== val);
      const m = { ...this.availMap }; delete m[val]; this.availMap = m;
    } else { this.editSelectedSkills = [...this.editSelectedSkills, val]; }
  }

  register(): void {
    if (!this.newSelectedSkills.length) { this.toast.error('Selecione ao menos uma habilidade.'); return; }
    this.saving.set(true);
    this.volunteerSvc.register(this.toRequest(this.newSelectedSkills, this.newAvailMap)).subscribe({
      next: (v: any) => { this.volunteer.set(v); this.saving.set(false); this.toast.success('Cadastro realizado! Aguardando aprovação. 🙋'); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  startEdit(): void {
    const entries = this.parseEntries(this.volunteer()!.skills);
    this.editSelectedSkills = entries.map(e => e.skill);
    this.availMap = {};
    entries.forEach(e => { this.availMap[e.skill] = e.availability; });
    this.motivation = this.volunteer()!.motivation ?? '';
    this.editMode.set(true);
  }

  openCancelMode(): void { this.skillsToRemove = []; this.cancelMode.set(true); }
  closeCancelMode(): void { this.skillsToRemove = []; this.cancelMode.set(false); }
  isSkillToRemove(skill: string): boolean { return this.skillsToRemove.includes(skill); }
  toggleSkillToRemove(skill: string): void {
    this.skillsToRemove = this.skillsToRemove.includes(skill)
      ? this.skillsToRemove.filter(s => s !== skill)
      : [...this.skillsToRemove, skill];
  }
  confirmRemove(): void {
    const v = this.volunteer();
    if (!v || !this.skillsToRemove.length) return;
    const remaining = this.parseEntries(v.skills).filter(e => !this.skillsToRemove.includes(e.skill));
    if (!remaining.length) {
      if (!confirm('Isso removerá todas as habilidades e cancelará seu voluntariado. Confirmar?')) return;
      this.deleteVolunteer(); return;
    }
    this.saving.set(true);
    const req = { skills: JSON.stringify(remaining.map(e => ({ skill: e.skill, availability: e.availability }))), motivation: v.motivation || undefined };
    this.volunteerSvc.update(v.id, req).subscribe({
      next: (updated: any) => { this.volunteer.set(updated); this.cancelMode.set(false); this.skillsToRemove = []; this.saving.set(false); this.toast.success('Habilidade(s) removida(s).'); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  removeSkill(skill: string): void {
    const v = this.volunteer();
    if (!v) return;
    const remaining = this.parseEntries(v.skills).filter(e => e.skill !== skill);
    if (!remaining.length) {
      this.toast.info('É necessário ter ao menos uma habilidade. Use "Editar" para alterar.');
      return;
    }
    if (!confirm(`Remover "${this.labelFor(skill)}"?`)) return;
    this.saving.set(true);
    const req = { skills: JSON.stringify(remaining.map(e => ({ skill: e.skill, availability: e.availability }))), motivation: v.motivation || undefined };
    this.volunteerSvc.update(v.id, req).subscribe({
      next: (updated: any) => { this.volunteer.set(updated); this.saving.set(false); this.toast.success('Habilidade removida.'); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  cancelEdit(): void { this.editMode.set(false); }

  saveEdit(): void {
    const v = this.volunteer();
    if (!v || !this.editSelectedSkills.length) { this.toast.error('Selecione ao menos uma habilidade.'); return; }
    this.saving.set(true);
    this.volunteerSvc.update(v.id, this.toRequest(this.editSelectedSkills, this.availMap)).subscribe({
      next: (updated: any) => { this.volunteer.set(updated); this.editMode.set(false); this.saving.set(false); this.toast.success('Perfil atualizado! Aguardando nova aprovação. 🙋'); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  deleteVolunteer(): void {
    const v = this.volunteer();
    if (!v || !confirm('Deseja realmente cancelar seu voluntariado?')) return;
    this.saving.set(true);
    this.volunteerSvc.delete(v.id).subscribe({
      next: () => { this.volunteer.set(null); this.newSelectedSkills = []; this.newAvailMap = {}; this.motivation = ''; this.saving.set(false); this.toast.success('Voluntariado cancelado.'); },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }
}
