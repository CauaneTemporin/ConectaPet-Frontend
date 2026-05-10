import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerService } from '../../../core/services/spinner.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (spinner.loading()) {
      <div class="overlay">
        <div class="box">
          <div class="spin"></div>
          <p>Carregando...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.25);
      z-index: 500;
      display: flex; align-items: center; justify-content: center;
    }
    .box {
      background: white; border-radius: 14px;
      padding: 2rem 2.5rem; text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
    .box p { font-weight: 600; color: var(--forest); margin-top: 1rem; font-family: 'Nunito', sans-serif; }
    .spin {
      width: 36px; height: 36px;
      border: 3px solid rgba(0,168,150,0.3);
      border-top-color: var(--teal);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SpinnerComponent {
  spinner = inject(SpinnerService);
}
