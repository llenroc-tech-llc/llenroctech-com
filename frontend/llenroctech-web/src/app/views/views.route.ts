import { Route } from "@angular/router";

export const VIEWS_ROUTE: Route[] = [
    {
        path: 'index',
        loadComponent: () => import('./index/index.component').then(m => m.IndexComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'index-3',
        loadComponent: () => import('./index3/index3.component').then(m => m.Index3Component)
    },
    {
        path: 'index-4',
        loadComponent: () => import('./index4/index4.component').then(m => m.Index4Component)
    },
    {
        path: 'index-5',
        loadComponent: () => import('./index5/index5.component').then(m => m.Index5Component)
    },
    {
        path: 'index-6',
        loadComponent: () => import('./index6/index6.component').then(m => m.Index6Component)
    },
    {
        path: 'index-7',
        loadComponent: () => import('./index7/index7.component').then(m => m.Index7Component)
    },
      {
    path: 'admin/post/new',
    loadComponent: () =>
      import('../layout/components/post-editor/post-editor.component')
        .then(m => m.PostEditorComponent),
  },
  {
    path: 'admin/post/:id/edit',
    loadComponent: () =>
      import('../layout/components/post-editor/post-editor.component')
        .then(m => m.PostEditorComponent),
  },
//   {
//     path: 'checkout/success',
//     loadComponent: () => import('./checkout/success.component').then(m => m.SuccessComponent),
//   },
//   {
//     path: 'checkout/cancel',
//     loadComponent: () => import('./checkout/cancel.component').then(m => m.CancelComponent),
//   },


]
