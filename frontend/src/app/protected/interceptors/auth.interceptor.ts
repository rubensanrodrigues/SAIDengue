import { HttpInterceptorFn } from '@angular/common/http';
import { sessionGet } from '../lib/session/session.util';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionGet('token');
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
