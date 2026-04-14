# 🌍 WanderLust

> A full-stack Airbnb-inspired travel listing platform — built with Node.js, Express, MongoDB, EJS, and Passport.js

![WanderLust Banner](./screenshots/Screenshot_2026-04-15_at_4_12_52_AM.png)

---

## 📸 Screenshots

| Page | Preview |
|------|---------|
| All Listings | ![Listings](./screenshots/Screenshot_2026-04-15_at_4_12_52_AM.png) |
| Listing Detail | ![Detail](./screenshots/Screenshot_2026-04-15_at_4_13_02_AM.png) |
| Reviews Section | ![Reviews](./screenshots/Screenshot_2026-04-15_at_4_13_10_AM.png) |
| Leave a Review (logged in) | ![Review Form](./screenshots/Screenshot_2026-04-15_at_4_13_38_AM.png) |
| Create Listing | ![Create](./screenshots/Screenshot_2026-04-15_at_4_14_05_AM.png) |
| Listing Owner View (Edit/Delete) | ![Owner](./screenshots/Screenshot_2026-04-15_at_4_14_13_AM.png) |
| Login | ![Login](./screenshots/Screenshot_2026-04-15_at_4_12_45_AM.png) |
| Signup | ![Signup](./screenshots/Screenshot_2026-04-15_at_4_12_38_AM.png) |
| Logged-in Homepage | ![Logged In](./screenshots/Screenshot_2026-04-15_at_4_14_46_AM.png) |

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design Patterns](#-architecture--design-patterns)
- [Security Implementation](#-security-implementation)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [Screenshots](#-screenshots)
- [Known Issues & Improvements](#-known-issues--improvements)

---

## 🧭 Overview

WanderLust is a production-grade, full-stack web application that enables users to discover, create, and review travel accommodations worldwide. Inspired by Airbnb, it demonstrates end-to-end implementation of user authentication, authorization, RESTful routing, server-side validation, and dynamic templating — entirely without a frontend JavaScript framework.

---

## ✨ Live Features

### 🔐 Authentication & Session Management
- Signup / Login / Logout powered by **Passport.js Local Strategy** with `passport-local-mongoose`
- Persistent login sessions using **express-session** with `httpOnly` cookies (7-day expiry)
- **Flash messages** via `connect-flash` for contextual success/failure feedback
- Post-login redirect to the originally intended URL (saved via `req.session.redirectUrl`)

### 🏠 Listing CRUD
- Full **Create / Read / Update / Delete** functionality for property listings
- Listings include: title, description, image URL (with fallback default), price, location, and country
- **Authorization enforced**: only the listing owner can edit or delete their listing
- Image field uses a Mongoose `set` transformer — empty submissions silently fall back to a default image
- `method-override` middleware enables PUT and DELETE from HTML forms

### ⭐ Review System
- Authenticated users can leave a **star rating (1–5)** and a comment on any listing
- **Author-level authorization**: only the review author can delete their own review
- Reviews are **cascade-deleted** when their parent listing is removed — implemented via a Mongoose `post('findOneAndDelete')` middleware hook on the Listing model

### 🔒 Route-Level Authorization
| Action | Middleware Used |
|--------|----------------|
| Create listing | `isLoggedIn` |
| Edit / Delete listing | `isLoggedIn` + `isOwner` |
| Create review | `isLoggedIn` + `validateReview` |
| Delete review | `isLoggedIn` + `isReviewAuthor` |

### 🛡️ Schema Validation with Joi
- All incoming request bodies for listings and reviews are validated **server-side** before hitting the database
- Custom `validateListing` and `validateReview` middleware functions use **Joi schemas** (`schema.js`) to enforce data integrity
- Malformed or missing fields throw a structured `ExpressError` with a 400 status

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Templating | EJS + ejs-mate (layout engine) |
| Authentication | Passport.js + passport-local + passport-local-mongoose |
| Session | express-session + connect-flash |
| Validation | Joi |
| Form Method Support | method-override |
| Environment Config | dotenv |
| Styling | Bootstrap 5 + custom CSS |

---

## 🏗️ Architecture & Design Patterns

### MVC-Inspired Structure
The app follows a clean separation of concerns:
- **Models** (`/models`) — Mongoose schemas with embedded business logic (cascade deletes, field transformers)
- **Routes** (`/routes`) — Express Router modules for `listings`, `reviews`, and `users`
- **Views** (`/views`) — EJS templates using `ejs-mate` for a shared layout boilerplate (`boilerplate.ejs`)
- **Middleware** (`middleware.js`) — Reusable middleware for auth guards (`isLoggedIn`, `isOwner`, `isReviewAuthor`) and validation (`validateListing`, `validateReview`)

### Async Error Handling with `wrapAsync`
All async route handlers are wrapped with a custom `wrapAsync` utility that forwards errors to Express's global error handler — eliminating repetitive `try/catch` blocks throughout routes.

```js
// utils/wrapAsync.js
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
```

### Centralized Error Handling
A custom `ExpressError` class (`utils/ExpressError.js`) standardizes error shape (`status` + `message`) across the app. All unhandled routes fall through to a 404 handler, and a single global middleware renders the `error.ejs` page.

### EJS-Mate Layout Boilerplate
`ejs-mate` enables a single `boilerplate.ejs` layout with shared navbar, footer, and flash message rendering — all EJS templates simply declare their content block.

---

## 🔐 Security Implementation

| Concern | Solution |
|---------|---------|
| Hardcoded secrets | Moved to `.env` via `dotenv` |
| Session secret | Read from `process.env.SESSION_SECRET` |
| MongoDB URL | Read from `process.env.MONGO_URL` |
| Cookie security | `httpOnly: true` on session cookie |
| Password storage | `passport-local-mongoose` uses `pbkdf2` hashing — **passwords are never stored in plain text** |
| Input validation | Joi validates all user inputs server-side before DB operations |
| Authorization bypass | Owner/author checks in dedicated middleware before any mutation |
| `.env` exposure | `.gitignore` excludes `.env`; `.env.example` ships as reference |

---

## 📁 Project Structure

```
WanderLust/
├── app.js                    # Entry point — Express app setup, middleware pipeline, route mounting
├── middleware.js             # Auth guards (isLoggedIn, isOwner, isReviewAuthor) + Joi validators
├── schema.js                 # Joi validation schemas for Listing and Review
│
├── models/
│   ├── listing.js            # Listing schema — owner ref, reviews array, cascade delete hook
│   ├── review.js             # Review schema — rating, comment, author ref
│   └── user.js               # User schema — passport-local-mongoose plugin
│
├── routes/
│   ├── listing.js            # RESTful routes: GET /listings, POST, GET /:id, PUT, DELETE
│   ├── review.js             # POST /listings/:id/reviews, DELETE /:reviewId
│   └── user.js               # GET/POST /signup, GET/POST /login, GET /logout
│
├── utils/
│   ├── wrapAsync.js          # Async error forwarding wrapper
│   └── ExpressError.js       # Custom error class (status + message)
│
├── views/
│   ├── layouts/
│   │   └── boilerplate.ejs   # Shared HTML shell (navbar, footer, flash messages)
│   ├── listings/
│   │   ├── index.ejs         # All listings grid
│   │   ├── show.ejs          # Single listing + reviews + review form
│   │   ├── new.ejs           # Create listing form
│   │   └── edit.ejs          # Edit listing form
│   ├── users/
│   │   ├── signup.ejs        # Signup form
│   │   └── login.ejs         # Login form
│   └── error.ejs             # Global error page
│
├── public/
│   ├── css/                  # Custom stylesheets
│   └── js/                   # Client-side scripts
│
├── init/
│   ├── data.js               # Seed data — sample listings
│   └── index.js              # DB seeder script
│
├── screenshots/              # UI screenshots for documentation
│
├── .env                      # ⚠️ Local secrets — NOT committed to Git
├── .env.example              # ✅ Safe template committed to Git
├── .gitignore                # Excludes node_modules, .env, OS files
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas cluster

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/wanderlust.git
cd wanderlust

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your MONGO_URL and SESSION_SECRET

# 4. Seed the database (optional)
node init/index.js

# 5. Start the development server
node app.js
# or with auto-restart:
npx nodemon app.js
```

Visit `http://localhost:8080/listings`

---

## 🔑 Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/wanderlust
SESSION_SECRET=your_strong_random_secret_here
```

**For production** (MongoDB Atlas):
```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/wanderlust?retryWrites=true&w=majority
SESSION_SECRET=64_char_random_hex_string
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌱 Database Seeding

The `init/` directory contains a one-time seeder to populate the database with 12 sample listings:

```bash
node init/index.js
```

> **Note:** The seeder calls `Listing.deleteMany({})` first — it wipes existing listings before inserting fresh data. Run only in development.

---


## 🛠️ Known Issues & Suggested Improvements

### 🐛 Bugs to Fix
- **`isOwner` middleware** — currently uses `Review.findById(id)` instead of `Listing.findById(id)`. This is a bug: it should query the `Listing` model to verify ownership.
- **SignUp form label** — the password field is labelled "Email" instead of "Password" (visible in the signup screenshot).
- **Login form label** — the password field is also labelled "Email" — should be "Password".
- **Root route (`/`)** — currently just logs to console with no response, which causes the browser to hang. Should redirect to `/listings`.

### 🚀 Feature Improvements
- **Image Upload** — Replace the manual image URL input with file upload support using **Multer** + **Cloudinary** for proper asset hosting
- **MongoDB Atlas + connect-mongo** — Use `connect-mongo` as the session store so sessions persist across server restarts and can be used in a production cloud environment
- **Map Integration** — Add **Mapbox** or **Leaflet.js** to render a pin on the listing's location on the show page
- **Search & Filter** — Allow filtering listings by country, price range, or keyword
- **Edit Review** — Currently reviews can only be deleted, not edited. Add PUT route + edit form
- **Pagination** — The all-listings page loads everything at once. Add page-based or infinite-scroll pagination for scale
- **Rate Limiting** — Add `express-rate-limit` on auth routes to prevent brute-force login attempts
- **Helmet.js** — Add `helmet` middleware to set secure HTTP headers (CSP, X-Frame-Options, etc.)
- **Input Sanitization** — Add `express-mongo-sanitize` to prevent NoSQL injection attacks on query parameters
- **Responsive Mobile UI** — The current layout benefits from further Bootstrap breakpoint tuning for smaller screens
- **User Profile Page** — Show all listings created by a given user at `/users/:id`
- **Booking System** — Add date-range selection and a booking/reservation model as a natural next step

---

## 👤 Author

Built by **Suyesh Singh** — [GitHub](https://github.com/Suyash066) · [LinkedIn](https://www.linkedin.com/in/suyesh-singh-848b2834a/)

---
