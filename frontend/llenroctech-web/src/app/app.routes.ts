import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
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
  {
    path: 'portfolio',
    title: 'Portfolio | Llenroc Tech',
    loadComponent: () => import('./portfolio/portfolio-page.component').then(m => m.PortfolioPageComponent),
  },
  ...ENTERPRISE_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./views/views.route').then(m => m.VIEWS_ROUTE),
  },

  { path: 'contact', loadComponent: () => import('./layout/components/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'preview', loadComponent: () => import('./views/preview/preview.component').then(m => m.PreviewComponent) },
  { path: 'blog-single/new', loadComponent: () => import('./views/blog-single/blog-single.component').then(m => m.BlogSingleComponent) },
  { path: 'blog-single/:slug/edit', loadComponent: () => import('./views/blog-single/blog-single.component').then(m => m.BlogSingleComponent) },
  { path: 'blog-single/:slug', loadComponent: () => import('./views/blog-single/blog-single.component').then(m => m.BlogSingleComponent) },
  { path: 'checkout', loadComponent: () => import('./layout/components/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent) },
  { path: 'checkout/success', loadComponent: () => import('./layout/components/checkout-success/checkout-success.component').then(m => m.CheckoutSuccessComponent) },
  { path: 'checkout/cancel', loadComponent: () => import('./layout/components/checkout-cancel/checkout-cancel.component').then(m => m.CheckoutCancelComponent) },

  { path: 'forms', loadComponent: () => import('./layout/components/forms-index/forms-index.component').then(m => m.FormsIndexComponent) },
  { path: 'forms/initial-intake', loadComponent: () => import('./layout/components/initial-intake/initial-intake.component').then(m => m.InitialIntakeComponent) },
  { path: 'thank-you', loadComponent: () => import('./layout/components/thank-you/thank-you.component').then(m => m.ThankYouComponent) },
  { path: '**', redirectTo: 'home' },
];
