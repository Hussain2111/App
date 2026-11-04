import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-step2',
  imports: [RouterLink],
  templateUrl: './step2.html',
  styleUrl: './step2.css',
})
export class Step2 {
  status = 'Not connected';
}
