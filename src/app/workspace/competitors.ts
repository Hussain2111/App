import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-competitors',
  imports: [RouterLink, FormsModule],
  templateUrl: './competitors.html',
})
export class Competitors {
  route = inject(ActivatedRoute);
  get compare() {
    return this.route.snapshot.data['view'] === 'compare';
  }
  query = '';
  searched = false;
}
