# Requirements: Security, Account & Domain Management

## 1. Backend Security & Authentication
- **2FA (Google Authenticator)**: Store `two_fa_secret` in PostgreSQL.
- **Email Authentication**: Implement 6-digit PIN verification for new logins or as a fallback for 2FA.
- **JWT Refresh Token**: Implement token rotation using Redis to maintain secure sessions.
- **API Rate Limiting**: Implement Redis-based rate limiting on public endpoints (e.g., `GET /items`).
  - Limits: 60 req/min (Auth), 20 req/min (Public/IP).

## 2. Account & Profile Settings
- **Admin Profile Updates**: Admins can request username/email changes.
- **Approval System**: Profile changes require Superadmin approval before updating the `users` table.
- **User Management**: Unified interface for managing roles and activity logs.

## 3. Domain Modules (Priority)
- **Menu Management**: Centralized master data for both POS and Catering.
- **Catering Management**: Implement workflow from request to delivery.
- **Point of Sale (POS)**: Transactional logic for real-time sales (Phase 2).

## 4. Frontend Enhancements
- **UI Navigation**: Split Sidebar into 'Catering Management', 'Menu Management', and 'Point of Sale'.
- **Security Visibility**: Add an "Eye" icon to toggle password visibility in login/register forms.
- **Dashboard**: Separate API endpoint for real-time stats powered by Redis.