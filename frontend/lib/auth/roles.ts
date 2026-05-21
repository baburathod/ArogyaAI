export type AuthRole = 'patient' | 'doctor' | 'emergency' | 'admin';

export const ALL_ROLES: AuthRole[] = ['patient', 'doctor', 'emergency', 'admin'];

export const ROLE_LABELS: Record<AuthRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  emergency: 'Emergency Responder',
  admin: 'Platform Admin'
};
