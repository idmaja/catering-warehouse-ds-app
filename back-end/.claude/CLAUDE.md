## 1. Project Overview

An integrated system for Catering Management and Point of Sale (POS) running on STB infrastructure (resource-constrained). The system uses a **Modular Monolith** architecture with a **Hybrid Database** strategy:

- **PostgreSQL**: Transactional Data (Orders, Menus, Users).
- **Redis**: Speed Layer (Session, Dashboard Counter, Caching).
- **MongoDB Atlas**: Log Layer (Audit Trail & Activity History).

## 2. Development & Build Commands

### Backend (Go)

- **Run Development**: `cd back-end && go run main.go`
- **Build Binary**: `cd back-end && go build -o ds-app`
- **Tidy Dependencies**: `go mod tidy`
- **Update Swagger**: `swag init` (If using Swagger)

### Frontend (React)

- **Install Dependencies**: `cd front-end && npm install`
- **Run Development**: `npm start`
- **Build Production**: `npm run build`

## 3. Testing Commands

- **Run All Backend Tests**: `cd back-end && go test ./...`
- **Run Specific Package Test**: `go test ./service/implementations/...`
- **Frontend Tests**: `cd front-end && npm test`

## 4. Code Patterns & “Skills”

### Account Approval Workflow

Admin profile updates must not be saved directly to the `users` table. They must be stored in the `approvals` table for Superadmin review.

**Pattern:**

1. Check Redis Key.
2. If found: Return.
3. If not: Retrieve from DB -> Save to Redis (TTL 1 Hour) -> Return.

## 5. Directory Structure

- `back-end/controller/`: API entry point.
- `back-end/models/`: GORM schema definitions (Postgres).
- `back-end/service/`: Pure business logic.
- `front-end/src/components/`: Modular UI components.

## 6. Architecture Diagrams

### Flow Chart

```mermaid
graph TD
    User((User/Cashier)) -->|Request| Gateway[Golang Gateway]
    Gateway -->|Check Session| RedisSession[(Redis: Session & OAuth)]
    
    Gateway -->|Validated| Backend[Backend Modular Monolith]
    
    subgraph “Backend Modules”
        Menu[Menu Module]
        POS[POS Module]
        History[History Module]
    end

    Menu -->|Read/Write| Postgres[(PostgreSQL Local: Master Data)]
    Menu -.->|Cache| RedisMenu[(Redis: Menu Cache)]
    
    POS -->|Transaction| Postgres
    POS -->|Update Counter| RedisStats[(Redis: Dashboard Stats)]
    
    Backend -->|Async Log| History
    History -->|Save Document| MongoAtlas[(MongoDB Atlas: Audit & History)]
```

### Flowchart Superadmin Approval dan Rate Limiting

```mermaid
graph TD
    User((User)) -->|Request| RateLimit{Rate Limiter}
    RateLimit -->|Exceeded| 429[Error 429: Too Many Requests]
    RateLimit -->|Pass| Gateway[Golang Gateway]
    
    Gateway -->|Auth Check| JWT{JWT Valid?}
    JWT -->|Expired| Refresh[Refresh Token Logic]
    JWT -->|Valid| Roles{Role Check}
    
    subgraph "Account & Security"
        Roles --> AdminSet[Admin Profile Settings]
        AdminSet -->|Request| Approval[(Postgres: Approvals Table)]
        Approval -->|Notify| Superadmin((Superadmin/Owner))
    end

    subgraph "Domain Modules"
        Roles --> Menu[Menu Management]
        Roles --> Catering[Catering Management]
        Roles --> POS[Point of Sale]
    end

    Menu & Catering & POS -->|Async Log| MongoAtlas[(MongoDB Atlas: Audit Logs)]
```

### ERD

```mermaid
erDiagram
    AUDIT_LOGS {
        string _id
        string user_id
        string action
        string endpoint
        object payload
        string ip_address
        timestamp created_at
    }
    ORDER_HISTORY {
        string _id
        string pg_order_id
        string customer_name
        array items
        number total_amount
        string status
        timestamp completed_at
    }
    ACTIVITY_FEEDS {
        string _id
        string actor
        string module
        string description
        timestamp timestamp
    }
```

### System Flow

```mermaid
graph TD
    User --> Gateway[Go Gateway]
    Gateway --> RedisAuth[(Redis: Session)]
    Gateway --> Backend[Modular Monolith]
    Backend --> Postgres[(Postgres: Core)]
    Backend --> RedisCache[(Redis: Stats/Cache)]
    Backend -->|Async| MongoAtlas[(Mongo Atlas: Logs)]
```

### Data Schema (Hybrid)

```mermaid
erDiagram
    POSTGRES_ORDER ||--o{ POSTGRES_ORDER_ITEM : “contains”
    POSTGRES_ORDER {
        uuid id PK
        decimal total
        string status
    }
    MONGO_AUDIT_LOG {
        string action
        json changes
        timestamp created_at
    }
```

## 7. Style Guidelines

- **Naming**: Use `PascalCase` for functions and structs exported in Go.
- **Error Handling**: Never ignore errors. Use `fmt.Errorf` with clear context.
- **Frontend**: Use Tailwind CSS for styling. New components must be placed in `front-end/src/components/`.