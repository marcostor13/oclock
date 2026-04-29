import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** Strips the `{ statusCode, message, data }` envelope returned by the new backend. */
export function apiResponseInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body;
        if (
          body !== null &&
          typeof body === 'object' &&
          !Array.isArray(body) &&
          'statusCode' in body &&
          'data' in body
        ) {
          return event.clone({ body: (body as { data: unknown }).data });
        }
      }
      return event;
    }),
  );
}
