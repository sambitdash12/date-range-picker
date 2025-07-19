import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DateRangePickerComponent } from './calendar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DateRangePickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-calendar';
}
