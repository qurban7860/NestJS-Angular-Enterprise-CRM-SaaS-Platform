import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { AuthActions } from '../../../../core/state/auth/auth.actions';
import { selectIsLoading, selectError } from '../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-brand-dark relative overflow-hidden">
      <!-- Ambient Background Decoration -->
      <div class="absolute top-0 left-0 w-full h-full -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <div class="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div class="glass-panel p-10">
          <div class="flex flex-col items-center mb-10">
            <!-- Logo -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-8">
              E
            </div>
            <h1 class="text-3xl font-bold tracking-tight text-center">Create Your Account</h1>
            <p class="text-brand-secondary text-center mt-2">Start your enterprise transformation journey</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-2" for="firstName">First Name</label>
                <input 
                  id="firstName"
                  type="text" 
                  formControlName="firstName"
                  placeholder="John" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-2" for="lastName">Last Name</label>
                <input 
                  id="lastName"
                  type="text" 
                  formControlName="lastName"
                  placeholder="Doe" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="orgName">Organization Name</label>
              <input 
                id="orgName"
                type="text" 
                formControlName="orgName"
                placeholder="Acme Corp" 
                class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all">
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="email">Work Email</label>
              <input 
                id="email"
                type="email" 
                formControlName="email"
                placeholder="john.doe@enterprise.com" 
                class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all">
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="password">Password</label>
              <input 
                id="password"
                type="password" 
                formControlName="password"
                placeholder="••••••••" 
                class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all">
            </div>

            @if (errorMessage$ | async; as error) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                {{ error }}
              </div>
            }

            <button 
              type="submit" 
              [disabled]="registerForm.invalid || (isLoading$ | async)"
              class="premium-button w-full py-3.5 mt-4 disabled:opacity-50"
            >
              @if (isLoading$ | async) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              } @else {
                Get Started for Free
              }
            </button>
          </form>

          <p class="text-sm text-brand-secondary mt-10 text-center">
            Already using Enterprise? <a routerLink="/auth/login" class="text-brand-primary font-medium hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  isLoading$ = this.store.select(selectIsLoading);
  errorMessage$ = this.store.select(selectError);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    orgName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.store.dispatch(AuthActions.register({ data: this.registerForm.value as any }));
    }
  }
}
