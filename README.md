# 📦 E-commerce Backend API

This repository provides a backend API for an e-commerce platform, built using Node.js and Express. The API facilitates essential e-commerce operations such as product management, user authentication, and order processing.

## ⚙️ Project Structure

The project is organized into the following directories:

- `middlewares/`: Contains middleware functions for request processing.
- `models/`: Defines the data models for the application.
- `routes/`: Specifies the API endpoints and their handlers.

## 🔧 Setup and Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Pooya-Y/ecommerce.git
   cd ecommerce
   
2. **Install dependencies:**

   ```bash
   npm install
3. **Start the server:**

   ```bash
   npm start

The API provides the following endpoints:

- `GET /products`: Retrieves a list of all products.

- `GET /products?category={category}`: Filter products by category.

- `GET /products/:id`: Retrieves details of a specific product by ID.

- `POST /products`: Adds a new product to the catalog.

**Sample request body for `POST /products`:**
```json
{
  "name": "Wireless Mouse",
  "description": "A smooth and responsive wireless mouse.",
  "price": 25.99,
  "category": "Electronics"
}

   
