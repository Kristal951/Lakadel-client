# Lakadel 🛍️

Modern full-stack fashion e-commerce platform built to deliver a seamless online shopping experience with secure payments, admin analytics, and scalable architecture.

---

## 🧪 Demo Account

Email: demo@lakadel.com  
Password: password123

Stripe test card details :

- Card number - 4242 4242 4242 4242 
- Card exp date: Any future date 
- CVV: 123

---

## 🚀 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

![NextAuth](https://img.shields.io/badge/Auth-NextAuth-000000?style=flat-square)

![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)

![Paystack](https://img.shields.io/badge/Paystack-0BA4DB?style=flat-square&logo=paystack&logoColor=white)

![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)

![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square)

![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)

---

## ✨ Features

### 🛒 Storefront
- Product listing & filtering
- Product detail pages
- Image galleries
- Size & color selection

### 🧺 Cart System
- Persistent cart (guest + user)
- Cart merge on login
- Quantity updates
- Real-time totals

### 💳 Payments
- Stripe checkout
- Paystack integration
- Secure payment sessions
- Webhook verification

### 📦 Orders
- Order creation
- Payment status tracking
- Receipt support (PDF ready)
- Order history

### 🔐 Authentication
- Google OAuth
- Email/password login
- NextAuth session handling

### ☁️ Media Uploads
- Multi-image product uploads
- Cloudinary storage
- Optimized delivery

### 🧑‍💻 Admin Dashboard
- Revenue analytics
- Order monitoring
- Product management
- Status badges

---

## 🏗️ Architecture

Lakadel follows a full-stack monorepo architecture:

- **Frontend:** Next.js App Router
- **Backend:** API Route Handlers
- **Database:** PostgreSQL via Prisma
- **Auth:** NextAuth
- **Payments:** Stripe + Paystack
- **Media:** Cloudinary

---

## 📊 Admin Features

- Revenue charts
- Order insights
- Customer metrics
- Exportable reports

---

## 📸 Screenshots

> Add your screenshots in `/public/screenshots`

```md
![Home](./public/screenshots/home.png)
![Product](./public/screenshots/product.png)
![Cart](./public/screenshots/cart.png)
![Admin](./public/screenshots/admin.png)

```

## 🛠️ Getting Started
To get a local copy up and running, please follow these simple steps.

📦 Prerequisites
Make sure you have the following installed:

- Node.js (v18+ recommended)
- npm / pnpm / yarn
- PostgreSQL database
- Git
  
Check versions: 
```bash
node -v
npm -v
```

## Setup

1. 🚀 Clone Repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/lakadel.git
   cd lakadel
   ```
2. 📥 Install Dependencies
   Using npm:
   ```bash
   npm install
   ```
   Using pnpm
   ```bash
   pnpm install
   ```

   Using Yarn:
   ```bash
   yarn install
   ```
3. ⚙️ Environment Variables
   Create a .env file in the root directory:
   ```bash
   touch .env
   ```
   Add the following variables:
   ```env
   # DATABASE
    DATABASE_URL= **************

   #Google
    GOOGLE_CLIENT_ID= **************
    GOOGLE_CLIENT_SECRET= **************

   #NextAuth
    NEXTAUTH_SECRET= **************
    NEXTAUTH_URL= **************

   #Stripe
    STRIPE_SECRET_KEY= **************
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= **************
    STRIPE_WEBHOOK_SECRET= **************

   #Paystack
    PAYSTACK_SECRET_KEY= **************

   #Next
    NEXT_PUBLIC_APP_URL= **************

   #EmailJS
    NEXT_PUBLIC_EMAILJS_SERVICE_ID= **************
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID= **************
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY= **************

   #Cloudinary
    CLOUDINARY_CLOUD_NAME= **************
    CLOUDINARY_API_KEY= **************
    CLOUDINARY_API_SECRET= **************
   ```
4. 🗄️Database Setup (Prisma)
   Generate Prisma client :
   ```bash
   npx prisma generate
   ```
   Run migrations :
   ```bash
   npx prisma migrate dev
   ```
   Seed database (if seed file exists):
   ```bash
   npx prisma db seed
   ```
5. ☁️ Cloudinary Setup
   1. Create an account at cloudinary
   2. Copy:
      - Cloud name
      - Api key
      - Api secret
  3. Add them to .env
  Lakadel uses cloudinary for:
      - product images

   
