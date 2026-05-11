# Inventory Management REST API

## About This Project

This project is a backend REST API for an **Inventory Management System** built as the final project for CPE 114 – Software Design. The system solves a common and critical real-world problem faced by businesses of all sizes: the need to track, organize, and manage physical goods in a structured, reliable, and accessible way.

In any business environment — from small retail shops to large warehouses — keeping track of inventory manually is error-prone and inefficient. This API provides a centralized backend solution that allows client applications (mobile apps, web dashboards, point-of-sale systems) to programmatically create, read, update, and delete inventory records. By exposing a clean REST API, the system enables seamless integration with front-end interfaces or third-party services.

The Inventory Management API manages three core entities: **Categories**, **Items**, and **Suppliers**. Categories organize items into logical groupings (e.g., Electronics, Office Supplies). Items represent the actual physical goods in the inventory, each with a name, SKU (Stock Keeping Unit), quantity, price, and an assigned category. Suppliers represent the vendors or companies that provide the items. The relationship between items and suppliers is many-to-many — a single item can be sourced from multiple suppliers, and a single supplier can supply many different items. This is tracked through a junction model called `ItemSupplier`, which also stores additional data about the supply relationship such as the supply price and estimated lead time in days.

The API enforces proper input validation, consistent HTTP status codes, descriptive JSON error messages, and structured middleware for logging and error handling. The project follows the MVC (Model-View-Controller) architectural pattern to ensure clean separation of concerns, making the codebase maintainable, testable, and easy to extend.

---

## Tech Stack

| Technology   | Version  | Purpose                              |
|--------------|----------|--------------------------------------|
| Node.js      | 20.x     | JavaScript runtime environment       |
| Express.js   | ^4.19.2  | Web framework and HTTP routing       |
| Sequelize    | ^6.37.3  | ORM for data modeling and DB queries |
| MySQL        | 8.x      | Relational database                  |
| mysql2       | ^3.9.7   | MySQL driver for Node.js             |
| dotenv       | ^16.4.5  | Environment variable management      |

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher installed
- MySQL 8.x running locally or on a remote server
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/inventory-api.git
cd inventory-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_db
DB_USER=root
DB_PASSWORD=yourpassword
PORT=3000
```

> **Note:** Make sure your MySQL server is running and the database `inventory_db` exists. You can create it with:
> ```sql
> CREATE DATABASE inventory_db;
> ```

### 4. Start the Server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

Sequelize will automatically create and sync all tables on startup. You should see:

```
Database synced successfully.
Server running on http://localhost:3000
```

---

## Database Schema

### Table: `categories`

| Column      | Type         | Constraints              |
|-------------|--------------|--------------------------|
| id          | INT          | PK, AUTO_INCREMENT       |
| name        | VARCHAR(100) | NOT NULL, UNIQUE         |
| description | TEXT         | nullable                 |
| createdAt   | DATETIME     | auto-managed             |
| updatedAt   | DATETIME     | auto-managed             |

### Table: `suppliers`

| Column       | Type         | Constraints              |
|--------------|--------------|--------------------------|
| id           | INT          | PK, AUTO_INCREMENT       |
| name         | VARCHAR(150) | NOT NULL                 |
| contactEmail | VARCHAR(150) | NOT NULL, UNIQUE         |
| phone        | VARCHAR(30)  | nullable                 |
| address      | TEXT         | nullable                 |
| createdAt    | DATETIME     | auto-managed             |
| updatedAt    | DATETIME     | auto-managed             |

### Table: `items`

| Column      | Type           | Constraints                        |
|-------------|----------------|------------------------------------|
| id          | INT            | PK, AUTO_INCREMENT                 |
| name        | VARCHAR(150)   | NOT NULL                           |
| description | TEXT           | nullable                           |
| sku         | VARCHAR(50)    | NOT NULL, UNIQUE                   |
| quantity    | INT            | NOT NULL, DEFAULT 0, min 0         |
| price       | DECIMAL(10,2)  | NOT NULL, min 0                    |
| categoryId  | INT            | FK → categories.id, NOT NULL       |
| createdAt   | DATETIME       | auto-managed                       |
| updatedAt   | DATETIME       | auto-managed                       |

### Table: `item_suppliers` (Junction Table)

| Column       | Type          | Constraints                    |
|--------------|---------------|--------------------------------|
| id           | INT           | PK, AUTO_INCREMENT             |
| itemId       | INT           | FK → items.id                  |
| supplierId   | INT           | FK → suppliers.id              |
| supplyPrice  | DECIMAL(10,2) | nullable                       |
| leadTimeDays | INT           | nullable                       |
| createdAt    | DATETIME      | auto-managed                   |
| updatedAt    | DATETIME      | auto-managed                   |

---

## Relationship Diagram (ER Diagram)

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  categories │       │    items    │       │   suppliers  │
│─────────────│       │─────────────│       │──────────────│
│ id (PK)     │──1──< │ id (PK)     │ >──M──│ id (PK)      │
│ name        │       │ name        │  via  │ name         │
│ description │       │ description │       │ contactEmail │
└─────────────┘       │ sku         │  item_│ phone        │
                      │ quantity    │ suppli│ address      │
                      │ price       │  ers  └──────────────┘
                      │ categoryId  │
                      └─────────────┘

Relationships:
  Category (1) ──── hasMany ──── Items (M)
  Item (M) ──── belongsToMany ──── Supplier (M)  [through item_suppliers]
```

---

## API Reference

### Categories

| Method | Path               | Body                          | Description                             |
|--------|--------------------|-------------------------------|-----------------------------------------|
| GET    | /categories        | —                             | Returns all categories                  |
| GET    | /categories/:id    | —                             | Returns category + its items            |
| POST   | /categories        | `{ name, description? }`      | Creates a new category                  |
| PUT    | /categories/:id    | `{ name?, description? }`     | Updates a category                      |
| DELETE | /categories/:id    | —                             | Deletes a category                      |

**Example POST body:**
```json
{ "name": "Electronics", "description": "Electronic devices and accessories" }
```

**Example response (201):**
```json
{ "id": 1, "name": "Electronics", "description": "Electronic devices", "createdAt": "...", "updatedAt": "..." }
```

---

### Suppliers

| Method | Path                  | Body                                         | Description                       |
|--------|-----------------------|----------------------------------------------|-----------------------------------|
| GET    | /suppliers            | —                                            | Returns all suppliers             |
| GET    | /suppliers/:id        | —                                            | Returns supplier + its items      |
| GET    | /suppliers/:id/items  | —                                            | Returns all items for a supplier  |
| POST   | /suppliers            | `{ name, contactEmail, phone?, address? }`   | Creates a new supplier            |
| PUT    | /suppliers/:id        | `{ name?, contactEmail?, phone?, address? }` | Updates a supplier                |
| DELETE | /suppliers/:id        | —                                            | Deletes a supplier                |

---

### Items

| Method | Path                               | Body                                                        | Description                         |
|--------|------------------------------------|-------------------------------------------------------------|-------------------------------------|
| GET    | /items                             | —                                                           | Returns all items with category     |
| GET    | /items/:id                         | —                                                           | Returns item + category + suppliers |
| POST   | /items                             | `{ name, sku, price, categoryId, description?, quantity? }` | Creates a new item                  |
| PUT    | /items/:id                         | any subset of item fields                                   | Updates an item                     |
| DELETE | /items/:id                         | —                                                           | Deletes an item                     |
| POST   | /items/:id/suppliers/:supplierId   | `{ supplyPrice?, leadTimeDays? }`                           | Assigns a supplier to an item       |
| DELETE | /items/:id/suppliers/:supplierId   | —                                                           | Removes a supplier from an item     |

---

## Error Responses

| Status | Error Scenario                             | JSON Structure                                                    |
|--------|--------------------------------------------|-------------------------------------------------------------------|
| 400    | Missing required fields in POST            | `{ "error": "Validation Error", "message": "Field X is required." }` |
| 400    | Duplicate unique value (name, SKU, email)  | `{ "error": "Validation Error", "message": "..." }`              |
| 400    | Invalid categoryId reference               | `{ "error": "Validation Error", "message": "Category X does not exist." }` |
| 404    | Resource not found by ID                   | `{ "error": "Item not found", "message": "No item with id X." }` |
| 404    | Undefined route                            | `{ "error": "Route not found", "message": "..." }`               |
| 500    | Unexpected server error                    | `{ "error": "Internal Server Error", "message": "An unexpected error occurred." }` |

---

## Project Structure

```
inventory-api/
├── config/
│   └── database.js         # Sequelize connection
├── controllers/
│   ├── categoryController.js
│   ├── supplierController.js
│   └── itemController.js
├── middleware/
│   ├── logger.js           # Custom request logger
│   ├── notFound.js         # 404 catch-all
│   └── errorHandler.js     # Global error handler (4 params)
├── models/
│   ├── index.js            # Loads models + associations
│   ├── Category.js
│   ├── Supplier.js
│   ├── Item.js
│   └── ItemSupplier.js     # Junction table model
├── routes/
│   ├── categories.js
│   ├── suppliers.js
│   └── items.js
├── docs/
│   └── postman_collection.json
├── .env.example
├── .gitignore
├── index.js                # App entry point
├── package.json
└── README.md
```
