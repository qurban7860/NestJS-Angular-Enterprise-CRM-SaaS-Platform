# Enterprise CRM & Tasks Platform - Frontend

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![NgRx](https://img.shields.io/badge/NgRx-BA2BD2?style=for-the-badge&logo=NgRx&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A high-performance, premium enterprise dashboard built with **Angular 17** and **NgRx**, featuring a modern glassmorphism design system.

## ✨ Highlights

- **State Management**: Robust reactive architecture powered by NgRx (Store, Effects, Selectors).
- **Premium UI**: Modern glassmorphism aesthetics with optimized dark mode support.
- **Dynamic Kanban**: Fully interactive drag-and-drop pipeline for deals and tasks.
- **Real-Time Integration**: Integrated WebSockets (Socket.io) for live notifications, task comment synchronization, and system broadcasts.
- **Enterprise Features Dashboard**: Dedicated interfaces for Custom RBAC, Automated Workflows, and Advanced Reporting.
- **Billing & Subscriptions**: Seamless Stripe checkout integration with live feature-flagging based on subscription tiers.
- **Enterprise Components**: Reusable, atomic design components (Modals, Toasts, Charts, Global Search).
- **Real-time Validation**: Advanced reactive forms with deep validation logic.
- **Optimized Performance**: Standalone components, lazy loading, and OnPush change detection.

## 🎨 UI/UX Features

- **Glassmorphism Panels**: Semi-transparent, blurred backgrounds for a premium feel.
- **Micro-interactions**: Smooth transitions and hover effects using Tailwind CSS and Angular Animations.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.
- **Interactive Modals**: Custom confirmation and CRUD modals for enhanced safety and flow.

## 🛠️ Tech Stack

- **Framework**: [Angular 17+](https://angular.io/)
- **State Management**: [NgRx](https://ngrx.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag & Drop**: [@angular/cdk/drag-drop](https://material.angular.io/cdk/drag-drop/overview)
- **HTTP Client**: RxJS-based reactive services

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application:
   ```bash
   # Development
   ng serve
   
   # Production
   ng build --configuration production
   ```

3. Open in browser:
   Navigate to `http://localhost:4200`

## 📂 Project Structure

- `src/app/core`: Singleton services, NgRx state, and global components.
- `src/app/features`: Feature-based modules (CRM, Tasks, Dashboard).
- `src/app/shared`: Common UI components and utilities.
- `src/assets`: Design tokens, fonts, and static resources.

## 🧪 Testing

```bash
# Unit tests
ng test
```

## 📜 License

This project is [MIT licensed](LICENSE).
