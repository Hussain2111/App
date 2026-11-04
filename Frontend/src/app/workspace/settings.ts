import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-settings',
  imports: [RouterLink, FormsModule],
  templateUrl: './settings.html',
})
export class Settings {
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'general';
  }
  name = '';
  voice = '';
  phrase = '';
  memories = false;
}
