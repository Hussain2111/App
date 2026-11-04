import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-step1',
  imports: [RouterLink],
  templateUrl: './step1.html',
  styleUrl: './step1.css',
})
export class Step1 {
  status = 'Not connected';
}
