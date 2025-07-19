import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar.component'; // 👈 import it

@NgModule({
    declarations: [
        AppComponent,
        CalendarComponent, // 👈 declare here
    ],
    imports: [
        BrowserModule,
        // any other modules like FormsModule, MatModules etc
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
