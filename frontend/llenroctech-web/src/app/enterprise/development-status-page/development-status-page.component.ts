import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DevelopmentPageData } from '../enterprise-page.models';

@Component({
  selector: 'app-development-status-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './development-status-page.component.html',
})
export class DevelopmentStatusPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly page = this.route.snapshot.data as DevelopmentPageData;
}
