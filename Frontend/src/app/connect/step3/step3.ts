import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-step3',
  imports: [RouterLink],
  templateUrl: './step3.html',
  styleUrl: './step3.css',
})
export class Step3 {
  status = 'Not connected';
}
