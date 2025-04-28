import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { sessionIsLogged } from '../session/session.util'; 

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (sessionIsLogged()) {
    return true;
  } else {
    router.navigate(['/protected/login']);
    return false;
  }
};
