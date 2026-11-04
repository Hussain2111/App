import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Authentication } from "./authentication";
import { Router } from "@angular/router";
import { map, catchError, of } from "rxjs";

export const authGuardGuard = () => {
  const authService = inject(Authentication);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  return authService.fetchUser().pipe(
    map( () => true ),
    catchError( () => {
      return of(router.createUrlTree(['/sign-in']));
    })
  );
};
