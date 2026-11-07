import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-step3',
  imports: [RouterLink],
  templateUrl: './step3.html',
  styleUrl: './step3.css',
})
export class Step3 implements OnInit {
  private http = inject(HttpClient);
  username = signal('');
  error = signal('');
  ngOnInit() {
    this.http.get<{ username: string }>('/auth/instagram/connection').subscribe({
      next: (account) => this.username.set(account.username),
      error: () => this.error.set('Unable to confirm your connection. Return to the connection step and try again.'),
    });
  }
}
