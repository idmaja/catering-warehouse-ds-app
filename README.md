# Warehouse Management System

Full-stack warehouse and catering management application with Go backend and React frontend.

## Project Structure

```
warehouse-app/
├── back-end/          # Go API server
├── front-end/         # React application
└── README.md
```

## Tech Stack

**Backend:**
- Go with Gin framework
- MongoDB database
- JWT authentication
- Google OAuth integration

**Frontend:**
- React with TypeScript
- Tailwind CSS
- Axios for API calls

## Quick Start

### Prerequisites
- Go 1.19+
- Node.js 16+
- MongoDB

### Backend Setup
```bash
cd back-end
go mod tidy
cp .env.example .env
# Configure your .env file
go run main.go
```

### Frontend Setup
```bash
cd front-end
npm install
cp .env.example .env
# Configure your .env file
npm start
```

## Features

- **Warehouse Management**: Items, categories, inventory tracking
- **Order Management**: Purchase and sales orders
- **Catering System**: Menu management and catering orders
- **User Management**: Role-based access (user/admin/superadmin)
- **Reports**: Dashboard with statistics
- **Authentication**: Email/password and Google OAuth
- **Activity Logging**: Audit trail for all actions

## API Documentation

View the interactive API documentation at `back-end/docs/index.html`

## Environment Variables

Copy `.env.example` files in both directories and configure:
- Database connection
- JWT secrets
- Google OAuth credentials
- Telegram bot settings

## Default Ports

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0)**.

- ✅ You may view and use this code for personal and educational purposes
- ❌ You may NOT use this code for commercial purposes
- ❌ You may NOT distribute modified versions of this code
- ✅ You must give appropriate credit to the original author

For more details, see the [LICENSE](LICENSE) file or visit https://creativecommons.org/licenses/by-nc-nd/4.0/