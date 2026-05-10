# 🐾 Conecta PET — Frontend Angular

Projeto Angular 17 standalone com **Signals**, **Lazy Loading**, **JWT Auth** e integração total com o backend Java Spring Boot.

---

## 📁 Estrutura do Projeto

```
src/app/
├── app.component.ts          ← Root component (navbar + router-outlet + footer)
├── app.config.ts             ← Providers: HttpClient, Router, Animations
├── app.routes.ts             ← Rotas com lazy loading e guards
│
├── core/
│   ├── guards/
│   │   └── auth.guard.ts     ← authGuard, adminGuard, guestGuard
│   ├── interceptors/
│   │   └── auth.interceptor.ts ← Injeta Bearer token em todas as requests
│   └── services/
│       ├── auth.service.ts   ← Login, register, logout, JWT com Angular Signals
│       ├── api.services.ts   ← AnimalService, AdoptionService, DonationService...
│       ├── toast.service.ts  ← Notificações reativas
│       └── spinner.component.ts ← Loading overlay global
│
├── shared/
│   ├── models/index.ts       ← Interfaces TypeScript (espelha DTOs Java)
│   └── components/
│       ├── navbar/           ← Navbar sticky com estado de auth
│       ├── footer/           ← Footer com links de navegação
│       ├── toast/            ← Container de notificações
│       ├── spinner/          ← Overlay de loading
│       ├── pet-card/         ← Card reutilizável de animal
│       └── adopt-modal/      ← Modal de solicitação de adoção
│
└── pages/
    ├── home/                 ← Página inicial com hero + pets em destaque
    ├── animals/              ← Grid com filtros e busca
    ├── adopt/                ← Como adotar (passo a passo)
    ├── donate/               ← Formulário de doação + estatísticas
    ├── volunteer/            ← Cadastro de voluntário
    ├── godparent/            ← Apadrinhamento de pets
    ├── about/                ← Quem somos + equipe
    ├── contact/              ← Formulário de contato
    ├── login/                ← Login + Cadastro (tabs)
    └── dashboard/            ← Painel autenticado
        ├── overview/         ← Visão geral com estatísticas
        ├── my-adoptions/     ← Histórico de adoções do usuário
        ├── my-donations/     ← Histórico de doações do usuário
        ├── my-godparents/    ← Afilhados do usuário
        └── admin/
            ├── animals/      ← CRUD de animais (admin)
            ├── adoptions/    ← Revisar solicitações (admin)
            ├── donations/    ← Ver todas as doações (admin)
            └── contacts/     ← Mensagens de contato (admin)
```

---

## 🚀 Como executar

### Pré-requisitos
- **Node.js** 18+ (`node -v`)
- **npm** 9+ (`npm -v`)
- **Backend Java** rodando em `localhost:8080`

### 1. Instalar dependências
```bash
cd conecta-pet-angular
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm start
```
Acesse: **http://localhost:4200**

O proxy em `proxy.conf.json` redireciona `/api/*` → `http://localhost:8080/api/*` automaticamente.

### 3. Build de produção
```bash
npm run build:prod
# Arquivos em dist/conecta-pet/
```

---

## 🔑 Usuários padrão (do backend Java)

| E-mail                  | Senha      | Painel         |
|-------------------------|------------|----------------|
| `admin@conectapet.org`  | `admin123` | Admin completo |
| `demo@conectapet.org`   | `demo123`  | Usuário comum  |

---

## 🔗 Rotas da aplicação

| Rota                        | Componente         | Guard     |
|-----------------------------|--------------------|-----------|
| `/`                         | HomeComponent      | —         |
| `/animais`                  | AnimalsComponent   | —         |
| `/como-adotar`              | AdoptComponent     | —         |
| `/como-doar`                | DonateComponent    | —         |
| `/seja-voluntario`          | VolunteerComponent | —         |
| `/seja-padrinho`            | GodparentComponent | —         |
| `/quem-somos`               | AboutComponent     | —         |
| `/contato`                  | ContactComponent   | —         |
| `/login`                    | LoginComponent     | guestGuard |
| `/dashboard`                | DashboardComponent | authGuard  |
| `/dashboard/visao-geral`    | OverviewComponent  | authGuard  |
| `/dashboard/minhas-adocoes` | MyAdoptionsComponent | authGuard |
| `/dashboard/minhas-doacoes` | MyDonationsComponent | authGuard |
| `/dashboard/meus-afilhados` | MyGodparentsComponent | authGuard |
| `/dashboard/admin/animais`  | AdminAnimalsComponent | adminGuard |
| `/dashboard/admin/adocoes`  | AdminAdoptionsComponent | adminGuard |
| `/dashboard/admin/doacoes`  | AdminDonationsComponent | adminGuard |
| `/dashboard/admin/mensagens`| AdminContactsComponent | adminGuard |

---

## 🛠 Tecnologias

| Tecnologia          | Versão | Uso                              |
|---------------------|--------|----------------------------------|
| Angular             | 17     | Framework SPA                    |
| TypeScript          | 5.4    | Linguagem                        |
| Angular Signals     | 17     | Gerenciamento de estado reativo  |
| Angular Router      | 17     | Roteamento com lazy loading      |
| HttpClient          | 17     | Comunicação com a API REST       |
| Angular Forms       | 17     | FormsModule (template-driven)    |
| SCSS                | —      | Estilos com variáveis CSS        |

---

## ⚙️ Configuração de ambiente

**`src/environments/environment.ts`** (desenvolvimento):
```typescript
export const environment = {
  production: false,
  apiUrl: '/api'   // proxy → localhost:8080
};
```

**`src/environments/environment.prod.ts`** (produção):
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://SEU_SERVIDOR:8080/api'
};
```

---

## 🔒 Autenticação

O JWT é armazenado no `localStorage` como `cp_token`.

O `authInterceptor` injeta automaticamente o header:
```
Authorization: Bearer <token>
```
em todas as requisições HTTP.

Se o servidor retornar `401`, o interceptor faz logout automático e redireciona para `/login`.

---

## 📡 Conexão com o Backend Java

Certifique-se de que o backend Java está rodando:
```bash
cd conecta-pet-java
mvn spring-boot:run
```

O frontend se conecta via proxy configurado em `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```
