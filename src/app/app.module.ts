import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { TypeaheadModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';

// import { ObjectPipe } from './transform/object-pipe';

@NgModule({
  declarations: [
    AppComponent,
    // ObjectPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    TypeaheadModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
