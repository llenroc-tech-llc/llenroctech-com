import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreviewComponent } from './views/preview/preview.component';
import { BlogSingleComponent } from './views/blog-single/blog-single.component';
import { ContactComponent } from './layout/components/contact/contact.component';
import { CheckoutPageComponent } from './layout/components/checkout-page/checkout-page.component';
import { FormsIndexComponent } from './layout/components/forms-index/forms-index.component';
import { InitialIntakeComponent } from './layout/components/initial-intake/initial-intake.component';
import { ThankYouComponent } from './layout/components/thank-you/thank-you.component';
import { ENTERPRISE_ROUTES } from './enterprise/enterprise.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'privacy',
    title: 'Privacy Policy | Llenroc Tech',
    loadComponent: () => import('./legal/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    title: 'Terms and Conditions | Llenroc Tech',
    loadComponent: () => import('./legal/terms/terms.component').then(m => m.TermsComponent),
  },
  {
    path: 'ai-assistant',
    title: 'AI Assistant | Llenroc Tech',
    loadComponent: () => import('./layout/components/ai-sidebar/ai-sidebar.component').then(m => m.AiSidebarComponent),
  },
  ...ENTERPRISE_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./views/views.route').then(m => m.VIEWS_ROUTE),
  },

  { path: 'contact', component: ContactComponent },
  { path: 'preview', component: PreviewComponent },
  { path: 'blog-single/new', component: BlogSingleComponent },
  { path: 'blog-single/:slug/edit', component: BlogSingleComponent },
  { path: 'blog-single/:slug', component: BlogSingleComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'checkout/success', loadComponent: () => import('./layout/components/checkout-success/checkout-success.component').then(m => m.CheckoutSuccessComponent) },
  { path: 'checkout/cancel', loadComponent: () => import('./layout/components/checkout-cancel/checkout-cancel.component').then(m => m.CheckoutCancelComponent) },

  { path: 'forms', component: FormsIndexComponent },
  { path: 'forms/initial-intake', component: InitialIntakeComponent },
  { path: 'forms/contract-intake', loadComponent: () => import('./layout/components/contract-intake/contract-intake.component').then(m => m.ContractIntakeComponent) },

  { path: 'thank-you', component: ThankYouComponent },
  { path: '**', redirectTo: 'home' },
];
