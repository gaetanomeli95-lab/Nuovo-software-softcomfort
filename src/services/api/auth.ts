import { http } from './http';
import type { LoginRequest, LoginResponse } from '@/types/domain';

export function signIn(credentials: LoginRequest): Promise<LoginResponse> {
  return http.post<LoginResponse>('/login/signin', credentials);
}
