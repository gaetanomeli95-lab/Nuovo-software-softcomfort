import { http, ApiError } from './http';
import { API_BASE_URL } from './config';
import type { LoginRequest, LoginResponse } from '@/types/domain';

export function signIn(credentials: LoginRequest): Promise<LoginResponse> {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new ApiError(
      0,
      'Backend aziendale non collegato. Per questa anteprima usa la modalità demo.',
    );
  }

  return http.post<LoginResponse>('/login/signin', credentials);
}
