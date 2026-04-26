# hk - Premium Bag Shop 🛍️👜

A full-stack premium e-commerce web application built using **Node.js, Express.js, MongoDB, and EJS**. Designed with a modern, high-contrast aesthetic using **Tailwind CSS**, this platform provides a seamless shopping experience for users and a robust management studio for administrators.

## 🌟 Key Features

### For Users 🧑‍💻
*   **Authentication:** Secure registration and login with encrypted passwords.
*   **Premium Storefront:** Browse a curated collection of premium bags (Tote Bags, Backpacks, Handbags, etc.).
*   **Dynamic Cart System:** 
    *   Add items, increase/decrease quantities seamlessly.
    *   Dynamic "Net Total" calculations including MRP, Discounts, and Platform fees.
*   **Wishlist (Likes):** Save favorite products directly to your browser's local storage and view them on a dedicated wishlist page.
*   **Profile Management:** Upload profile photos, and update your Full Name and Shipping Address.

### For Admins (Owners) 👑
*   **Seller Studio:** Dedicated dashboard for inventory management.
*   **Product Creation:** Easily add new products with images, pricing, discounts, and color customization (panel/text colors).
*   **Admin Profile Management:** Update GSTIN, full name, and upload a professional profile picture.

## 🛠️ Tech Stack

*   **Frontend:** EJS (Embedded JavaScript templates), HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication & Security:** JWT (JSON Web Tokens), bcrypt (Password Hashing)
*   **File Uploads:** Multer (Images are stored as `Buffer` in MongoDB and rendered via `base64`)
*   **Session & Messaging:** `express-session`, `connect-flash` (for UI notifications)

## 📂 Project Structure

*   `app.js` - Main application entry point and middleware configuration.
*   `routes/` - Express routing for users, owners, products, and index pages.
*   `models/` - Mongoose schemas (`user-model.js`, `owner-model.js`, `product-model.js`).
*   `views/` - EJS templates for the UI frontend (Shop, Cart, Profile, etc.).
*   `config/` - Database connection and Multer configuration.
*   `middlewares/` - Custom middlewares (e.g., `isLoggedin.js`).
*   `controllers/` - Authentication logic and controllers.

## 🛡️ Admin Setup Notes
To register as an Admin/Owner, ensure your `.env` is set to `NODE_ENV=development`. Navigate to `/owners` (or `/owners/admin`) to access the creation form. Once the first owner is created, the system prevents the creation of additional owners for security.

---
*Crafted with precision for premium lifestyle shopping.*
