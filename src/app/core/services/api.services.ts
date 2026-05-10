import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Animal, AnimalFilter, AnimalRequest,
  Adoption, AdoptionRequest, ReviewRequest,
  Donation, DonationRequest, DonationStats,
  Volunteer, VolunteerRequest,
  Godparent, GodparentRequest, GodparentAmountRequest,
  Contact, ContactRequest,
  Shelter, AdminStats,
  Occurrence, OccurrenceRequest,
  FollowUpVisit, FollowUpVisitRequest
} from '../../shared/models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AnimalService {
  constructor(private http: HttpClient) {}

  list(filter: AnimalFilter = {}): Observable<Animal[]> {
    let params = new HttpParams();
    if (filter.species) params = params.set('species', filter.species);
    if (filter.size)    params = params.set('size',    filter.size);
    if (filter.status)  params = params.set('status',  filter.status);
    if (filter.q)       params = params.set('q',       filter.q);
    return this.http.get<Animal[]>(`${API}/animals`, { params });
  }

  getById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${API}/animals/${id}`);
  }

  create(req: AnimalRequest): Observable<Animal> {
    return this.http.post<Animal>(`${API}/animals`, req);
  }

  update(id: number, req: Partial<AnimalRequest>): Observable<Animal> {
    return this.http.patch<Animal>(`${API}/animals/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/animals/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AdoptionService {
  constructor(private http: HttpClient) {}

  request(req: AdoptionRequest): Observable<Adoption> {
    return this.http.post<Adoption>(`${API}/adoptions`, req);
  }

  mine(): Observable<Adoption[]> {
    return this.http.get<Adoption[]>(`${API}/adoptions/mine`);
  }

  listAll(status?: string): Observable<Adoption[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Adoption[]>(`${API}/adoptions`, { params });
  }

  review(id: number, req: ReviewRequest): Observable<Adoption> {
    return this.http.patch<Adoption>(`${API}/adoptions/${id}/review`, req);
  }
}

@Injectable({ providedIn: 'root' })
export class DonationService {
  constructor(private http: HttpClient) {}

  donate(req: DonationRequest): Observable<Donation> {
    return this.http.post<Donation>(`${API}/donations`, req);
  }

  mine(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${API}/donations/mine`);
  }

  stats(): Observable<DonationStats> {
    return this.http.get<DonationStats>(`${API}/donations/stats`);
  }

  listAll(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${API}/donations`);
  }
}

@Injectable({ providedIn: 'root' })
export class VolunteerService {
  constructor(private http: HttpClient) {}

  register(req: VolunteerRequest): Observable<Volunteer> {
    return this.http.post<Volunteer>(`${API}/volunteers`, req);
  }

  mine(): Observable<Volunteer> {
    return this.http.get<Volunteer>(`${API}/volunteers/mine`);
  }

  update(id: number, req: VolunteerRequest): Observable<Volunteer> {
    return this.http.patch<Volunteer>(`${API}/volunteers/${id}`, req);
  }

  approve(id: number): Observable<Volunteer> {
    return this.http.patch<Volunteer>(`${API}/volunteers/${id}/approve`, {});
  }

  reject(id: number): Observable<Volunteer> {
    return this.http.patch<Volunteer>(`${API}/volunteers/${id}/reject`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/volunteers/${id}`);
  }

  listAll(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(`${API}/volunteers`);
  }
}

@Injectable({ providedIn: 'root' })
export class GodparentService {
  constructor(private http: HttpClient) {}

  register(req: GodparentRequest): Observable<Godparent> {
    return this.http.post<Godparent>(`${API}/godparents`, req);
  }

  mine(): Observable<Godparent[]> {
    return this.http.get<Godparent[]>(`${API}/godparents/mine`);
  }

  updateAmount(id: number, req: GodparentAmountRequest): Observable<Godparent> {
    return this.http.patch<Godparent>(`${API}/godparents/${id}/amount`, req);
  }

  approve(id: number): Observable<Godparent> {
    return this.http.patch<Godparent>(`${API}/godparents/${id}/approve`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/godparents/${id}`);
  }

  listAll(status?: string): Observable<Godparent[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Godparent[]>(`${API}/godparents`, { params });
  }
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  send(req: ContactRequest): Observable<Contact> {
    return this.http.post<Contact>(`${API}/contact`, req);
  }

  listAll(): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${API}/contact`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${API}/contact/${id}/read`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class ShelterService {
  constructor(private http: HttpClient) {}
  listAll(): Observable<Shelter[]> { return this.http.get<Shelter[]>(`${API}/shelters`); }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}
  stats(): Observable<AdminStats> { return this.http.get<AdminStats>(`${API}/admin/stats`); }
}

@Injectable({ providedIn: 'root' })
export class SheltersService {
  constructor(private http: HttpClient) {}

  getShelters(): Observable<Shelter[]> {
    return this.http.get<Shelter[]>(`${environment.apiUrl}/shelters`);}
}

@Injectable({ providedIn: 'root' })
export class OccurrenceService {
  constructor(private http: HttpClient) {}

  report(req: OccurrenceRequest): Observable<Occurrence> {
    return this.http.post<Occurrence>(`${API}/occurrences`, req);
  }

  listAll(status?: string): Observable<Occurrence[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Occurrence[]>(`${API}/occurrences`, { params });
  }

  updateStatus(id: number, status: string, adminNotes?: string): Observable<Occurrence> {
    return this.http.patch<Occurrence>(`${API}/occurrences/${id}/status`, { status, adminNotes });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/occurrences/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class FollowUpService {
  constructor(private http: HttpClient) {}

  create(req: FollowUpVisitRequest): Observable<FollowUpVisit> {
    return this.http.post<FollowUpVisit>(`${API}/follow-up-visits`, req);
  }

  listAll(): Observable<FollowUpVisit[]> {
    return this.http.get<FollowUpVisit[]>(`${API}/follow-up-visits`);
  }

  update(id: number, data: Partial<FollowUpVisit>): Observable<FollowUpVisit> {
    return this.http.patch<FollowUpVisit>(`${API}/follow-up-visits/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/follow-up-visits/${id}`);
  }
}