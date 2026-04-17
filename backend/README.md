# Enterprise CRM & Tasks Platform - Backend

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A production-ready, multi-tenant enterprise backend built with **NestJS**, following clean architecture principles and industry best practices.

## 🚀 Key Features

- **Multi-tenant Architecture**: Strict organization-level data isolation.
- **Enterprise Security**: JWT-based authentication with Role-Based Access Control (RBAC).
- **Domain Driven Design (DDD)**: Logic organized into Use Cases, Repositories, and Domain Entities.
- **Task Management**: Full task lifecycle, status transitions, and assignee management.
- **CRM Suite**: Lead tracking, Contact management, and Deal pipeline (Kanban support).
- **File Management**: Integrated file upload and attachment system.
- **Automated Documentation**: Full Swagger/OpenAPI integration.

## 🏗️ Architecture

The backend follows a layered architecture to ensure scalability and maintainability:

```mermaid
graph TD
    Controller[Presentation Layer - Controllers] --> UseCase[Application Layer - Use Cases]
    UseCase --> Domain[Domain Layer - Entities & Logic]
    UseCase --> Repository[Infrastructure Layer - Repositories]
    Repository --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
```

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Class-validator](https://github.com/typestack/class-validator)
- **Security**: Passport.js + JWT
- **Documentation**: Swagger UI

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment:
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/crm_db"
   JWT_SECRET="your-super-secret-key"
   ```

3. Database Migration:
   ```bash
   npx prisma migrate dev
   ```

4. Run the application:
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## 📖 API Documentation

Once the server is running, access the interactive Swagger documentation at:
`http://localhost:3000/api/docs`

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```

## 📜 License

This project is [MIT licensed](LICENSE).
