import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-white text-jet_black-500 font-body">
      <app-navbar />

      <main class="relative">
        <div class="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden="true"></div>

        <div class="relative max-w-content mx-auto px-6 py-10">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class AppComponent {}

