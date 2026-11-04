import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, of } from 'rxjs';



type User = {
    id: number;
    name: string;
    email: string;
};

@Injectable( {
    providedIn: 'root',
})
export class Authentication {
    http = inject(HttpClient);
    router = inject(Router);
    user = signal<User | null>(null) ;

     /**
     * Gets the User's info from server and populates the state.
     * This is _the_ way to check if the user is still logged in.
     * If we already have it, skip the call.
     */
    fetchUser(forceReload = false): Observable<User> {
        const user = this.user();

        if (!!user && !forceReload) return of(user);
        
        return this.http.get<User>(`/me`, {}).pipe(
        tap(u => this.user.set(u))
        );
    }

    login(email: string, password: string) {
        return this.http.post<User>('/signin', { email, password }).pipe(
            tap( u => {
                this.user.set(u);
            })
        );
           
    }

    register(cred: { name: string, email: string, password: string }) {
        return this.http.post<User>('/signup', cred);
    }

    logout() {
        this.http.post('/logout', {}).subscribe( () => {
            this.user.set(null);
            this.router.navigate(['/sign-in']);
        }

        );
    }
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(Authentication);
    
    return next(req).pipe(
        tap({ 
            error: error => {
                if (error instanceof HttpErrorResponse  && error.status === 401) {
                    authService.logout();                
                }
            }
        })
    );
}
