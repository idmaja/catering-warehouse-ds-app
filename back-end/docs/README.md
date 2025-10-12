# Warehouse Management API Documentation

This directory contains the API documentation for the Warehouse Management System.

## Files

- `swagger.yaml` - OpenAPI 3.0 specification file
- `index.html` - Swagger UI interface for viewing the documentation

## Viewing the Documentation

### Option 1: Local File
Open `index.html` in your web browser to view the interactive API documentation.

### Option 2: Online Swagger Editor
1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `swagger.yaml`
3. Paste it into the editor

### Option 3: VS Code Extension
Install the "Swagger Viewer" extension in VS Code and open the `swagger.yaml` file.

## API Overview

The Warehouse Management API provides endpoints for:

### Authentication
- User login with email/password
- Google OAuth integration
- JWT token-based authentication

### Warehouse Management
- **Items**: CRUD operations for inventory items
- **Categories**: Manage item categories
- **Orders**: Handle purchase and sales orders

### Catering Management
- **Menu Categories**: Organize catering menus
- **Menus**: Manage catering menu items
- **Submenus**: Handle menu variations
- **Catering Orders**: Process catering orders

### User Management (Super Admin)
- User CRUD operations
- Role-based access control
- Activity logging

### Reports
- Dashboard statistics
- Inventory reports

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access

The API has three user roles:

1. **User**: Read-only access to most resources
2. **Admin**: Can create, update, and delete warehouse and catering items
3. **Super Admin**: Full access including user management and activity logs

## Base URL

Development: `http://localhost:8080/api/v1`

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```