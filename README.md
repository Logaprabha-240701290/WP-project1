# Smart Book Lending and Exchange Platform (BookLoop)

> **A peer-to-peer campus book circulation web application built for college students.**  
> Built with **React 18 + Vite** on the frontend, **Flask 3 + SQLAlchemy** on the backend, and **SQLite** for zero-configuration database persistence.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Architecture](#project-architecture)
3. [Windows Setup & Running](#windows-setup--running)
   - [One-Click Setup & Launch](#1-one-click-setup--launch)
   - [VS Code Native Tasks](#2-vs-code-native-tasks)
   - [Manual Terminal Commands](#3-manual-terminal-commands)
4. [Demo Accounts & Credentials](#demo-accounts--credentials)
5. [Complete API Route Documentation](#complete-api-route-documentation)
6. [Core Business Logic Rules](#core-business-logic-rules)
7. [Production Deployment (Render & Vercel)](#production-deployment-render--vercel)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [College Project Viva Q&A](#college-project-viva-qa)

---

## Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Single-page application, React Router v6, Axios, Font Awesome 6 (CDN) |
| **Styling** | Plain Custom CSS | Deep blue (`#1e3a8a`) & warm orange (`#f97316`) theme, Grid & Flexbox |
| **Backend** | Python 3.10+, Flask 3.x | Blueprint-based REST API, Werkzeug password hashing |
| **Authentication** | Flask-JWT-Extended 4.x | Stateless JWT bearer tokens with active status revocation checks |
| **ORM & Database** | Flask-SQLAlchemy 3.x, SQLite | File database at `backend/bookloop.db`, cascade deletes, automatic migration |
| **CORS** | Flask-CORS | Cross-origin resource sharing allowing `http://localhost:5173` |

---

## Project Architecture

```text
bookloop/
├── .vscode/
│   ├── tasks.json         # VS Code tasks: Setup, Run Backend, Run Frontend, Run BookLoop
│   ├── launch.json        # Debug configs for Flask and Chrome
│   ├── extensions.json    # Recommended VS Code extensions
│   └── settings.json      # Python interpreter pointing to venv
├── .gitignore             # Ignores venv, node_modules, bookloop.db, uploads, .env
├── setup.bat              # One-click install (venv, pip, seed, npm)
├── start.bat              # One-click launcher (parallel terminal windows)
├── backend/
│   ├── app.py             # Flask app factory, CORS, JWT loaders, global error handlers
│   ├── config.py          # Application configs (keys, limits, db path)
│   ├── models.py          # SQLAlchemy models (User, Book, BookRequest, Wishlist, Rating, Message)
│   ├── seed.py            # Database seed script (idempotent, 1 admin, 5 users, 15 books, reviews)
│   ├── test_flow.py       # End-to-end integration test runner (8 core assertions)
│   ├── requirements.txt   # Python dependency declarations
│   ├── routes/
│   │   ├── auth_helpers.py# Decorators: @auth_required, @admin_required, allowed_file
│   │   ├── auth.py        # /api/auth (register, login, me)
│   │   ├── books.py       # /api/books (search, filter, pagination, CRUD, mine, featured)
│   │   ├── requests.py    # /api/requests (request, received, sent, accept, reject, cancel, return)
│   │   ├── wishlist.py    # /api/wishlist (get, add, delete)
│   │   ├── ratings.py     # /api/ratings (1-5 star reviews between returned exchange peers)
│   │   ├── profile.py     # /api/profile (view, edit details, change password)
│   │   ├── contact.py     # /api/contact (submit campus support inquiries)
│   │   └── admin.py       # /api/admin (stats, manage users, block/unblock, manage books)
│   └── uploads/           # Automatically created directory for book cover images
└── frontend/
    ├── index.html         # HTML root with Font Awesome & Google Fonts
    ├── package.json       # Frontend scripts and packages
    ├── vite.config.js     # Port 5173 with strictPort: true
    ├── .env               # VITE_API_URL=http://localhost:5000/api
    └── src/
        ├── main.jsx       # App bootstrap with BrowserRouter & AuthProvider
        ├── App.jsx        # Route definitions (public, protected user, admin)
        ├── api/axios.js   # Configured Axios instance with JWT interceptors
        ├── context/AuthContext.jsx # Auth state, user profile, credits, flash toasts
        ├── components/    # Reusable UI components
        │   ├── Navbar.jsx, Footer.jsx, BookCard.jsx, Breadcrumb.jsx,
        │   ├── FlashMessage.jsx, ProtectedRoute.jsx, AdminRoute.jsx,
        │   └── StarRating.jsx, ConfirmDialog.jsx, Pagination.jsx, Loader.jsx
        ├── pages/
        │   ├── public/    # Home, Browse, BookDetails, About, Contact, Login, Register, NotFound
        │   ├── user/      # Dashboard, AddBook, MyBooks, EditBook, Requests, History, Profile, Wishlist
        │   └── admin/     # AdminLogin, AdminDashboard, ManageUsers, ManageBooks
        ├── styles/        # Plain CSS stylesheets (global, navbar, cards, forms, dashboard)
        └── utils/         # helpers.js, validators.js
```

---

## Windows Setup & Running

### Prerequisites
Make sure you have installed on Windows:
1. **Python 3.10 or higher** (check `Add Python to PATH` during installation)
2. **Node.js 18 or higher** (includes `npm`)
3. **VS Code**

---

### 1. One-Click Setup & Launch
The easiest way to get running on Windows:

1. Double-click **`setup.bat`**:
   - Creates the Python virtual environment in `backend\venv`
   - Installs all dependencies from `requirements.txt`
   - Runs `seed.py` to create the database with sample data
   - Runs `npm install` in the `frontend` folder
2. Double-click **`start.bat`**:
   - Opens two terminal windows (one for the Flask backend, one for the Vite frontend)
   - Opens the frontend at **http://localhost:5173** and the backend at **http://localhost:5000**

---

### 2. VS Code Native Tasks
If opening the folder in **VS Code**:
1. Open the project root folder in VS Code (`File > Open Folder...`).
2. Press `Ctrl + Shift + P` and choose **Tasks: Run Task**.
3. Select **`Run BookLoop`** (or press `Ctrl + Shift + B` as it is set as the default build task).
4. VS Code starts both the Flask backend and the Vite frontend simultaneously in dedicated split terminal panels.

To run individual tasks:
- `Tasks: Run Task > Setup Backend`
- `Tasks: Run Task > Setup Frontend`
- `Tasks: Run Task > Run Backend`
- `Tasks: Run Task > Run Frontend`

---

### 3. Manual Terminal Commands

#### Backend:
Open PowerShell / Command Prompt:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python app.py
```
*Backend runs on `http://localhost:5000`.*

#### Frontend:
Open a second PowerShell / Command Prompt:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## Demo Accounts & Credentials

The database is pre-seeded with 1 administrator and 5 active student accounts:

| Role | Name | Email | Password | Initial Credits | Features / Badges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@bookloop.com` | `Admin@123` | 10 | Administrative portal access |
| **User** | Priya Patel | `priya@example.com` | `Password@123` | 5 | **Trusted User** badge (Avg rating 4.7, 3 reviews) |
| **User** | Rahul Sharma | `rahul@example.com` | `Password@123` | 4 | Has listed books & active loans |
| **User** | Vikram Rao | `vikram@example.com` | `Password@123` | 2 | Has an **Overdue Loan** for demo testing |
| **User** | Amit Verma | `amit@example.com` | `Password@123` | 3 | Standard student account |
| **User** | Sneha Nair | `sneha@example.com` | `Password@123` | 3 | Standard student account |

*Note: New registrations automatically receive **3 Free Credits**.*

---

## Complete API Route Documentation

All endpoints are served with JSON payloads under the prefix `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user. Validates email & min 8-char password. Awards 3 credits. |
| `POST` | `/auth/login` | Public | Authenticates credentials. Rejects blocked accounts (403). Returns JWT. |
| `GET` | `/auth/me` | Authenticated | Fetches profile, credit balance, and rating stats of current token holder. |

### Books (`/api/books`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Public | Search by title/author/keyword, filter by genre, type, and availability. Paginated. |
| `GET` | `/books/featured` | Public | Returns up to 6 featured available books for the home showcase. |
| `GET` | `/books/mine` | Authenticated | Lists all books created by the currently logged-in user. |
| `GET` | `/books/<id>` | Public | Detailed view of a single book, including owner reputation and overdue state. |
| `POST` | `/books` | Authenticated | Add a new book (supports multipart file upload up to 2MB, jpg/png/webp). |
| `PUT` | `/books/<id>` | Owner / Admin | Updates title, author, genre, condition, type, description, or cover image. |
| `DELETE` | `/books/<id>` | Owner / Admin | Deletes book. **Enforces rule: Cannot delete currently borrowed book.** |

### Book Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/requests` | Authenticated | Request a book (`book_id`). Requires credits > 0, cannot request own book. |
| `GET` | `/requests/received` | Authenticated | Requests received for books owned by the current user. |
| `GET` | `/requests/sent` | Authenticated | Requests created by the current user for peer books. |
| `GET` | `/requests/history` | Authenticated | Full transaction history where user was either borrower or lender. |
| `PUT` | `/requests/<id>/accept`| Book Owner | Sets book to `borrowed`, deducts 1 credit from borrower, auto-rejects others. |
| `PUT` | `/requests/<id>/reject`| Book Owner | Rejects pending request; restores book to `available` if no pending requests. |
| `PUT` | `/requests/<id>/cancel`| Requester | Cancels a pending request; restores book to `available`. |
| `PUT` | `/requests/<id>/return`| Book Owner | Marks loan returned; sets book to `available`; awards 1 credit to lender. |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/wishlist` | Authenticated | Retrieves current user's saved reading wishlist. |
| `POST` | `/wishlist/<book_id>`| Authenticated | Adds a book to user's personal wishlist. |
| `DELETE`| `/wishlist/<book_id>`| Authenticated | Removes a book from user's personal wishlist. |

### Ratings & Reviews (`/api/ratings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ratings` | Authenticated | Rates a participant (1-5 stars + comment) for a `returned` transaction. |

### User Profile (`/api/profile`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Authenticated | Returns current profile info, credits, average rating, and trusted badge state. |
| `PUT` | `/profile` | Authenticated | Updates user's name, phone, and campus location. |
| `PUT` | `/profile/password`| Authenticated | Verifies old password and updates to new password (min 8 chars). |

### Contact (`/api/contact`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/contact` | Public | Submits a campus support inquiry (name, email, subject, message). |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | Admin Only | System stats: total users, books, active loans, returns, and overdue count. |
| `GET` | `/admin/users` | Admin Only | Lists all registered accounts with status and trust metrics. |
| `PUT` | `/admin/users/<id>/block` | Admin Only | Suspends account. Immediately revokes token access on next API call. |
| `PUT` | `/admin/users/<id>/unblock` | Admin Only | Restores suspended account to active standing. |
| `DELETE`| `/admin/users/<id>` | Admin Only | Deletes account (protected if user has active ongoing loans). |
| `GET` | `/admin/books` | Admin Only | Moderation overview of all cataloged book listings. |
| `PUT` | `/admin/books/<id>/toggle-availability` | Admin Only | Toggles book availability between active and hidden. |
| `DELETE`| `/admin/books/<id>` | Admin Only | Removes listing (blocked if book is currently borrowed). |

---

## Core Business Logic Rules

1. **Credit Allocation**: Every new user starts with **3 credits**.
2. **Borrowing Requirement**: A user must have **at least 1 credit** to submit a book request.
3. **Credit Deduction**: When the book owner **accepts** a request:
   - The borrower's credits are re-checked. If 0, the request is blocked.
   - **1 credit is deducted** from the borrower.
   - The book status changes to `borrowed`.
   - The due date is set to **Today + 14 Days**.
   - Any other pending requests for the same book are automatically rejected.
4. **Credit Reward**: When the owner marks the book as **returned**:
   - The book returns to `available`.
   - **1 credit is awarded** to the lender as a reward for sharing.
5. **No Self-Requests**: A user cannot request their own book.
6. **No Duplicate Requests**: A user cannot create multiple pending requests for the same book.
7. **Deletion Safety**: A book marked as `borrowed` **cannot be deleted** by either the owner or the administrator.
8. **Real-Time Token Revocation**: When an administrator blocks a user, their JWT is invalidated immediately on subsequent requests because `status == 'active'` is verified on every authenticated call.
9. **Trusted User Badge**: A user earns the **Trusted User** badge when they maintain an **average rating of 4.0 or higher** with **at least 3 ratings**.
10. **Exchange Listings**: Labeled as "Exchange" in the UI with the explanatory note: *"Swap or borrow using credits"*, using the same uniform credit flow.

---

## Automated Backend Flow Verification

The backend includes an automated test script (`backend/test_flow.py`) testing the entire lifecycle:
1. Registration & credit verification (3 credits awarded)
2. Login & JWT authentication
3. Adding a new book
4. Requesting the book as a borrower
5. Accepting the request (deducting 1 credit, changing book to borrowed)
6. Marking book returned (awarding 1 credit, setting book to available)
7. Submitting peer rating
8. Admin blocking user and verifying immediate token invalidation

To run the verification test:
```powershell
cd backend
.\venv\Scripts\python.exe test_flow.py
```
Expected output:
```text
[PASS] Step 1: Register new user with 3 initial credits
[PASS] Step 2: Login as newly registered user
[PASS] Step 3: Add book as owner
[PASS] Step 4: Request book as borrower
[PASS] Step 5: Accept request (deduct 1 credit from borrower & book borrowed)
[PASS] Step 6: Return book (owner awarded +1 credit & book available)
[PASS] Step 7: Submit rating for returned book exchange
[PASS] Step 8: Admin block user and verify blocked token stops working immediately
============================================================
Results: 8/8 steps passed.
[SUCCESS] All test flow steps PASSED flawlessly!
```

---

## Production Deployment (Render & Vercel)

This section provides complete, step-by-step instructions to deploy the BookLoop project to production:
- **Backend on Render** (or serverless on Vercel)
- **Frontend on Vercel**
- **Connected through your GitHub repository**

---

### Step A: Push to GitHub
1. Stage, commit, and push your code to your repository:
   ```powershell
   git add .
   git commit -m "Configure BookLoop for Render backend and Vercel frontend deployment"
   git push origin main
   ```
   *(If you are connecting a brand new repository, create a repository on [GitHub](https://github.com/new), then run `git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git` and `git push -u origin main`).*

---

### Step B: Deploy Backend on Render (Web Service)
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `bookloop-backend` (or a name of your choice)
   - **Region**: Choose the region closest to you (e.g., Oregon or Frankfurt)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. In the **Environment Variables** section, add:
   - `SECRET_KEY`: `<generate-a-secure-random-string>`
   - `JWT_SECRET_KEY`: `<generate-a-secure-random-string>`
   - `DATABASE_URL`: Your Postgres connection string from [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).  
     *(BookLoop automatically converts any `postgres://` connection string to `postgresql://`).*  
     *(If not provided, the local SQLite database `backend/bookloop.db` will be used as a fallback).*
   - `CLOUDINARY_URL` *(Optional)*: `cloudinary://<api_key>:<api_secret>@<cloud_name>` from [Cloudinary](https://cloudinary.com) for persistent cloud cover photo uploads.
5. Click **Create Web Service**. Wait for the build and deploy to complete. Copy your live Render URL (e.g. `https://bookloop-backend.onrender.com`).

---

### Step C: Deploy Frontend on Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New...** > **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://YOUR-BACKEND.onrender.com/api`  
     *(Replace with your actual Render URL from Step B, making sure it ends with `/api`).*
5. Click **Deploy**.
6. When deployment finishes, copy your live frontend URL (e.g. `https://bookloop-frontend.vercel.app`).

---

### Step D: Update CORS on Render
1. Go back to your Render dashboard for `bookloop-backend`.
2. Under the **Environment** tab, add or update:
   - `FRONTEND_URL`: `https://YOUR-FRONTEND.vercel.app` *(without trailing slash)*
3. Click **Save Changes** and allow the service to redeploy.

---

### Alternative: Deploy Backend on Vercel (Serverless)
You can also deploy the backend as a second Vercel project:
1. In Vercel, click **Add New...** > **Project** and select your repository.
2. Set **Root Directory** to `backend`.
3. Add environment variables: `DATABASE_URL` (Postgres on Neon or Supabase), `SECRET_KEY`, `JWT_SECRET_KEY`, and `CLOUDINARY_URL`.
4. Click **Deploy**. Vercel will automatically route requests using `backend/vercel.json` and `backend/api/index.py`.

---

### Step E: Post-Deployment Smoke Test Checklist
Test your live Vercel application using this verification checklist:
- [ ] **1. Register**: Register a new student account (verify 3 free starting credits appear in navbar).
- [ ] **2. Login**: Sign in with the registered credentials.
- [ ] **3. Add Book with Cover Image**: Post a new book with a cover photo (verify image displays properly).
- [ ] **4. Request Book**: Log in as another account and submit a request for the book.
- [ ] **5. Accept Request**: Log in as the book owner and accept the request (verify 1 credit is deducted and due date is set to 14 days).
- [ ] **6. Return Book**: Mark the book as returned from the owner's history page (verify 1 credit is awarded to the owner).
- [ ] **7. Rate Peer**: Submit a 1-5 star review and comment on the completed exchange.
- [ ] **8. Admin Governance**: Log into `/admin/login` as `admin@bookloop.com`, inspect stats, and verify user/book moderation.

---

### Known Free Tier Limitations
- **Render Inactivity Sleep**: On Render's free tier, the web service spins down (sleeps) after 15 minutes of inactivity. The first request after sleep may take 30–50 seconds while the instance wakes up.
- **Ephemeral Storage**: Render free-tier instances have an ephemeral local disk. Local SQLite database files (`bookloop.db`) and local files in `uploads/` will reset whenever the service restarts or redeploys. To ensure permanent data persistence in production:
  - Use a free managed Postgres database via `DATABASE_URL` (e.g., [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
  - Use free Cloudinary storage via `CLOUDINARY_URL` for book cover photos.

---

## Troubleshooting Guide

### 1. `python` is not recognized as an internal or external command
- **Cause**: Python was installed without checking "Add python.exe to PATH".
- **Fix**: Re-run the Python installer, select "Modify", and check "Add Python to environment variables", or add `C:\Users\<YourUser>\AppData\Local\Programs\Python\Python3xx` to your Windows System PATH.

### 2. Node / npm command fails in `setup.bat`
- **Cause**: Node.js is not installed or the command terminal was opened before Node was installed.
- **Fix**: Install the LTS release of Node.js from [nodejs.org](https://nodejs.org) and restart your command prompt or VS Code.

### 3. Port 5000 or 5173 is already in use
- **Cause**: Another background process or previous terminal run is holding the port.
- **Fix**:
  - In PowerShell, run: `netstat -ano | findstr :5000` to find the process ID (PID).
  - Stop the process: `Stop-Process -Id <PID> -Force`.

### 4. Database reset / re-seeding
- To reset the SQLite database back to its clean initial state with sample books and users, run:
  ```powershell
  cd backend
  .\venv\Scripts\python.exe seed.py
  ```

---

## College Project Viva Q&A

### Q1: Why did you choose Flask for the backend?
**Answer**: Flask is a lightweight WSGI microframework for Python that gives developers fine-grained control over architectural patterns without the boilerplate of monolithic frameworks like Django. In BookLoop, Flask allows us to implement clean modular Blueprints (`/auth`, `/books`, `/requests`, `/admin`), lightweight ORM mapping with SQLAlchemy, and custom error handling while minimizing overhead and keeping local deployment instant.

### Q2: Why did you choose React with Vite for the frontend?
**Answer**: React provides a declarative, component-driven model with efficient DOM updates through reconciliation. Using React 18 allows us to manage complex interdependent state (live credit balance in the navigation bar, tab switching, real-time modal confirmations, and dynamic search/filter panels) cleanly through Context API (`AuthContext`). We chose Vite over Create React App because Vite utilizes native ES modules and Rollup, offering sub-second Hot Module Replacement (HMR) and fast production builds.

### Q3: How does JWT authentication work and how do you prevent blocked users from acting?
**Answer**:
1. When a user registers or logs in, the backend creates a cryptographically signed JSON Web Token (JWT) using `Flask-JWT-Extended` containing the user's ID as the `sub` (subject) claim.
2. The frontend stores this token in `localStorage` and attaches it to the `Authorization: Bearer <token>` header of every outgoing Axios request using an interceptor.
3. Unlike naive stateless architectures where a token remains valid until expiry even after a user is banned, BookLoop executes an active status check on every protected endpoint (`get_current_user()`): if the user account is deleted or marked `status == 'blocked'`, the server immediately rejects the request with HTTP 401/403. The frontend Axios response interceptor intercepts the 401, clears `localStorage`, and forces a redirect to `/login`.

### Q4: How does the credit flow ensure fair exchange without real payments?
**Answer**:
- BookLoop implements a zero-sum, incentive-aligned credit loop.
- New members receive 3 starting credits.
- To prevent hoarding, borrowing requires at least 1 credit. When a request is accepted, 1 credit is temporarily deducted from the borrower.
- Once the borrower finishes reading and returns the physical book, the owner clicks "Mark as Returned", which transfers 1 credit to the lender.
- This creates an incentive for members to list and share their own books to earn credits so they can borrow others.

### Q5: What is CORS and why is Flask-CORS required?
**Answer**: CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts a web application running at one origin (e.g., frontend on `http://localhost:5173`) from making asynchronous XMLHttpRequests/fetch calls to a server hosted on a different origin (e.g., backend on `http://localhost:5000`). Browsers send a preflight `OPTIONS` request before cross-origin mutations. `Flask-CORS` intercepts these requests and responds with appropriate headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`), permitting the React frontend to communicate with the Flask API seamlessly.

### Q6: Why SQLite for this project?
**Answer**: SQLite is a self-contained, serverless, zero-configuration SQL database engine. The entire database is contained within a single file (`backend/bookloop.db`). This makes the project portable and runnable on any Windows computer out of the box without installing and configuring external database servers like MySQL or PostgreSQL, while preserving full ACID compliance and relational foreign key constraints.

---

### End of Documentation
*BookLoop — Smart Book Lending and Exchange Platform.*
