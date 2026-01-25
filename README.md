# Odoo Cafe POS

A modern, full-stack Point of Sale (POS) system designed for restaurants and cafes. Built with React, Node.js, Express, PostgreSQL, and Prisma ORM.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Installation](#installation)
- [Configuration](#configuration)

## Overview

Odoo Cafe POS is a comprehensive restaurant management system that provides real-time order tracking, inventory management, kitchen display integration, and detailed analytics. The system supports multiple branches, terminals, and floor layouts with live synchronization across all connected devices.

## Technology Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Framer Motion for animations
- Socket.IO client for real-time updates
- Zustand for state management
- React Router for navigation

### Backend

- Node.js with Express
- PostgreSQL database [(click here to view the db schema)](https://drawsql.app/teams/goon-squad/diagrams/odoo-pos "DB Schema")
- Prisma ORM
- Socket.IO for real-time communication
- JWT authentication
- Bcrypt for password hashing

## Core Features

### 1. Authentication and User Management

**Login System**

- Secure JWT-based authentication
- Password hashing with bcrypt
- Session persistence with token storage
- Role-based access control

**User Roles**

- Admin access for system configuration
- Staff access for POS operations
- Kitchen staff access for order management

### 2. Point of Sale (POS) Interface

**Table Management**

- Visual floor plan with table status indicators
- Real-time table availability (Free, Occupied, Reserved)
- Multi-floor support with floor selector
- Click-to-select table for order creation

**Order Creation**

- Product browsing with category filters
- Search functionality for quick product lookup
- Quantity adjustment and item customization
- Order notes and special instructions
- Order type selection (Dine-in, Takeaway)

**Order Management**

- View all active orders
- Order status tracking (Created, In Progress, Ready, Completed)
- Modify existing orders
- Split bills and partial payments
- Print receipts

### 3. Kitchen Display System

**Order Tickets**

- Real-time order notifications
- Visual order cards with item details
- Status-based color coding (Red for To Cook, Orange for Preparing, Green for Completed)
- Table number display
- Customer name or walk-in indicator
- Order notes visibility

**Filtering and Search**

- Filter by order status (All, To Cook, Preparing, Completed)
- Search by order number or product name
- Filter by specific products
- Filter by product categories
- Pagination for large order volumes

**Order Workflow**

- One-click status advancement
- Click order to start cooking (Created to In Progress)
- Click again to mark as ready (In Progress to Ready)
- Automatic table release when order is ready
- Real-time updates across all connected displays

### 4. Floor and Table Configuration

**Floor Management**

- Create multiple floors/dining areas
- Edit floor names
- Delete floors with cascade delete protection
- Real-time synchronization of floor changes

**Table Setup**

- Add tables with custom numbers
- Assign tables to specific floors
- Edit table details
- Bulk table operations (select multiple, duplicate, delete)
- Active/inactive table status toggle

### 5. Inventory Management

**Product Management**

- Create products with details (name, price, description)
- Assign products to categories
- Upload product images to Azure Blob Storage
- Set product availability status
- Pricing management

**Category Management**

- Create product categories
- Assign category icons
- Edit category details
- Delete categories with product reassignment

### 6. Branch and Terminal Management

**Branch Configuration**

- Multi-branch support
- Branch-specific data isolation
- Branch settings and customization

**Terminal Setup**

- Create POS terminals
- Assign terminals to branches
- Terminal-specific configurations
- Active/inactive terminal status

**Session Management**

- Open/close POS sessions
- Track session duration
- Record total sales per session
- Session history and reports

### 7. Reports and Analytics

**Sales Reports**

- Daily, weekly, and monthly sales summaries
- Revenue tracking by date range
- Top-selling products analysis
- Category-wise sales breakdown

**Order Analytics**

- Order volume tracking
- Average order value calculations
- Order status distribution
- Peak hours analysis

**Product Performance**

- Product sales rankings
- Category performance metrics
- Inventory turnover rates

### 8. Real-time Synchronization

**Socket.IO Integration**

- Live order updates across all devices
- Real-time table status changes
- Instant kitchen display notifications
- Connection status indicators
- Automatic reconnection handling

**Multi-device Support**

- Simultaneous POS terminal operation
- Synchronized inventory updates
- Live kitchen display coordination
- Cross-device order tracking

### 9. User Interface Features

**Modern Design**

- Clean, intuitive interface
- Responsive design for tablets and desktops
- Dark and light theme support
- Smooth animations and transitions
- Touch-friendly controls

**Dashboard**

- Quick stats overview
- Recent activity feed
- Sales charts and visualizations
- Quick action shortcuts

**Navigation**

- Sidebar navigation system
- Breadcrumb trails
- Quick search functionality
- Keyboard shortcuts

### 10. Security Features

**Authentication**

- Secure password storage
- JWT token-based sessions
- Automatic session expiration
- Protected API endpoints

**Data Protection**

- SQL injection prevention via Prisma
- XSS protection
- CORS configuration
- Input validation and sanitization

## Installation

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory

```bash
cd Odoo-Cafe-POS-Backend
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file with the following variables

```
PORT=5000
DATABASE_URL=MY_DB_URL
JWT_SECRET=MY_SUPER_SECRET_JWT_KEY

# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME=azure_account
AZURE_STORAGE_ACCOUNT_KEY=azure_account_key
AZURE_STORAGE_CONTAINER_NAME=azure_container
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Seed the database

```bash
npx prisma db seed
```

6. Start the server

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory

```bash
cd Odoo-Cafe-POS-Frontend
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Access the application at `http://localhost:5173`

## Configuration

### Database Configuration

The database schema is managed through Prisma. To modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Apply migrations with `npx prisma db push`

### Environment Variables

**Backend**

- `DATABASE_URL`: PostgreSQL connection string (Aiven Cloud hosted)
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default 5000)
- `AZURE_STORAGE_ACCOUNT_NAME`: Azure Storage Account name (odoocafepos)
- `AZURE_STORAGE_ACCOUNT_KEY`: Azure Storage Account access key
- `AZURE_STORAGE_CONTAINER_NAME`: Container name for product images (odoocafe)

**Frontend**

- API endpoints are configured in individual API files
- Default backend URL: `http://localhost:5000/api`

### Azure Blob Storage Setup

The system uses Azure Blob Storage for managing product images. To configure:

1. Create an Azure Storage Account

   - Log in to Azure Portal
   - Create a new Storage Account
   - Choose a unique account name
   - Select your preferred region
2. Create a Container

   - Navigate to your Storage Account
   - Go to Containers section
   - Create a new container named `product-images`
   - Set public access level to `Blob` (anonymous read access for blobs)
3. Get Connection String

   - Go to Storage Account settings
   - Navigate to "Access keys" section
   - Copy the connection string
   - Add to `.env` as `AZURE_STORAGE_CONNECTION_STRING`
4. Configure CORS (if needed)

   - Go to Storage Account settings
   - Navigate to "Resource sharing (CORS)" section
   - Add allowed origins for your frontend domain
   - Allow GET, POST, PUT, DELETE methods

**Image Upload Flow**

- Product images are uploaded via the upload endpoint
- Images are stored in Azure Blob Storage
- Public URLs are returned and stored in the database
- Images are accessible via direct Azure CDN links

### Default Credentials

After running the seed script, you can log in with:

- Email: `admin@odoo-cafe.com`
- Password: `password123`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Kitchen

- `GET /api/kitchen/orders` - Get active kitchen orders
- `GET /api/kitchen/ready` - Get ready orders
- `POST /api/kitchen/orders/:id/start` - Start cooking
- `POST /api/kitchen/orders/:id/ready` - Mark as ready
- `PATCH /api/kitchen/orders/:id/status` - Update order status

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Floors

- `GET /api/floors` - Get all floors
- `POST /api/floors` - Create floor
- `PUT /api/floors/:id` - Update floor
- `DELETE /api/floors/:id` - Delete floor

### Tables

- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Terminals

- `GET /api/terminals` - Get all terminals
- `POST /api/terminals` - Create terminal
- `PUT /api/terminals/:id` - Update terminal

### Sessions

- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/close` - Close session

### Reports

- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/products` - Get product performance

## Real-time Events

### Socket.IO Events

**Kitchen Events**

- `kitchen:newOrder` - New order created
- `kitchen:orderUpdate` - Order status changed
- `kitchen:ready` - Order marked as ready

**Table Events**

- `table:updated` - Table status changed
- `table:occupied` - Table marked as occupied
- `table:freed` - Table marked as free

**Order Events**

- `order:created` - New order created
- `order:updated` - Order modified
- `order:completed` - Order completed

## Database Schema

### Core Tables

- **User** - System users and authentication
- **Branch** - Restaurant branches
- **Terminal** - POS terminals
- **POSSession** - Terminal sessions
- **Floor** - Dining area floors
- **Table** - Individual tables
- **Category** - Product categories
- **Product** - Menu items
- **Order** - Customer orders
- **OrderItem** - Individual order items
- **Payment** - Payment records

### Relationships

- Branches contain multiple floors and terminals
- Floors contain multiple tables
- Orders belong to tables and sessions
- Products belong to categories
- Orders contain multiple order items
