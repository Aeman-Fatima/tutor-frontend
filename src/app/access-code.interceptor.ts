import { HttpInterceptorFn } from '@angular/common/http';

/** Attaches the shared demo access code (if the visitor entered one) to every API request. */
export const accessCodeInterceptor: HttpInterceptorFn = (req, next) => {
  const code = localStorage.getItem('access_code');
  if (!code || !req.url.startsWith('/api')) return next(req);

  return next(req.clone({ setHeaders: { 'X-Access-Code': code } }));
};
