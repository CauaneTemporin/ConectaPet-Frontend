import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OngService } from '../../../../core/services/api.services';
import { OngContextService } from '../../../../core/services/ong-context.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-header">
      <h2 class="dash-title">Configurações</h2>
    </div>

    @if (!ongId()) {
      <div class="empty-state">
        <div class="icon">⚙️</div>
        <h3>Nenhuma ONG selecionada</h3>
        <p>Selecione uma ONG no painel para configurar.</p>
      </div>
    } @else {

      <div class="config-card">
        <div class="config-card-header">
          <div class="config-icon">💳</div>
          <div>
            <h3 class="config-title">QR Code PIX para doações</h3>
            <p class="config-desc">Faça upload da imagem do QR Code PIX. Ela será exibida no modal de pagamento quando um doador clicar em "Confirmar doação".</p>
          </div>
        </div>

        <!-- Drop zone -->
        <div class="drop-zone" [class.has-image]="preview()"
          (dragover)="$event.preventDefault()" (drop)="onDrop($event)"
          (click)="fileInput.click()">
          @if (preview()) {
            <img [src]="preview()!" alt="QR Code PIX" class="drop-preview">
            <div class="drop-overlay">
              <span>Clique ou arraste para trocar</span>
            </div>
          } @else {
            <div class="drop-placeholder">
              <div class="drop-icon">📁</div>
              <strong>Clique ou arraste a imagem aqui</strong>
              <span>PNG, JPG ou WEBP · máx. 2 MB</span>
            </div>
          }
        </div>

        <input #fileInput type="file" accept="image/png,image/jpeg,image/webp"
          style="display:none" (change)="onFileChange($event)">

        @if (sizeError()) {
          <div class="upload-error">⚠️ Arquivo muito grande. Máximo 2 MB.</div>
        }

        @if (preview()) {
          <div class="file-info">
            <span class="file-name">{{ fileName() }}</span>
            <button class="btn-remove" (click)="removeImage()">✕ Remover</button>
          </div>
        }

        <div class="config-actions">
          <button class="btn btn-teal" (click)="salvar()" [disabled]="saving() || (!preview() && !hasExisting())">
            @if (saving()) { <span class="spin-inline"></span> } Salvar configuração
          </button>
          @if (hasExisting() && preview()) {
            <button class="btn-link-danger" (click)="removerQr()">Remover QR Code salvo</button>
          }
        </div>
      </div>

    }
  `,
  styles: [`
    .panel-header { margin-bottom: 1.5rem; }
    .dash-title { font-family: 'Lora', serif; color: var(--forest); font-size: 1.5rem; }

    .config-card {
      background: white; border-radius: var(--r);
      border: 1.5px solid var(--border); padding: 1.75rem;
      max-width: 560px;
    }
    .config-card-header {
      display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;
    }
    .config-icon {
      font-size: 1.75rem; width: 48px; height: 48px; flex-shrink: 0;
      background: var(--teal-light); border-radius: var(--r-sm);
      display: flex; align-items: center; justify-content: center;
    }
    .config-title { font-weight: 800; font-size: 1rem; color: var(--forest); margin-bottom: 4px; }
    .config-desc  { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* Drop zone */
    .drop-zone {
      border: 2px dashed var(--border); border-radius: var(--r);
      cursor: pointer; transition: border-color .2s, background .2s;
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      min-height: 180px; margin-bottom: 1rem;
      &:hover { border-color: var(--teal); background: var(--teal-light); }
      &.has-image { border-style: solid; }
    }
    .drop-placeholder {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px; padding: 2rem; text-align: center;
      strong { font-size: 14px; color: var(--forest); }
      span   { font-size: 12px; color: var(--muted); }
    }
    .drop-icon { font-size: 2.5rem; margin-bottom: 4px; }
    .drop-preview { max-width: 220px; max-height: 220px; object-fit: contain; display: block; padding: 1rem; }
    .drop-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s;
      color: white; font-size: 13px; font-weight: 700;
      .drop-zone:hover & { opacity: 1; }
    }

    .upload-error { font-size: 13px; color: #dc2626; margin-bottom: .75rem; }

    .file-info {
      display: flex; align-items: center; gap: 12px;
      background: var(--cream); border-radius: var(--r-sm); padding: .6rem 1rem;
      margin-bottom: 1rem;
    }
    .file-name { font-size: 13px; color: var(--forest); font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-remove { background: none; border: none; color: #dc2626; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }

    .config-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .btn-link-danger { background: none; border: none; color: #dc2626; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: underline; }

    .spin-inline { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15); border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 1rem; }
    .empty-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { font-family: 'Lora', serif; font-size: 1.4rem; color: var(--forest); }
    .empty-state p  { color: var(--muted); font-size: 14px; margin-top: .5rem; }
  `]
})
export class AdminConfigComponent implements OnInit {
  private ongSvc  = inject(OngService);
  private ongCtx  = inject(OngContextService);
  private toast   = inject(ToastService);

  ongId       = this.ongCtx.selectedOngId;
  preview     = signal<string | null>(null);
  fileName    = signal('');
  sizeError   = signal(false);
  saving      = signal(false);
  hasExisting = signal(false);

  private readonly MAX_BYTES = 2 * 1024 * 1024; // 2 MB

  ngOnInit(): void {
    const id = this.ongId();
    if (!id) return;
    this.ongSvc.buscarPorId(id).subscribe({
      next: (ong) => {
        if (ong.pixQrCodeUrl) {
          this.preview.set(ong.pixQrCodeUrl);
          this.hasExisting.set(true);
          this.fileName.set('QR Code salvo');
        }
      },
      error: () => {}
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    this.sizeError.set(false);
    if (file.size > this.MAX_BYTES) { this.sizeError.set(true); return; }
    this.fileName.set(file.name);
    const reader = new FileReader();
    reader.onload = (e) => { this.preview.set(e.target?.result as string); };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.preview.set(null);
    this.fileName.set('');
    this.sizeError.set(false);
  }

  salvar(): void {
    const id = this.ongId();
    if (!id) return;
    this.saving.set(true);
    this.ongSvc.atualizarPerfil(id, { pixQrCodeUrl: this.preview() ?? '' }).subscribe({
      next: () => {
        this.toast.success('QR Code PIX salvo com sucesso!');
        this.hasExisting.set(!!this.preview());
        this.saving.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }

  removerQr(): void {
    const id = this.ongId();
    if (!id) return;
    this.saving.set(true);
    this.ongSvc.atualizarPerfil(id, { pixQrCodeUrl: '' }).subscribe({
      next: () => {
        this.toast.success('QR Code removido.');
        this.preview.set(null);
        this.fileName.set('');
        this.hasExisting.set(false);
        this.saving.set(false);
      },
      error: (err: any) => { this.toast.handleError(err); this.saving.set(false); }
    });
  }
}
