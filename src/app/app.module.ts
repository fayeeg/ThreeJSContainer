import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MyfirstsceneComponent } from './myfirstscene/myfirstscene.component';

@NgModule({
  declarations: [
    AppComponent,
    MyfirstsceneComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
