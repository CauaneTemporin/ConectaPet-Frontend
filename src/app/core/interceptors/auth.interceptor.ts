import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OngContextService } from '../services/ong-context.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth   = inject(AuthService);
  const ongCtx = inject(OngContextService);
  const toast  = inject(ToastService);
  const router = inject(Router);

  const token = auth.getToken();
  const ongId = ongCtx.selectedOngId();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (ongId) headers['X-Ong-Id'] = String(ongId);

  const authReq = Object.keys(headers).length > 0
    ? req.clone({ setHeaders: headers })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        toast.error('Sessão expirada. Faça login novamente.');
        router.navigate(['/login']);
      } else if (err.status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.');
      }
      return throwError(() => err);
    })
  );
};
