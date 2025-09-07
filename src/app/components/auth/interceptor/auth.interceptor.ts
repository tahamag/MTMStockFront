import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router= inject(Router);
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // If the token exists, clone the request and add the authorization header
  if (authToken) {
    if (authService.isTokenExpired()) {
        authService.logout();
        router.navigate(['/login']);
      }
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next(authReq);
  }else
     router.navigate(['/login']);


  // If there's no token, just pass the original request
  return next(req);
};