// src/app/private/lib/session/session.util.ts
export function sessionSet(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function sessionGet(key: string): string | null {
  return localStorage.getItem(key);
}

export function sessionLoginUser(username: string, token: string) {
  const expiretime = getNowInMinutes() + 119;
  sessionSet('expiretime', expiretime.toString());
  sessionSet('username', username);
  sessionSet('token', token);
}

export function sessionLogoutUser() {
  sessionSet('expiretime', '0');
  sessionSet('username', '');
  sessionSet('token', '');
}

export function sessionIsLogged(): boolean {
  const expiretime = parseInt(sessionGet('expiretime') || '0', 10);
  return expiretime > getNowInMinutes();
}

export function sessionGetUsername(): string | null {
  return sessionGet('username');
}

export function sessionGetToken(): string | null {
  return sessionGet('token');
}

function getNowInMinutes(): number {
  return Math.floor(Date.now() / 1000 / 60);
}
