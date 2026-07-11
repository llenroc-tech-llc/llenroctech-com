import { Route } from "@angular/router";
import { IndexComponent } from "./index/index.component";
import { HomeComponent } from "./home/home.component";
import { Index3Component } from "./index3/index3.component";
import { Index4Component } from "./index4/index4.component";
import { Index5Component } from "./index5/index5.component";
import { Index6Component } from "./index6/index6.component";
import { Index7Component } from "./index7/index7.component";

export const VIEWS_ROUTE: Route[] = [
    {
        path: 'index',
        component: IndexComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'index-3',
        component: Index3Component
    },
    {
        path: 'index-4',
        component: Index4Component
    },
    {
        path: 'index-5',
        component: Index5Component
    },
    {
        path: 'index-6',
        component: Index6Component
    },
    {
        path: 'index-7',
        component: Index7Component
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
