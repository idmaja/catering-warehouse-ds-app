# Warehouse Frontend

A React TypeScript frontend for the warehouse management system.

## Features

- User authentication (login/logout)
- Item management (CRUD operations)
- Responsive design with Tailwind CSS
- Role-based access control

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Make sure your Go backend is running on `http://localhost:8080`

## Default Login

- Username: `superadmin`
- Password: `aku1`

## API Endpoints Used

- `POST /api/v1/login` - User authentication
- `GET /api/v1/items` - Get all items
- `POST /api/v1/admin/items` - Create item (admin/superadmin only)
- `PUT /api/v1/admin/items/:id` - Update item (admin/superadmin only)
- `DELETE /api/v1/admin/items/:id` - Delete item (admin/superadmin only)