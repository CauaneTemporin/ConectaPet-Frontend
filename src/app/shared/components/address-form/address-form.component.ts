import {
  Component, Input, Output, EventEmitter,
  inject, signal, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface EnderecoFormData {
  estado: string;
  cidade: string;
  cep: string;
  endereco: string;
  complemento: string;
}

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
];

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="addr-grid">

      <div class="addr-field">
        <label class="addr-label">Estado <span class="required">*</span></label>
        <select class="addr-input"
          [ngModel]="value.estado"
          (ngModelChange)="onEstadoChange($event)">
          <option value="">Selecione...</option>
          @for (uf of ufs; track uf) {
            <option [value]="uf">{{ uf }}</option>
          }
        </select>
      </div>

      <div class="addr-field">
        <label class="addr-label">Cidade <span class="required">*</span></label>
        @if (loadingCidades()) {
          <div class="addr-input addr-loading">Carregando cidades...</div>
        } @else {
          <select class="addr-input"
            [ngModel]="value.cidade"
            (ngModelChange)="update('cidade', $event)"
            [disabled]="!value.estado || cidades().length === 0">
            <option value="">
              {{ !value.estado ? 'Selecione o estado' : 'Selecione a cidade' }}
            </option>
            @for (cidade of cidades(); track cidade) {
              <option [value]="cidade">{{ cidade }}</option>
            }
          </select>
        }
      </div>

      <div class="addr-field">
        <label class="addr-label">CEP <span class="required">*</span></label>
        <input class="addr-input" type="text"
          [ngModel]="value.cep"
          (input)="maskCep($event)"
          placeholder="00000-000"
          maxlength="9">
      </div>

      <div class="addr-field">
        <label class="addr-label">Complemento</label>
        <input class="addr-input" type="text"
          [ngModel]="value.complemento"
          (ngModelChange)="update('complemento', $event)"
          placeholder="Apto 42, Bloco B">
      </div>

      <div class="addr-field full">
        <label class="addr-label">Endereço <span class="required">*</span></label>
        <input class="addr-input" type="text"
          [ngModel]="value.endereco"
          (ngModelChange)="update('endereco', $event)"
          placeholder="Rua das Flores, 123">
      </div>

    </div>
  `,
  styles: [`
    .addr-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .addr-field { display: flex; flex-direction: column; gap: 5px; }
    .addr-field.full { grid-column: 1 / -1; }
    .addr-label { font-size: 13px; font-weight: 600; color: var(--forest); }
    .addr-input {
      padding: .6rem .85rem;
      border: 1.5px solid var(--border);
      border-radius: var(--r-sm);
      font-family: 'Nunito', sans-serif;
      font-size: 14px;
      background: white;
      box-sizing: border-box;
      width: 100%;
      &:focus { outline: none; border-color: var(--teal); }
      &:disabled { background: #f9f9f9; color: var(--muted); cursor: not-allowed; }
    }
    .addr-loading {
      color: var(--muted);
      font-style: italic;
      display: flex;
      align-items: center;
    }
    @media (max-width: 580px) {
      .addr-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AddressFormComponent implements OnChanges {
  @Input() value: EnderecoFormData = { estado: '', cidade: '', cep: '', endereco: '', complemento: '' };
  @Output() valueChange = new EventEmitter<EnderecoFormData>();

  private http = inject(HttpClient);
  private cache = new Map<string, string[]>();

  readonly ufs = UFS;
  cidades       = signal<string[]>([]);
  loadingCidades = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    const prev = changes['value']?.previousValue as EnderecoFormData | undefined;
    const curr = changes['value']?.currentValue as EnderecoFormData | undefined;
    if (curr?.estado && curr.estado !== prev?.estado) {
      this.loadCidades(curr.estado);
    }
  }

  onEstadoChange(uf: string): void {
    this.value = { ...this.value, estado: uf, cidade: '' };
    this.valueChange.emit(this.value);
    this.cidades.set([]);
    if (uf) this.loadCidades(uf);
  }

  maskCep(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    input.value = v;
    this.update('cep', v);
  }

  update(field: keyof EnderecoFormData, val: string): void {
    this.value = { ...this.value, [field]: val };
    this.valueChange.emit(this.value);
  }

  private loadCidades(uf: string): void {
    if (this.cache.has(uf)) {
      this.cidades.set(this.cache.get(uf)!);
      return;
    }
    this.loadingCidades.set(true);
    this.http
      .get<{ nome: string }[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      )
      .pipe(map(list => list.map(c => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'))))
      .subscribe({
        next: (cities) => {
          this.cache.set(uf, cities);
          this.cidades.set(cities);
          this.loadingCidades.set(false);
        },
        error: () => this.loadingCidades.set(false)
      });
  }
}
