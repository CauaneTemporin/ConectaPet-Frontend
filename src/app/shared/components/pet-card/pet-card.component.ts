import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Animal } from '../../models';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  template: `
    <div class="pet-card" (click)="goToDetail()">
      <div class="pet-card-img" [ngClass]="bgClass">
        <span class="pet-status" [ngClass]="statusClass">{{ statusLabel }}</span>
        @if (isUrl) {
          <img [src]="animal.photoUrl" alt="{{ animal.name }}" class="pet-photo-img">
        } @else {
          {{ emoji }}
        }
      </div>
      <div class="pet-card-body">
        <div class="pet-card-header">
          <span class="pet-name">{{ animal.name }}</span>
          @if (showActions) {
            <span class="pet-icons">
              <button (click)="$event.stopPropagation(); onEdit.emit(animal)" title="Editar">✏️</button>
              <button (click)="$event.stopPropagation(); onDelete.emit(animal.id)" title="Remover">🗑️</button>
            </span>
          }
        </div>
        <div class="pet-desc">{{ animal.description || 'Ideal para famílias ativas.' }}</div>
        <div class="pet-chips">
          @if (animal.vaccinated) { <span class="chip chip-teal">Vacinado</span> }
          @if (animal.neutered)   { <span class="chip chip-forest">Castrado</span> }
          @if (animal.size)       { <span class="chip chip-rose">{{ animal.size | titlecase }}</span> }
        </div>
        @if (mode === 'adopt' && animal.status === 'disponivel') {
          <button class="btn btn-teal pet-btn" (click)="$event.stopPropagation(); onAdopt.emit(animal)">Quero adotar</button>
        } @else if (mode === 'godparent' && animal.status === 'disponivel') {
          <button class="btn btn-rose pet-btn" (click)="$event.stopPropagation(); onGodparent.emit(animal)">Apadrinhar ⭐</button>
        } @else {
          <span class="status-pill" [ngClass]="'pill-' + animal.status">{{ statusLabel }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .pet-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; cursor: pointer; }
    .pet-card:hover { transform: translateY(-5px); box-shadow: 0 14px 40px rgba(0,0,0,0.1); }
    .pet-card-img { height: 155px; background: var(--teal-light); display: flex; align-items: center; justify-content: center; font-size: 4rem; position: relative; overflow: hidden; }
    .pet-photo-img { width: 100%; height: 100%; object-fit: cover; }
    .pet-card-img.rose-bg   { background: var(--rose-light); }
    .pet-card-img.cream-bg  { background: var(--cream-warm); }
    .pet-card-img.forest-bg { background: #E8F0EB; }
    .pet-status { position: absolute; top: 10px; right: 10px; background: var(--teal); color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em; }
    .pet-status.rose { background: var(--rose); }
    .pet-status.gray { background: var(--muted); }
    .pet-card-body { padding: 1rem 1.1rem 1.1rem; }
    .pet-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
    .pet-name { font-weight: 800; font-size: 1rem; color: var(--forest); }
    .pet-icons { display: flex; gap: 5px; }
    .pet-icons button { font-size: 0.85rem; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; border: none; background: none; padding: 2px; }
    .pet-icons button:hover { opacity: 1; }
    .pet-desc { font-size: 12.5px; color: var(--muted); margin-bottom: 0.75rem; line-height: 1.5; }
    .pet-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 0.9rem; }
    .pet-btn { width: 100%; justify-content: center; font-size: 13px; padding: 0.5rem; border-radius: var(--r-sm); }
  `]
})
export class PetCardComponent {
  private router = inject(Router);

  @Input({ required: true }) animal!: Animal;
  @Input() mode: 'adopt' | 'godparent' | 'view' = 'adopt';
  @Input() showActions = false;
  @Input() index = 0;

  @Output() onAdopt     = new EventEmitter<Animal>();
  @Output() onGodparent = new EventEmitter<Animal>();
  @Output() onEdit      = new EventEmitter<Animal>();
  @Output() onDelete    = new EventEmitter<number>();

  private readonly BG_CLASSES = ['', 'rose-bg', 'cream-bg', 'forest-bg', ''];
  private readonly EMOJIS: Record<string, string> = { cachorro: '🐕', gato: '🐱', outro: '🐾' };

  goToDetail(): void { this.router.navigate(['/animais', this.animal.id]); }

  get bgClass(): string { return this.BG_CLASSES[this.index % this.BG_CLASSES.length]; }
  get isUrl(): boolean  { const p = this.animal.photoUrl ?? ''; return p.length > 4; }
  get emoji(): string   { return this.EMOJIS[this.animal.species] ?? '🐾'; }
  get statusLabel(): string {
    const labels: Record<string, string> = { disponivel: 'Disponível', adotado: 'Adotado', apadrinhado: 'Apadrinhado' };
    return labels[this.animal.status] ?? this.animal.status;
  }
  get statusClass(): string {
    return this.animal.status === 'disponivel' ? '' : this.animal.status === 'adotado' ? 'gray' : 'rose';
  }
}
