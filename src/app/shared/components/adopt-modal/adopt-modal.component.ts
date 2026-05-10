import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animal, AdoptionRequest } from '../../models';

@Component({
  selector: 'app-adopt-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="modal-backdrop" (click)="onClose.emit()">
        <div class="modal" (click)="$event.stopPropagation()">

          <div class="animal-header">
            <div class="animal-emoji">{{ emojiFor(animal?.species) }}</div>
            <div>
              <h3>{{ animal?.name }}</h3>
              <p>{{ animal?.breed || animal?.species }} · {{ animal?.ageYears }} anos</p>
            </div>
          </div>

          <h2>Solicitar Adoção</h2>

          <div class="form-field">
            <label class="form-label">Mensagem (opcional)</label>
            <textarea class="form-input" rows="4" [(ngModel)]="message"
              placeholder="Conte por que quer adotar, sua experiência com animais, tipo de moradia...">
            </textarea>
          </div>

          <p class="hint">Após enviar, nossa equipe entrará em contato em até 48h para agendar a entrevista.</p>

          <div class="modal-actions">
            <button class="btn btn-outline-teal" (click)="onClose.emit()" [disabled]="loading()">Cancelar</button>
            <button class="btn btn-teal" (click)="submit()" [disabled]="loading()">
              @if (loading()) { <span class="spin"></span> }
              🐾 Enviar Solicitação
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }
    .modal {
      background: white; border-radius: 24px; padding: 2.5rem;
      width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.25s ease;
    }
    .animal-header {
      display: flex; gap: 16px; align-items: center; margin-bottom: 1.5rem;
      h3 { font-weight: 800; font-size: 1.1rem; color: var(--forest); margin: 0; }
      p  { font-size: 13px; color: var(--muted); margin-top: 4px; }
    }
    .animal-emoji {
      font-size: 3.5rem; background: var(--teal-light);
      border-radius: 14px; width: 80px; height: 80px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    h2 { font-family: 'Lora', serif; font-size: 1.4rem; color: var(--forest); margin-bottom: 1.5rem; }
    .hint { font-size: 12.5px; color: var(--muted); line-height: 1.7; }
    .modal-actions {
      display: flex; gap: 12px; margin-top: 1.5rem;
      .btn { flex: 1; justify-content: center; }
    }
    .spin {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes fadeIn  { from { opacity: 0; }               to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes spin    { to { transform: rotate(360deg); } }
  `]
})
export class AdoptModalComponent {
  @Input() visible = false;
  @Input() animal: Animal | null = null;
  @Output() onClose  = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<Omit<AdoptionRequest, 'animalId'>>();

  message = '';
  loading = signal(false);

  emojiFor(species?: string): string {
    const map: Record<string, string> = { cachorro: '🐕', gato: '🐱', outro: '🐾' };
    return species ? (map[species] ?? '🐾') : '🐾';
  }

  submit(): void {
    this.onSubmit.emit({ message: this.message || undefined });
    this.message = '';
  }

  setLoading(v: boolean): void { this.loading.set(v); }
}
