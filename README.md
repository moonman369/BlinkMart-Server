# BlinkMart Server

Welcome to the **BlinkMart Server** repository!  
This project powers the backend for BlinkMart, a modern e-commerce platform built with Node.js, Express, and MongoDB.

---

## 🚀 Features

- **RESTful API** for products, categories, users, cart, orders, and addresses
- **JWT Authentication** with role-based access (User/Admin)
- **Razorpay Payment Integration** (COD & Online)
- **Order & Cart Management** with real-time updates
- **Address Book** for multiple delivery addresses
- **Razorpay Webhook Support** for payment events
- **Email Verification** for new users
- **Comprehensive Error Handling** with meaningful messages

---

## 🛠️ Tech Stack

- **Node.js** / **Express.js**
- **MongoDB** (Mongoose)
- **JWT** Authentication
- **Razorpay** Payment Gateway
- **Nodemailer** for email services
- **Socket.IO** (optional)
- **Docker** (optional)

---

## 📦 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/BlinkMart-Server.git
   cd BlinkMart-Server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**  
   Create a `.env` file in the root directory with the following:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d
   
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=https://your-frontend-url.com
   ```

4. **Run the server**
   ```bash
   npm run dev
   ```

---

## 📚 API Endpoints

### Auth

| Method | Endpoint                | Description         |
|--------|------------------------ |--------------------|
| POST   | `/api/v1/auth/register` | Register user      |
| POST   | `/api/v1/auth/login`    | Login user         |
| POST   | `/api/v1/auth/send-verification-email` | Send verification email |
| GET    | `/api/v1/auth/verify-email` | Verify email token |

### Products

| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | `/api/v1/product/get-all-products`| List all products     |
| GET    | `/api/v1/product/get-product/:id` | Get product by ID     |
| POST   | `/api/v1/product/create-product`  | Create product (Admin)|
| PUT    | `/api/v1/product/update-product/:id` | Update product (Admin)|
| DELETE | `/api/v1/product/delete-product/:id` | Delete product (Admin)|

### Categories & Subcategories

| Method | Endpoint                                 | Description           |
|--------|------------------------------------------|-----------------------|
| GET    | `/api/v1/category/get-all-categories`    | List all categories   |
| POST   | `/api/v1/category/create-category`       | Create category (Admin)|
| GET    | `/api/v1/subcategory/get-all-subcategories` | List all subcategories|
| POST   | `/api/v1/subcategory/create-subcategory` | Create subcategory (Admin)|

### Cart

| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| GET    | `/api/v1/cart/get-cart`   | Get user cart       |
| POST   | `/api/v1/cart/add-item`   | Add item to cart    |
| PUT    | `/api/v1/cart/update-item/:id` | Update cart item   |
| DELETE | `/api/v1/cart/remove-item/:id` | Remove cart item   |

### Address

| Method | Endpoint                          | Description         |
|--------|-----------------------------------|---------------------|
| GET    | `/api/v1/address/get-all-addresses` | Get all addresses  |
| POST   | `/api/v1/address/add-address`     | Add address         |
| PUT    | `/api/v1/address/update-address/:id` | Update address     |
| DELETE | `/api/v1/address/delete-address/:id` | Delete address     |

### Orders & Payments

| Method | Endpoint                              | Description                   |
|--------|---------------------------------------|-------------------------------|
| GET    | `/api/v1/order/get-order-details`     | Get user orders               |
| POST   | `/api/v1/order/create-cod-order`      | Create COD order              |
| POST   | `/api/v1/order/create-online-order`   | Create online payment order   |
| POST   | `/api/v1/order/verify-payment`        | Verify Razorpay payment       |
| POST   | `/api/v1/order/payment-failed`        | Mark order as payment failed  |
| POST   | `/api/v1/order/payment-cancelled`     | Mark order as cancelled       |
| POST   | `/api/v1/order/razorpay-webhook`      | Razorpay webhook endpoint     |

---

## 🏗️ Project Structure

```
BlinkMart-Server/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middlewares/         # Express middlewares 
├── models/              # Mongoose models
├── routes/              # Route definitions
├── utils/               # Utility functions
├── index.js             # Entry point
└── vercel.json          # Vercel deployment configuration
```

---

## � Payment Flow

1. **Order Created**: User places order (COD or Online)  
2. **Razorpay Order**: For online, backend creates Razorpay order  
3. **Payment**: User pays via Razorpay widget  
4. **Verification**: Frontend calls `/verify-payment` after success  
5. **Webhook**: Razorpay notifies backend via `/razorpay-webhook`  
6. **Order Status**: Order updated to Completed/Failed/Cancelled  

---

## 🧑‍💻 Contributing

1. Fork the repo  
2. Create your feature branch (`git checkout -b feature/feature-name`)  
3. Commit your changes (`git commit -m 'Add feature'`)  
4. Push to the branch (`git push origin feature/feature-name`)  
5. Open a Pull Request  

---

## 📄 License

MIT

---

**© 2025 BlinkMart. All rights reserved.**
