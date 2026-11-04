import { inject } from "@angular/core";
import { Authentication } from "./authentication";
import { Router } from "@angular/router";
import { map, catchError, of } from "rxjs";

export const authGuardGuard = () => {
  const authService = inject(Authentication);
  const router = inject(Router);

  return authService.fetchUser().pipe(
    map( () => true ),
    catchError( () => {
      return of(router.createUrlTree(['/sign-in']));
    })
  );
};
