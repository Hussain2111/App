import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type InstagramConnection = {
  insta_ID: string;
  username: string;
};

@Component({
  selector: 'app-step2',
  imports: [RouterLink],
  templateUrl: './step2.html',
  styleUrl: './step2.css',
})
export class Step2 implements OnInit {
  private http = inject(HttpClient)

  connection = signal<InstagramConnection | null>(null); 
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.http
      .get<InstagramConnection>('auth/instagram/connection')
      .subscribe({
        next: (connection) => {
          this.connection.set(connection);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(
            error.status === 404 
              ? 'Connect an instagram account first.'
              : 'Unable to load your instagram connection.'
          );
          this.loading.set(false);
        }
      });
  }
  
}
