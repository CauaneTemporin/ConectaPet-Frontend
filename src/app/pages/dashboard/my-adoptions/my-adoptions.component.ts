import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdoptionService } from '../../../core/services/api.services';
import { Adoption } from '../../../shared/models';

@Component({
  selector: 'app-my-adoptions',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe, DatePipe],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Minhas Adoções</h2>
      <a routerLink="/animais" class="btn btn-teal btn-sm">+ Nova adoção</a>
    </div>
    @if (loading()) {
      <div class="loading-row"><div class="spin"></div></div>
    } @else if (adoptions().length === 0) {
      <div class="empty-state">
        <div class="icon">🐾</div>
        <h3>Nenhuma adoção ainda</h3>
        <p>Encontre seu companheiro ideal!</p>
        <a routerLink="/animais" class="btn btn-teal" style="margin-top:1rem">Ver animais disponíveis</a>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Animal</th><th>Espécie</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>
            @for (a of adoptions(); track a.id) {
              <tr>
                <td><strong>{{ a.animalName }}</strong></td>
                <td>{{ a.animalSpecies | titlecase }}</td>
                <td><span class="status-pill" [ngClass]="'pill-' + a.status">{{ a.status | titlecase }}</span></td>
                <td>{{ a.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }
    .loading-row { display: flex; justify-content: center; padding: 3rem; }
    .spin { width: 32px; height: 32px; border: 3px solid rgba(168,216,168,0.4); border-top-color: var(--teal-dark); border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MyAdoptionsComponent implements OnInit {
  adoptionSvc = inject(AdoptionService);
  adoptions   = signal<Adoption[]>([]);
  loading     = signal(true);
  ngOnInit(): void {
    this.adoptionSvc.mine().subscribe({
      next: (a: any) => { this.adoptions.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
