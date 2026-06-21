# Full-Stack E-Commerce Web Application (Node.js + Express + MongoDB)

This is a premium, responsive full-stack E-Commerce Web Application with full product management (CRUD) and customer order tracking.

## 🛠️ Step-by-Step VS Code Setup Procedure

Follow these detailed steps to open, configure, seed, and run this project locally inside Visual Studio Code.

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File > Open Folder...** from the top menu.
3. Select this project folder: `C:\Users\venu3\.gemini\antigravity\scratch\ecommerce-app`.
4. Open the built-in terminal in VS Code:
   * Press ``Ctrl + ` `` (control + backtick) OR click **Terminal > New Terminal** at the top.

### Step 2: Install Node.js Dependencies
In the VS Code terminal, run the following command to install Express, Mongoose, JWT, and other packages:
```bash
npm install
```

### Step 3: Setup your MongoDB Database
You need a MongoDB database to run this application. You can choose **Option A** (Easiest & Cloud) or **Option B** (Local).

#### Option A: MongoDB Atlas (Recommended - Free Cloud DB)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free account.
2. Create a new free shared database cluster.
3. Create a **Database User** (with username and password) and make sure to copy their password.
4. In **Network Access**, add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so your local app can connect.
5. Click **Connect > Drivers**, and copy the **Connection String** (e.g., `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).
6. Open the file `.env` in VS Code and replace `MONGO_URI` with your connection string (replace `<password>` with your database user's actual password):
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

#### Option B: MongoDB Local Server
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community) on your Windows PC.
2. Start the MongoDB service on your local computer.
3. You can leave the default connection string in `.env` as:
   ```env
   MONGO_URI=mongodb://localhost:27017/ecommerce
   ```

### Step 4: Seed the Database
We have provided a script to seed initial high-quality products and default test accounts (an administrator and a customer) into the database. Run this script in the VS Code terminal:
```bash
npm run seed
```
*You should see:* `MongoDB Connected` and then `Seed data imported successfully!`.

### Step 5: Start the Server
Now run the dev server:
```bash
npm run dev
```
*You should see:* `Server running in development mode on port 5000` and `Click to open: http://localhost:5000`.

### Step 6: Explore the Web App
1. Open your browser and navigate to: **[http://localhost:5000](http://localhost:5000)**.
2. Try the features using the following seed accounts:

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Customer User** | `sanjay@example.com` | `sanjay123` | Search, add items to cart, checkout, view order history. |
| **Administrator** | `admin@example.com` | `admin123` | Add products, edit existing items, delete catalog items, update customer order statuses (Pending ➔ Shipped ➔ Delivered). |

---

## 🏗️ Project Architecture & File Structure

Here is a map of the codebase for your studies and modifications:

*   **`server.js`**: Core backend entry point. Connects to database, registers Express routes, and hosts static frontend files.
*   **`config/db.js`**: MongoDB connection helper via Mongoose.
*   **`models/`**:
    *   `User.js`: User schema. Hashes passwords with `bcryptjs` and signs auth tokens.
    *   `Product.js`: Product details (name, price, stock, category, etc.).
    *   `Order.js`: Order schema (items, prices, shipping address, status).
*   **`middleware/authMiddleware.js`**: Route guards (`protect` for logins, `admin` for admin-only routes).
*   **`controllers/`**:
    *   `authController.js`: Auth endpoints (register/login/profile).
    *   `productController.js`: Product Catalog CRUD handlers.
    *   `orderController.js`: Order placements, order status management.
*   **`public/`**:
    *   `index.html`: Modern Single Page Application structure.
    *   `css/style.css`: Clean, dark glassmorphism styling with custom variables, smooth transitions, and responsive grid layouts.
    *   `js/api.js`: Client fetch client for REST API endpoints with JWT handling.
    *   `js/components.js`: Dynamic component builders (catalog grids, details page, order tables).
    *   `js/app.js`: Main state router, event triggers, and UI controls.
*   **`data/seed.js`**: Clean database population script.
