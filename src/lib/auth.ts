import { cookies } from 'next/headers';
import { decodeToken } from './jwt';

export interface AuthUser {
  userId: string;
  phoneNumber: string;
  name: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = decodeToken(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}
