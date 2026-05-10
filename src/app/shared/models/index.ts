// ── USER ─────────────────────────────────────
export interface User {
  id: number; name: string; email: string;
  phone?: string; cpf?: string; address?: string;
  role: 'USER' | 'ADMIN'; createdAt?: string;
}
export interface LoginRequest    { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; phone?: string; cpf?: string; address?: string; }
export interface UpdateProfileRequest { name?: string; phone?: string; address?: string; }
export interface AuthResponse    { token: string; type?: string; user: User; }

// ── ANIMAL ───────────────────────────────────
export type AnimalSpecies = 'cachorro' | 'gato' | 'outro';
export type AnimalGender  = 'macho' | 'femea';
export type AnimalSize    = 'pequeno' | 'medio' | 'grande';
export type AnimalStatus  = 'disponivel' | 'adotado' | 'apadrinhado';

export interface Animal {
  id: number; name: string; species: AnimalSpecies; breed?: string;
  gender?: AnimalGender; ageYears?: number; size?: AnimalSize;
  description?: string; temperament?: string;
  vaccinated: boolean; neutered: boolean; status: AnimalStatus;
  photoUrl?: string; shelterName?: string; createdAt: string;
}
export interface AnimalRequest {
  name: string; species: string; breed?: string; gender?: string;
  ageYears?: number; size?: string; description?: string; temperament?: string;
  vaccinated?: boolean; neutered?: boolean; status?: string; photoUrl?: string; shelterId?: number;
}
export interface AnimalFilter { species?: string; size?: string; status?: string; q?: string; }

// ── ADOPTION ─────────────────────────────────
export type AdoptionStatus = 'pendente' | 'aprovado' | 'recusado' | 'concluido';
export interface Adoption {
  id: number; animalId: number; animalName: string; animalSpecies: string; animalPhoto?: string;
  userId: number; userName: string; userEmail: string;
  status: AdoptionStatus; message?: string;
  createdAt: string; reviewedAt?: string;
}
export interface AdoptionRequest {
  animalId: number;
  message?: string;
}
export interface ReviewRequest { status: 'APROVADO' | 'RECUSADO' | 'CONCLUIDO'; }

// ── DONATION ─────────────────────────────────
export type DonationStatus = 'pendente' | 'confirmado' | 'cancelado';
export interface Donation {
  id: number; amount: number;
  status: DonationStatus; name?: string; email?: string;
  message?: string; createdAt: string;
}
export interface DonationRequest {
  amount: number;
  name: string;
  email: string;
  message?: string;
}
export interface DonationStats { totalAmount: number; averageAmount: number; totalDonations: number; }

// ── VOLUNTEER ────────────────────────────────
export interface SkillEntry { skill: string; availability: string[]; }
export interface Volunteer {
  id: number; userId: number; userName: string; userEmail: string; userPhone?: string;
  skills: string; availability?: string; motivation?: string; status: string; createdAt: string;
}
export interface VolunteerRequest { skills: string; availability?: string; motivation?: string; }

// ── GODPARENT ────────────────────────────────
export type GodparentStatus = 'pendente' | 'aprovado';
export interface Godparent {
  id: number; animalId: number; animalName: string; animalSpecies: string;
  animalPhoto?: string; amount?: number; status: GodparentStatus; startedAt: string;
  userId?: number; userName?: string; userEmail?: string;
}
export interface GodparentRequest  { animalId: number; amount: number; }
export interface GodparentAmountRequest { amount: number; }

// ── CONTACT ──────────────────────────────────
export interface Contact {
  id: number; name: string; email: string; phone?: string;
  subject?: string; message: string; read: boolean; createdAt: string;
}
export interface ContactRequest {
  name: string; email: string; phone?: string; subject?: string; message: string;
}

// ── SHELTER ──────────────────────────────────
export interface Shelter {
  id: number; name: string; city: string; address?: string; phone?: string; email?: string; createdAt: string;
}

// ── ADMIN ─────────────────────────────────────
export interface AdminStats {
  totalUsers: number; totalAnimals: number;
  animalsAvailable: number; animalsAdopted: number;
  totalAdoptions: number; adoptionsPending: number;
  totalDonations: number; totalVolunteers: number;
  totalGodparents: number; godparentsPending?: number; unreadContacts?: number;
}

// ── OCCURRENCE ────────────────────────────────
export type OccurrenceType   = 'abandono' | 'maus_tratos' | 'suspeita' | 'outro';
export type OccurrenceStatus = 'pendente' | 'em_analise' | 'resolvido' | 'arquivado';

export interface Occurrence {
  id: number;
  type: OccurrenceType;
  description: string;
  address?: string;
  animalDescription?: string;
  reporterName?: string;
  reporterEmail?: string;
  anonymous: boolean;
  userId?: number;
  status: OccurrenceStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface OccurrenceRequest {
  type: OccurrenceType;
  description: string;
  address?: string;
  animalDescription?: string;
  reporterName?: string;
  reporterEmail?: string;
  anonymous: boolean;
  userId?: number;
}

// ── FOLLOW-UP VISIT ────────────────────────────
export type FollowUpStatus = 'agendada' | 'realizada' | 'cancelada';

export interface FollowUpVisit {
  id: number;
  adoptionId?: number;
  animalId?: number;
  animalName: string;
  adopterName?: string;
  adopterEmail?: string;
  scheduledDate: string;
  status: FollowUpStatus;
  result?: string;
  nextVisitDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FollowUpVisitRequest {
  adoptionId?: number;
  animalId?: number;
  animalName: string;
  scheduledDate: string;
  notes?: string;
}

// ── TOAST ─────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: string; message: string; type: ToastType; }
