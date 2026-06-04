import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { OngContextService } from '../services/ong-context.service';


export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isAdmin()) return true;

  toast.error('Acesso restrito a administradores.');
  router.navigate(['/']);
  return false;
};

export const gestorGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isGestorOrAdmin()) return true;

  return auth.getProfile().pipe(
    map(() => {
      if (auth.isGestorOrAdmin()) return true;
      toast.error('Acesso restrito a gestores públicos e administradores.');
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      toast.error('Acesso restrito a gestores públicos e administradores.');
      router.navigate(['/']);
      return of(false);
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  router.navigate(['/dashboard']);
  return false;
};

export const ongContextGuard: CanActivateFn = () => {
  const ongCtx = inject(OngContextService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (ongCtx.hasOng()) return true;

  toast.error('Selecione uma ONG para acessar este recurso.');
  router.navigate(['/']);
  return false;
};

export const gestorOrOngAdminGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const auth   = inject(AuthService);
  const ongCtx = inject(OngContextService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isGestorOrAdmin() || ongCtx.isOngAdmin()) return true;

  return auth.getProfile().pipe(
    map(() => {
      if (auth.isGestorOrAdmin() || ongCtx.isOngAdmin()) return true;
      toast.error('Acesso restrito.');
      router.navigate(['/dashboard']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};

export const ongAdminGuard: CanActivateFn = (): boolean | Observable<boolean> => {
  const auth   = inject(AuthService);
  const ongCtx = inject(OngContextService);
  const router = inject(Router);
  const toast  = inject(ToastService);

  if (auth.isAdmin() || ongCtx.isOngAdmin()) return true;

  return auth.getProfile().pipe(
    map(() => {
      if (auth.isAdmin() || ongCtx.isOngAdmin()) return true;
      toast.error('Acesso restrito a administradores da ONG.');
      router.navigate(['/dashboard']);
      return false;
    }),
    catchError(() => {
      toast.error('Acesso restrito a administradores da ONG.');
      router.navigate(['/dashboard']);
      return of(false);
    })
  );
};
