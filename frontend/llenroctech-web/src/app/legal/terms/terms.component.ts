import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';

@Component({ selector: 'app-terms', standalone: true, imports: [RouterLink, TopbarComponent], templateUrl: './terms.component.html', styleUrl: '../legal-page.scss' })
export class TermsComponent {}
