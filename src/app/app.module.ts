import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { LoginComponent } from './login/login.component';
import { IsInvalidPipe } from './pages/pipes/is-invalid.pipe';
import { CommonModule } from '@angular/common';
import { HasErrorPipe } from './pages/pipes/has-error.pipe';
import { HttpClientModule } from '@angular/common/http';
import { PagesModule } from './pages/pages.module';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { RegisterComponent } from './register/register.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    PagesModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    // CommonModule,
    APP_ROUTES,
    ReactiveFormsModule
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
