import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  UpdateProfileRequest, User
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'cp_token';
  private readonly USER_KEY  = 'cp_user';
  private readonly api       = environment.apiUrl;

  readonly currentUser      = signal<User | null>(this.loadUser());
  readonly token            = signal<string | null>(this.loadToken());
  readonly isLoggedIn       = computed(() => !!this.token() && !!this.currentUser());
  readonly isAdmin          = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isGestorPublico  = computed(() => this.currentUser()?.role === 'GESTOR_PUBLICO');
  readonly isGestorOrAdmin  = computed(() => this.isAdmin() || this.isGestorPublico());

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, req).pipe(
      tap((res: any) => this.storeSession(res)),
      catchError((err: any) => throwError(() => err))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, req).pipe(
      tap((res: any) => this.storeSession(res)),
      catchError((err: any) => throwError(() => err))
    );
  }

  logout(): void {
    this.http.post(`${this.api}/auth/logout`, {}).subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.api}/auth/me`).pipe(
      tap((u: any) => {
        this.currentUser.set(u);
        localStorage.setItem(this.USER_KEY, JSON.stringify(u));
      })
    );
  }

  updateProfile(req: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.api}/auth/me`, req).pipe(
      tap((u: any) => {
        this.currentUser.set(u);
        localStorage.setItem(this.USER_KEY, JSON.stringify(u));
      })
    );
  }

  getToken(): string | null { return this.token(); }

  getUserInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return u.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.currentUser.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private loadToken(): string | null {
    try { return localStorage.getItem(this.TOKEN_KEY); } catch { return null; }
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
