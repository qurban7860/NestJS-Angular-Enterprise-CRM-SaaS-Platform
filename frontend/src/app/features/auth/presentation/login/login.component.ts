import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../../core/state/auth/auth.actions';
import { selectIsLoading, selectError } from '../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-brand-dark relative overflow-hidden">
      <!-- Ambient Background Decoration -->
      <div class="absolute top-0 left-0 w-full h-full -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <div class="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div class="glass-panel p-10 flex flex-col items-center">
          <!-- Logo -->
          <div class="w-16 h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-8">
            E
          </div>

          <h1 class="text-3xl font-bold tracking-tight text-center">Welcome Back</h1>
          <p class="text-brand-secondary text-center mt-2 mb-10">Enter your credentials to access your dashboard</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="w-full space-y-6">
            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="email">Email Address</label>
              <input 
                id="email"
                type="email" 
                formControlName="email"
                placeholder="admin@enterprise.com" 
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all duration-300">
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <label class="block text-sm font-medium text-brand-secondary" for="password">Password</label>
                <!-- <a href="auth/forgot-password" class="text-xs text-brand-primary hover:underline">Forgot?</a> -->
              </div>
              <input 
                id="password"
                type="password" 
                formControlName="password"
                placeholder="••••••••" 
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                class="w-full bg-white/5 border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 transition-all duration-300">
            </div>

            @if (errorMessage$ | async; as error) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                {{ error }}
              </div>
            }

            <button 
              type="submit" 
              [disabled]="loginForm.invalid || (isLoading$ | async)"
              class="premium-button w-full py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isLoading$ | async) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              } @else {
                Sign In to Dashboard
              }
            </button>
          </form>

          <p class="text-sm text-brand-secondary mt-10">
            Don't have an account? <a href="/auth/register" class="text-brand-primary font-medium hover:underline">Create One</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  isLoading$ = this.store.select(selectIsLoading);
  errorMessage$ = this.store.select(selectError);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ credentials: this.loginForm.value }));
    }
  }
}
