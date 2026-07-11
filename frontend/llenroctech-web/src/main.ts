import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  // main.ts (DEV ONLY)
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.name === 'NavigatorLockAcquireTimeoutError') e.preventDefault();
});

