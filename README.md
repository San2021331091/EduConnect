

# **EduConnect – A Web Platform for Students with AI Integration**

## **1. Introduction**

**EduConnect** is a comprehensive student-centric web platform designed to enhance learning, collaboration, and academic engagement. Unlike traditional platforms, it focuses on:

* **Real-time communication** between students, moderators, and admins.
* **AI-powered academic assistance** for Q&A, summaries, flashcards, and content moderation.
* **Shared resources and study materials**, including images, videos, and documents.
* **Role-based access control** for personalized and secure experiences.

The platform uses a modern **frontend stack** for responsive, intuitive UI, a scalable **Go Fiber backend** for real-time and core API functionalities, **PostgreSQL** for database management, **CX Genie** for AI services, and **Directus** for a robust admin panel.

---

## **2. Objectives**

1. Build a **responsive, interactive, and modular web interface** for students.
2. Enable **real-time chat and notifications** for better collaboration.
3. Integrate **AI-powered learning tools** to support academic performance.
4. Implement **secure authentication and role management** using **Supabase**.
5. Provide a **Directus admin panel** for managing resources, users, and analytics.
6. Ensure **scalable architecture**, maintainable code, and smooth cross-device performance.
7. Support **file uploads and sharing** with Cloudinary.

---

## **3. Key Features**

### **3.1 Communication & Collaboration**

* Real-time chat powered by **Go Fiber WebSockets**, ensuring low-latency messaging.
* Resource sharing (images, videos, documents) for collaborative learning.
* Notifications for new messages, AI responses, and announcements.
* Role-based access: Admins, Moderators, and Students see content tailored to their privileges.

### **3.2 AI-Powered Learning Tools**

* **CX Genie (EduConnectGPT)** for:

  * Instant academic Q&A responses.
  * Flashcard creation for revision.
  * Summarization of uploaded resources or notes.
  * Content moderation for safe interaction.

* AI integration is fully **frontend-accessible** for real-time user interaction.

### **3.3 Admin Panel (Directus)**

* Full control over users, resources, roles, and permissions.
* Analytics and activity monitoring for platform management.
* Easy CRUD operations for content without touching the codebase.

### **3.4 Frontend Usability**

* Fully responsive design for desktop, tablet, and mobile.
* Smooth dark/light mode toggling.
* Modular UI using **Shadcn UI**, **Radix UI**, and **Tailwind CSS** for accessibility and modern aesthetics.
* Conditional rendering based on roles for secure and personalized experiences.

---

## **4. Technology Stack**

### **4.1 Frontend**

* **Next.js v16.1.1** – React framework for server-side rendering, routing, and API routes.
* **React v19.2.3 + TypeScript v5** – Component-driven architecture with type safety for scalable code.
* **Tailwind CSS v4** – Utility-first CSS framework for responsive design.
* **Shadcn UI** – Prebuilt, customizable UI components.
* **Radix UI** – Accessible primitives for dialogs, tooltips, dropdowns, and modals.
* **React Hook Form + Zod** – Efficient form handling and schema validation.
* **Axios** – Handles API requests to the backend (REST & WebSocket integration).
* **Next Themes** – Light/dark mode support.
* **Supabase JS** – Frontend interface for authentication, session management, and database calls.
* **Lucide React** – Icon library for modern UI.
* **Clsx & Tailwind Merge** – Conditional className management for responsive UI.

**Frontend Responsibilities:**

* Render chat interfaces and AI tool interfaces.
* Handle resource uploads, downloads, and display.
* Integrate seamlessly with backend APIs and AI services.
* Implement smooth animations, accessibility, and responsive layout.
* Ensure role-based conditional rendering for Admin, Moderator, and Student.

**Frontend Architecture:**

1. **Pages & Routing** – Next.js file-based system for modularity.
2. **Component Library** – Modular React components using Shadcn UI and Radix UI.
3. **State Management** – React hooks for local state; context for global state management.
4. **API Integration** – Axios for connecting with Fiber backend and CX Genie AI services.
5. **Theming & Styling** – Tailwind CSS + Next Themes for responsive, dark/light mode support.

---

### **4.2 Backend**

**Core Backend Stack:**

* **Go v1.23.4** – Primary backend language for performance and concurrency.
* **Fiber v2.52.10** – Fast, lightweight web framework for API routing and WebSocket connections.
* **JWT Authentication:** `github.com/gofiber/jwt/v3` + `github.com/golang-jwt/jwt/v4` for secure token-based auth.
* **Database & ORM:** `gorm.io/gorm` + `gorm.io/driver/postgres` for PostgreSQL operations.
* **Environment Management:** `github.com/joho/godotenv` for secrets and configs.
* **UUID Generation:** `github.com/google/uuid` for unique identifiers.
* **WebSocket Support:** `github.com/gofiber/websocket/v2` + `github.com/fasthttp/websocket`.

**Indirect Dependencies:** Libraries for compression, PostgreSQL helpers, testing, fast HTTP, Unicode support, and encryption:

```
github.com/andybalholm/brotli
github.com/jackc/pgx/v5
github.com/stretchr/testify
github.com/valyala/fasthttp
golang.org/x/crypto
golang.org/x/sync
golang.org/x/sys
golang.org/x/text
```

**Backend Responsibilities:**

* Serve API endpoints for users, chat, AI requests, and resources.
* Handle real-time messaging and notifications via WebSocket.
* Validate JWT tokens for secure role-based access.
* Perform CRUD operations on PostgreSQL using GORM.
* Route AI queries to CX Genie and return responses.
* Manage file uploads and link them to Cloudinary storage.

**Backend Architecture:**

1. **Fiber App** – Central router for API and WebSocket endpoints.
2. **Database Layer** – PostgreSQL via GORM with models for users, messages, resources, and AI logs.
3. **Authentication Middleware** – JWT validation for secure routes.
4. **WebSocket Manager** – Handles chat, notifications, and presence updates.
5. **AI Service Integration** – Connects to CX Genie for academic assistance.

**Backend Start Commands:**

```bash
go mod tidy
go run main.go
```

---

### **4.3 Admin Panel – Directus**

**Directus** is used as the **headless CMS and admin panel** for EduConnect.

**Key Features:**

* Full CRUD interface for managing study resources, files, and AI logs.
* Role-based access management (Admin, Moderator, Student).
* Analytics dashboard to monitor platform activity.

**Installation and Setup:**

1. Install Directus via npm:

```bash
npm install -g directus
```

2. Bootstrap a new Directus project:

```bash
npx directus bootstrap
```

3. Start the Directus admin panel:

```bash
npx directus start
```

The admin panel can be accessed via browser to manage users, resources, and analytics.

**Use Cases in EduConnect:**

| Feature             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| User Management     | Create, update, delete, and manage user roles and permissions. |
| Resource Management | Add, update, delete study materials like images, videos, PDFs. |
| Analytics & Logs    | Monitor AI query logs, user activity, and resource usage.      |
| Role-Based Access   | Secure backend operations for admins and moderators.           |

---

### **4.4 AI / Machine Learning – CX Genie**

* Handles academic queries, flashcards, summaries, and moderation.
* Provides instant responses to frontend requests.
* Supports structured content for resource creation and review.

---

### **4.5 File Hosting – Cloudinary**

* Secure media storage for images, videos, and documents.
* Enables fast delivery and CDN caching.
* Integrated with both frontend (upload/download) and backend (linking to resources).

---

## **5. Module Use Cases**

| Module                         | Use Case                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| **Frontend (Next.js + React)** | Render UI, chat, AI tools, resources; role-based conditional rendering   |
| **Fiber Backend (Go)**         | Serve APIs, handle WebSockets, JWT auth, database operations, AI routing |
| **PostgreSQL (Neon)**          | Store users, messages, resources, AI logs, and metadata                  |
| **CX Genie Bot**               | Academic Q&A, flashcards, summaries, moderation                          |
| **Supabase**                   | Authentication, session management, role-based access                    |
| **Directus**                   | Admin panel for managing users, roles, resources, and analytics          |
| **Cloudinary**                 | Hosting images, videos, and other shared resources                       |

---

## **6. System Architecture**

```
+------------------+        +-----------------+        +-----------------+
|   Frontend UI    | <----> | Fiber Backend   | <----> | PostgreSQL DB   |
| Next.js + React  |  API   | Go + Fiber      | CRUD   | Users & Content |
| Tailwind + Shadcn|        | WebSocket       |        |                 |
+------------------+        +-----------------+        +-----------------+
        |                          |
        |                          |
        v                          v
   AI Requests                  Admin Panel
(CX Genie API)                (Directus)
        |
        v
 AI Responses (Q&A, summaries, flashcards)
        |
        v
  File Hosting (Cloudinary)
```

---

## **7. Start Commands**

**Frontend:**

```bash
npm install
npm run dev       # development mode
npm run build
npm start         # production mode
```

**Backend (Fiber):**

```bash
go mod tidy
go run main.go
```

**Admin Panel (Directus):**

```bash
npm install -g directus
npx directus bootstrap
npx directus start
```

---

## **8. Expected Outcomes**

* Fully functional, scalable, real-time collaboration platform.
* AI-powered academic tools integrated seamlessly.
* Admin panel for resource and user management.
* Secure, role-based authentication system.
* Modern, responsive, and maintainable frontend UI.
* Modular architecture enabling future scalability.

---

## **9. Conclusion**

EduConnect combines **frontend responsiveness**, **Go Fiber backend performance**, **AI-powered learning**, **Directus admin control**, and **cloud-based file management** to deliver a complete student platform. Real-time chat, academic assistance, and role-based collaboration make EduConnect a next-generation learning platform for enhanced academic productivity.

---

### **Submitted By**

**Santosh Saha** – Registration No.: 2021331091
**Harun Or Rashid Rasel** – Registration No.: 2021331075

