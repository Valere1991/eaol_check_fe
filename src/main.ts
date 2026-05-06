import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/services/auth.service';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), importProvidersFrom(FormsModule)]
}).then(async (appRef) => {
  await appRef.injector.get(AuthService).init();
}).catch((err) => console.error(err));
