import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';
import { SiteFooterComponent } from '../../layout/components/site-footer/site-footer.component';

@Component({ selector: 'app-terms', standalone: true, imports: [RouterLink, TopbarComponent, SiteFooterComponent], templateUrl: './terms.component.html', styleUrl: '../legal-page.scss' })
export class TermsComponent {}
