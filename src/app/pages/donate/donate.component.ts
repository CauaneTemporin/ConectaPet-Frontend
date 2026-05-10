import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonationService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { DonationStats } from '../../shared/models';

@Component({
  selector: 'app-donate',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <div class="page-enter">
      <section class="section">
        <div class="section-tag rose">Faça a diferença</div>
        <h2 class="section-title">Como Doar</h2>
        <p class="section-sub">Sua doação cobre vacinas, castração, ração e cuidados veterinários para animais que esperam por um lar.</p>

        <div class="donate-wrap">
          <div class="donate-form-card">
            <div class="form-field">
              <label class="form-label">Valor (R$)</label>
              <input class="form-input" type="number" min="1" [(ngModel)]="customAmount"
                (ngModelChange)="onCustomAmount()" placeholder="R$ 0,00">
            </div>
            <div class="form-field"><label class="form-label">Nome completo</label><input class="form-input" [(ngModel)]="donorName" placeholder="Seu nome"></div>
            <div class="form-field"><label class="form-label">E-mail</label><input class="form-input" type="email" [(ngModel)]="donorEmail" placeholder="seu@email.com"></div>
            <div class="form-field"><label class="form-label">Mensagem (opcional)</label><input class="form-input" [(ngModel)]="donorMessage" placeholder="Parabéns pelo excelente trabalho!"></div>
            <button class="btn btn-rose btn-full" style="padding:.75rem;font-size:15px;margin-top:1.5rem"
              (click)="submitDonation()" [disabled]="loading()">
              @if (loading()) { <span class="spin-inline"></span> } ♥ Confirmar doação
            </button>
          </div>

          <div class="donate-info-card">
            <h3>Seu impacto real</h3>
            <p>Veja o que cada valor faz pelos animais em nossos abrigos parceiros.</p>
            <div class="impact-list">
              <div class="impact-item"><div class="imp-icon">💉</div><div><strong>R$ 15/mês</strong><span>Vacina antirrábica para 1 animais</span></div></div>
              <div class="impact-item"><div class="imp-icon">🥣</div><div><strong>R$ 45/mês</strong><span>Ração por 30 dias para 2 pets</span></div></div>
              <div class="impact-item"><div class="imp-icon">✂️</div><div><strong>R$ 150/mês</strong><span>Castração de 1 animal</span></div></div>
              <div class="impact-item"><div class="imp-icon">🏥</div><div><strong>R$ 180/mês</strong><span>Cuidado veterinário completo</span></div></div>
            </div>
            <div class="stats-box">
              <div class="stats-label">Total arrecadado</div>
              <div class="stats-value">{{ statsTotal() }}</div>
              <div class="stats-donors">{{ stats() ? stats()!.totalDonations + ' doações realizadas' : 'carregando...' }}</div>
            </div>
            <p class="legal">ONG registrada · CNPJ 00.000.000/0001-00<br>100% das doações vão para os animais.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- MODAL PIX -->
    @if (pixModalVisible()) {
      <div class="pix-overlay" (click)="closePixModal()">
        <div class="pix-modal" (click)="$event.stopPropagation()">
          <button class="pix-close" (click)="closePixModal()">✕</button>

          <h3 class="pix-title">Pagamento via PIX</h3>
          <p class="pix-subtitle">Escaneie o QR Code abaixo para concluir sua doação de <strong>{{ pendingAmount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong></p>

          <img src="assets/pagamento.jpeg" alt="QR Code PIX" class="pix-qr">

          <div class="timer-wrap">
            <div class="timer-label">
              @if (!timerDone()) {
                ⏳ Aguardando confirmação...
              } @else {
                ✅ Pagamento confirmado!
              }
            </div>

            <div class="timer-clock">{{ timerMinutes }}:{{ timerSecs }}</div>

            <div class="timer-bar-bg">
              <div class="timer-bar-fill" [style.width.%]="timerProgress"></div>
            </div>
          </div>

          @if (loading()) {
            <div class="pix-loading"><span class="spin-inline"></span> Registrando doação...</div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .donate-wrap { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: start; }
    .donate-form-card { background: white; border-radius: var(--r); border: 1.5px solid var(--border); padding: 2rem; }
    .donate-form-card h3 { font-weight: 800; font-size: 1.05rem; color: var(--forest); margin-bottom: 1.25rem; }
    .donate-amounts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
    .freq-btns      { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
    .method-btns    { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .hint { font-size: 11.5px; color: var(--muted); text-align: center; margin-top: 0.6rem; }
    .donate-info-card { background: var(--teal); border-radius: var(--r); padding: 2rem; color: var(--teal-dark); }
    .donate-info-card h3 { font-family: 'Lora', serif; font-size: 1.4rem; margin-bottom: 0.75rem; }
    .donate-info-card p  { font-size: 13.5px; line-height: 1.85; color: var(--muted); margin-bottom: 1.5rem; }
    .impact-list { display: flex; flex-direction: column; gap: 1rem; }
    .impact-item { display: flex; align-items: flex-start; gap: 12px; }
    .impact-item strong { display: block; font-size: 13.5px; }
    .impact-item span   { font-size: 12px; color: var(--muted); }
    .imp-icon { width: 38px; height: 38px; background: rgba(46,74,46,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .stats-box { margin-top: 1.75rem; background: rgba(46,74,46,0.08); border-radius: var(--r-sm); padding: 1.25rem; }
    .stats-label  { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .stats-value  { font-family: 'Lora', serif; font-size: 2rem; font-weight: 600; color: var(--teal-dark); }
    .stats-donors { font-size: 12.5px; color: var(--muted); margin-top: 4px; }
    .legal { font-size: 12px; margin-top: 1.25rem; color: var(--muted); line-height: 1.8; }
    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) { .donate-wrap { grid-template-columns: 1fr; } }

    /* PIX MODAL */
    .pix-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem;
    }
    .pix-modal {
      background: white; border-radius: var(--r); padding: 2rem;
      max-width: 420px; width: 100%; position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      text-align: center;
    }
    .pix-close {
      position: absolute; top: 14px; right: 14px;
      background: none; border: none; font-size: 1.1rem;
      cursor: pointer; color: var(--muted); line-height: 1;
    }
    .pix-title { font-family: 'Lora', serif; font-size: 1.4rem; color: var(--forest); margin-bottom: .5rem; }
    .pix-subtitle { font-size: 13.5px; color: var(--muted); margin-bottom: 1.25rem; line-height: 1.6; }
    .pix-qr {
      width: 220px; height: 220px; object-fit: contain;
      border: 2px solid var(--border); border-radius: var(--r-sm);
      margin-bottom: 1.5rem;
    }
    .timer-wrap { background: var(--teal-light); border-radius: var(--r-sm); padding: 1rem; }
    .timer-label { font-size: 13px; font-weight: 700; color: var(--forest); margin-bottom: .5rem; }
    .timer-clock {
      font-family: 'Lora', serif; font-size: 2.4rem;
      font-weight: 700; color: var(--teal-dark); letter-spacing: 2px;
      margin-bottom: .75rem;
    }
    .timer-bar-bg { background: rgba(0,0,0,0.1); border-radius: 99px; height: 8px; overflow: hidden; }
    .timer-bar-fill {
      height: 100%; background: var(--teal-dark); border-radius: 99px;
      transition: width 1s linear;
    }
    .pix-loading { margin-top: 1rem; font-size: 13px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 8px; }
  `]
})
export class DonateComponent implements OnInit, OnDestroy {
  private donationSvc = inject(DonationService);
  private toast       = inject(ToastService);
  auth                = inject(AuthService);

  amount        = 50;
  customAmount  = '';
  donorName     = '';
  donorEmail    = '';
  donorMessage  = '';
  loading       = signal(false);
  stats         = signal<DonationStats | null>(null);

  pixModalVisible = signal(false);
  timerSeconds    = signal(300); // 5 min
  timerDone       = signal(false);
  pendingAmount   = 0;

  private intervalId: any = null;
  private readonly TOTAL_SECONDS = 300;

  ngOnInit(): void {
    this.donationSvc.stats().subscribe({ next: (s: any) => this.stats.set(s), error: () => {} });
    const u = this.auth.currentUser();
    if (u) { this.donorName = u.name; this.donorEmail = u.email; }
  }

  ngOnDestroy(): void { this.clearTimer(); }

  setAmount(v: number): void { this.amount = v; this.customAmount = ''; }
  onCustomAmount(): void { if (this.customAmount) this.amount = 0; }

  statsTotal(): string {
    const s = this.stats();
    if (!s) return 'Carregando...';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.totalAmount);
  }

  get timerMinutes(): string {
    return String(Math.floor(this.timerSeconds() / 60)).padStart(2, '0');
  }
  get timerSecs(): string {
    return String(this.timerSeconds() % 60).padStart(2, '0');
  }
  get timerProgress(): number {
    return ((this.TOTAL_SECONDS - this.timerSeconds()) / this.TOTAL_SECONDS) * 100;
  }

  openPixModal(): void {
    const val = this.customAmount ? Number(this.customAmount) : this.amount;
    if (!val || val <= 0) { this.toast.error('Informe um valor válido.'); return; }
    if (!this.donorName || !this.donorEmail) { this.toast.error('Nome e e-mail são obrigatórios.'); return; }

    this.pendingAmount = val;
    this.timerSeconds.set(this.TOTAL_SECONDS);
    this.timerDone.set(false);
    this.pixModalVisible.set(true);
    this.startTimer();
  }

  closePixModal(): void {
    this.pixModalVisible.set(false);
    this.clearTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.intervalId = setInterval(() => {
      const curr = this.timerSeconds();
      if (curr <= 1) {
        this.timerSeconds.set(0);
        this.timerDone.set(true);
        this.clearTimer();
        this.confirmDonation();
      } else {
        this.timerSeconds.set(curr - 1);
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  private confirmDonation(): void {
    this.loading.set(true);
    this.donationSvc.donate({
      amount: this.pendingAmount,
      name: this.donorName,
      email: this.donorEmail,
      message: this.donorMessage || undefined
    }).subscribe({
      next: () => {
        this.toast.success('Doação confirmada! Obrigado pelo apoio. 🐾');
        this.donationSvc.stats().subscribe({ next: (s: any) => this.stats.set(s) });
        this.loading.set(false);
        this.pixModalVisible.set(false);
        this.donorMessage = ''; this.customAmount = '';
      },
      error: (err: any) => { this.toast.handleError(err); this.loading.set(false); }
    });
  }

  submitDonation(): void { this.openPixModal(); }
}