import { Component, OnInit, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { selectUser } from '../../core/state/auth/auth.reducer';
import { AuthActions } from '../../core/state/auth/auth.actions';
import { take } from 'rxjs';

interface Feature {
  icon: SafeHtml;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  bgColor: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      <!-- Animated Background -->
      <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[200px]"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20"></div>
      </div>

      <!-- Navigation -->
      <div #navWrapper data-landing-nav class="relative z-20">
        <nav class="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5">
        <div class="flex items-center gap-3 cursor-pointer" (click)="scrollToTop()">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
            <img src="assets/astraeus_logo_3d.png" alt="Astraeus" class="w-full h-full object-cover">
          </div>
          <span class="text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Astraeus <span class="text-brand-primary">CRM</span></span>
        </div>
        
        <!-- Desktop Navigation -->
        <div class="hidden sm:flex items-center gap-4">
          <a routerLink="/auth/login" class="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</a>
          <a routerLink="/auth/register" class="px-5 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/50">Get Started</a>
        </div>
        
        <!-- Mobile Menu Button -->
        <button type="button" (click)="toggleMobileMenu($event)" class="sm:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
          @if (isMobileMenuOpen) {
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        </button>
      </nav>

      <!-- Mobile Menu Dropdown -->
      @if (isMobileMenuOpen) {
        <div class="sm:hidden fixed inset-x-0 top-16 bottom-0 bg-black/40 backdrop-blur-[1px] z-40" (click)="closeMobileMenu()">
          <div class="mx-3 mt-3 glass-panel border border-white/10 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200" (click)="$event.stopPropagation()">
            <div class="flex flex-col gap-3">
              <a routerLink="/auth/login" (click)="closeMobileMenu()" class="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 px-3 rounded-lg hover:bg-white/5">Sign In</a>
              <a routerLink="/auth/register" (click)="closeMobileMenu()" class="px-5 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg backdrop-blur-md transition-all text-center">Get Started</a>
            </div>
          </div>
        </div>
      }
      </div>

      <!-- Hero Section -->
      <main class="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center max-w-6xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-fade-in-up">
          <span class="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Enterprise-Grade Architecture
        </div>
        
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05] animate-fade-in-up" style="animation-delay: 100ms;">
          Manage Your Business<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">At the Speed of Light</span>
        </h1>
        
        <p class="text-lg md:text-xl text-white/60 max-w-2xl mb-12 font-light leading-relaxed animate-fade-in-up" style="animation-delay: 200ms;">
          The ultimate platform combining seamless Deals Kanban, powerful Task Management, and industry-standard Role-Based Access Control to hypercharge your enterprise.
        </p>
        
        <div class="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up" style="animation-delay: 300ms;">
          <button (click)="goToDashboard()" class="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-lg">
            Launch Platform
          </button>
          <a href="#features" class="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/80 font-semibold hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto text-lg backdrop-blur-sm text-center">
            Explore Features
          </a>
        </div>
      </main>

      <!-- Stats Section -->
      <section class="relative z-10 py-16 px-6 border-y border-white/5 bg-black/20">
        <div class="max-w-5xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            @for (stat of stats; track stat.label) {
              <div class="text-center">
                <div class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{{ stat.value }}</div>
                <div class="text-xs md:text-sm text-white/50 mt-2 uppercase tracking-wider">{{ stat.label }}</div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-bold mb-6">Built for the <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Top 1%</span></h2>
          <p class="text-white/50 max-w-2xl mx-auto text-lg">Experience unparalleled performance with industry-standard features designed to elevate your workflow and scale effortlessly.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (feature of features; track feature.title) {
            <div class="group p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-1 hover:border-white/10">
              <div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" [ngClass]="feature.bgColor">
                <span [innerHTML]="feature.icon" [ngClass]="feature.color"></span>
              </div>
              <h3 class="text-lg md:text-xl font-bold mb-3 text-white/90">{{ feature.title }}</h3>
              <p class="text-white/50 leading-relaxed mb-4 text-sm">{{ feature.description }}</p>
              <ul class="space-y-2">
                @for (benefit of feature.benefits; track benefit) {
                  <li class="flex items-center gap-2 text-xs text-white/40">
                    <svg class="w-4 h-4 text-brand-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    {{ benefit }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </section>

      <!-- Feature Highlight Sections -->
      <section class="relative z-10 py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-950/10">
        <div class="max-w-6xl mx-auto">
          
          <!-- CRM Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div class="order-2 lg:order-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> CRM Suite
              </div>
              <h2 class="text-3xl md:text-4xl font-bold mb-4">Complete <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Customer Relationship</span> Management</h2>
              <p class="text-white/60 mb-6 leading-relaxed">Transform your sales process with our comprehensive CRM tools. From contact management to deal tracking, everything you need to close more deals faster.</p>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Contact Management</h4>
                    <p class="text-sm text-white/50">Organize and track all your contacts in one place</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Deals Kanban</h4>
                    <p class="text-sm text-white/50">Visual pipeline with drag-and-drop deal management</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Export & Reports</h4>
                    <p class="text-sm text-white/50">Generate detailed reports and export data</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="order-1 lg:order-2">
              <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div class="space-y-3">
                  <div class="flex gap-3">
                    <div class="w-1 h-12 bg-emerald-500/50 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-2 w-3/4 bg-white/10 rounded"></div>
                      <div class="h-2 w-1/2 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="w-1 h-16 bg-purple-500/50 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-2 w-5/6 bg-white/10 rounded"></div>
                      <div class="h-2 w-2/3 bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <div class="w-1 h-8 bg-cyan-500/50 rounded-full"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-2 w-1/2 bg-white/10 rounded"></div>
                      <div class="h-2 w-3/4 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tasks Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Task Management
              </div>
              <h2 class="text-3xl md:text-4xl font-bold mb-4">Powerful <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Task Pipeline</span> for Teams</h2>
              <p class="text-white/60 mb-6 leading-relaxed">Streamline your team's workflow with advanced task management. List and Board views, priority tracking, assignees, and detailed checklists.</p>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Dual View Modes</h4>
                    <p class="text-sm text-white/50">Switch between List and Kanban Board views</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Drag & Drop</h4>
                    <p class="text-sm text-white/50">Easily move tasks between status columns</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Checklists & Comments</h4>
                    <p class="text-sm text-white/50">Break down tasks and collaborate with your team</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div class="flex gap-2 mb-4">
                  <button class="px-3 py-1.5 rounded-lg bg-brand-primary text-black text-xs font-bold">LIST</button>
                  <button class="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs font-bold">BOARD</button>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div class="w-4 h-4 rounded border border-white/20"></div>
                    <div class="flex-1">
                      <div class="h-2 w-2/3 bg-white/20 rounded"></div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">URGENT</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div class="w-4 h-4 rounded border border-white/20"></div>
                    <div class="flex-1">
                      <div class="h-2 w-1/2 bg-white/20 rounded"></div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">HIGH</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div class="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                      <svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div class="flex-1">
                      <div class="h-2 w-3/4 bg-white/10 rounded"></div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">DONE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Premium Features Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-brand-primary"></span> Premium Suite
              </div>
              <h2 class="text-3xl md:text-4xl font-bold mb-4">Enterprise <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence Hub</span></h2>
              <p class="text-white/60 mb-6 leading-relaxed">Unlock the full potential of your organization with advanced RBAC, workflow automations, detailed reporting, and team management tools.</p>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Advanced RBAC</h4>
                    <p class="text-sm text-white/50">Custom roles with granular permissions</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Workflow Automations</h4>
                    <p class="text-sm text-white/50">Build complex conditional workflows</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white">Insight Reports</h4>
                    <p class="text-sm text-white/50">Generate PDF and Excel reports</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="order-1 lg:order-2">
              <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <svg class="w-8 h-8 text-indigo-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <div class="text-lg font-bold text-white">RBAC</div>
                    <div class="text-xs text-white/50">Role-Based Access</div>
                  </div>
                  <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <svg class="w-8 h-8 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <div class="text-lg font-bold text-white">Automation</div>
                    <div class="text-xs text-white/50">Workflow Builder</div>
                  </div>
                  <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <svg class="w-8 h-8 text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    <div class="text-lg font-bold text-white">Reports</div>
                    <div class="text-xs text-white/50">Insight Engine</div>
                  </div>
                  <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <svg class="w-8 h-8 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <div class="text-lg font-bold text-white">Team</div>
                    <div class="text-xs text-white/50">Management</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- Pricing Preview -->
      <section class="relative z-10 py-24 px-6 border-t border-white/5">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Pricing</span></h2>
          <p class="text-white/60 mb-10">Choose the plan that fits your enterprise needs. Start free, upgrade as you grow.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 class="text-lg font-bold text-white mb-2">Starter</h3>
              <div class="text-3xl font-black mb-4">$0<span class="text-sm font-normal text-white/50">/mo</span></div>
              <ul class="text-left space-y-3 text-sm text-white/60 mb-6">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Up to 100 Contacts</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 50 Deals</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 100 Tasks</li>
              </ul>
              <button routerLink="/auth/register" class="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Get Started</button>
            </div>
            
            <div class="glass-panel p-6 rounded-2xl border border-brand-primary/30 bg-brand-primary/5 relative">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-primary text-black text-xs font-bold">POPULAR</div>
              <h3 class="text-lg font-bold text-white mb-2">Professional</h3>
              <div class="text-3xl font-black mb-4">$29<span class="text-sm font-normal text-white/50">/mo</span></div>
              <ul class="text-left space-y-3 text-sm text-white/60 mb-6">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Unlimited Contacts</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Unlimited Deals</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Unlimited Tasks</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Export & Reports</li>
              </ul>
              <button routerLink="/billing/pricing" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-[1.02] transition-all">Upgrade Now</button>
            </div>
            
            <div class="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 class="text-lg font-bold text-white mb-2">Enterprise</h3>
              <div class="text-3xl font-black mb-4">$99<span class="text-sm font-normal text-white/50">/mo</span></div>
              <ul class="text-left space-y-3 text-sm text-white/60 mb-6">
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Everything in Pro</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Advanced RBAC</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Workflow Automations</li>
                <li class="flex items-center gap-2"><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Priority Support</li>
              </ul>
              <button routerLink="/billing/pricing" class="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="relative z-10 py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to transform your workflow?</h2>
          <p class="text-xl text-white/60 mb-10">Join thousands of enterprises already scaling with our platform.</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/auth/register" class="px-10 py-5 rounded-full bg-white text-indigo-950 font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Start Your Journey Now
            </a>
            <a href="#features" class="px-10 py-5 rounded-full bg-white/5 border border-white/10 text-white/80 font-semibold hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
              Learn More
            </a>
          </div>
        </div>
      </section>
      
      <footer class="relative z-10 py-8 text-center text-white/40 border-t border-white/5 text-sm">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <img src="assets/astraeus_logo_3d.png" alt="A" class="w-full h-full object-cover">
            </div>
            <span>&copy; 2026 Astraeus CRM. All rights reserved.</span>
          </div>
          <div class="flex items-center gap-6">
            <a href="#" class="hover:text-white transition-colors">Privacy</a>
            <a href="#" class="hover:text-white transition-colors">Terms</a>
            <a href="#" class="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
  `]
})
export class LandingComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  @ViewChild('navWrapper') navWrapper?: ElementRef<HTMLElement>;
  
  user$ = this.store.select(selectUser);
  isMobileMenuOpen = false;

  stats: Stat[] = [
    { value: '10K+', label: 'Active Users' },
    { value: '50M+', label: 'Deals Tracked' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  features: Feature[] = [
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>'),
      title: 'Deals Kanban',
      description: 'Visualize your sales pipeline with an interactive drag-and-drop Kanban board.',
      benefits: ['Drag-and-drop interface', 'Value-based deal tracking', 'Pipeline value analytics', 'Priority color coding'],
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>'),
      title: 'Advanced RBAC',
      description: 'Granular role-based access control with custom permissions for different teams.',
      benefits: ['Custom role builder', 'Field-level permissions', 'Team-based access', 'Audit logging'],
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>'),
      title: 'Task Management',
      description: 'Powerful task pipeline with List and Board views, priorities, and assignees.',
      benefits: ['List & Board views', 'Drag-and-drop status', 'Priority tracking', 'Checklists & comments'],
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>'),
      title: 'Contact Management',
      description: 'Organize and track all your contacts with advanced search and filtering.',
      benefits: ['Contact database', 'Advanced search', 'Export functionality', 'Permission-gated'],
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'),
      title: 'Workflow Automations',
      description: 'Build complex conditional workflows that sync your CRM, Tasks, and tools.',
      benefits: ['Visual workflow builder', 'Conditional logic', 'Multi-step actions', 'Automation triggers'],
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      icon: this.getTrustedIcon('<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>'),
      title: 'Insight Reports',
      description: 'Generate deep-insight PDF and Excel reports with custom branding and metrics.',
      benefits: ['PDF & Excel export', 'Custom metrics', 'Brand customization', 'Scheduled reports'],
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    }
  ];

  ngOnInit() {
    // Check if user is already logged in
    this.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToDashboard() {
    this.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  toggleMobileMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isInsideLandingNav = !!target.closest('[data-landing-nav]');
    if (this.isMobileMenuOpen && !isInsideLandingNav) {
      this.closeMobileMenu();
    }
  }

  private getTrustedIcon(iconSvg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }
}
