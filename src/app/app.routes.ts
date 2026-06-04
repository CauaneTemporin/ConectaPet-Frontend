import { Routes } from '@angular/router';
import { authGuard, adminGuard, gestorGuard, guestGuard, ongContextGuard, ongAdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'animais',
    loadComponent: () => import('./pages/animals/animals.component').then(m => m.AnimalsComponent)
  },
  {
    path: 'animais/:id',
    loadComponent: () => import('./pages/animal-detail/animal-detail.component').then(m => m.AnimalDetailComponent)
  },
  {
    path: 'como-adotar',
    loadComponent: () => import('./pages/adopt/adopt.component').then(m => m.AdoptComponent)
  },
  {
    path: 'como-doar',
    loadComponent: () => import('./pages/donate/donate.component').then(m => m.DonateComponent)
  },
  {
    path: 'seja-voluntario',
    loadComponent: () => import('./pages/volunteer/volunteer.component').then(m => m.VolunteerComponent)
  },
  {
    path: 'seja-padrinho',
    loadComponent: () => import('./pages/godparent/godparent.component').then(m => m.GodparentComponent)
  },
  {
    path: 'quem-somos',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contato',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'ocorrencias',
    loadComponent: () => import('./pages/occurrence/occurrence.component').then(m => m.OccurrenceComponent)
  },
  {
    path: 'registrar-ong',
    loadComponent: () => import('./pages/registrar-ong/registrar-ong.component').then(m => m.RegistrarOngComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'visao-geral', pathMatch: 'full' },
      {
        path: 'visao-geral',
        loadComponent: () => import('./pages/dashboard/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'minhas-adocoes',
        loadComponent: () => import('./pages/dashboard/my-adoptions/my-adoptions.component').then(m => m.MyAdoptionsComponent)
      },
      {
        path: 'minhas-doacoes',
        loadComponent: () => import('./pages/dashboard/my-donations/my-donations.component').then(m => m.MyDonationsComponent)
      },
      {
        path: 'meus-afilhados',
        loadComponent: () => import('./pages/dashboard/my-godparents/my-godparents.component').then(m => m.MyGodparentsComponent)
      },
      {
        path: 'meu-voluntariado',
        loadComponent: () => import('./pages/dashboard/my-volunteer/my-volunteer.component').then(m => m.MyVolunteerComponent)
      },
      {
        path: 'minhas-denuncias',
        loadComponent: () => import('./pages/dashboard/my-denuncias/my-denuncias.component').then(m => m.MyDenunciasComponent)
      },
      {
        path: 'gestor/denuncias',
        canActivate: [gestorGuard],
        loadComponent: () => import('./pages/dashboard/admin/denuncias/admin-denuncias.component').then(m => m.AdminDenunciasComponent)
      },
      {
        path: 'admin/animais',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/animals/admin-animals.component').then(m => m.AdminAnimalsComponent)
      },
      {
        path: 'admin/adocoes',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/adoptions/admin-adoptions.component').then(m => m.AdminAdoptionsComponent)
      },
      {
        path: 'admin/doacoes',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/donations/admin-donations.component').then(m => m.AdminDonationsComponent)
      },
      {
        path: 'admin/mensagens',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/contacts/admin-contacts.component').then(m => m.AdminContactsComponent)
      },
      {
        path: 'admin/voluntarios',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/volunteers/admin-volunteers.component').then(m => m.AdminVolunteersComponent)
      },
      {
        path: 'admin/apadrinhamentos',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/godparents/admin-godparents.component').then(m => m.AdminGodparentsComponent)
      },
      {
        path: 'admin/ocorrencias',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/occurrences/admin-occurrences.component').then(m => m.AdminOccurrencesComponent)
      },
      {
        path: 'admin/visitas',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/follow-up/admin-follow-up.component').then(m => m.AdminFollowUpComponent)
      },

      {
        path: 'ong/membros',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/ong/membros/ong-membros.component').then(m => m.OngMembrosComponent)
      },
      {
        path: 'admin/configuracoes',
        canActivate: [ongAdminGuard],
        loadComponent: () => import('./pages/dashboard/admin/config/admin-config.component').then(m => m.AdminConfigComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
