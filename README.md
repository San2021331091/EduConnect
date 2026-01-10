
# **EduConnect – Frontend**

## **1. Overview**

**EduConnect Frontend** is a modern, responsive web interface built for a student-centric collaboration and learning platform. It focuses on delivering a smooth user experience for real-time communication, AI-powered learning tools, and secure role-based access.

The frontend is developed using **Next.js**, **React**, and **TypeScript**, with a strong emphasis on modular UI, accessibility, and performance.

---

## **2. Frontend Objectives**

1. Build a **responsive and intuitive UI** for students, moderators, and admins.
2. Enable **real-time interaction** with chat and AI learning tools.
3. Integrate **AI-powered academic features** (Q&A, summaries, flashcards).
4. Implement **secure authentication and session handling** using Supabase.
5. Ensure **role-based conditional rendering** across the application.
6. Maintain **scalable, clean, and reusable component architecture**.
7. Support **resource uploads and media display**.

---

## **3. Key Frontend Features**

### **3.1 UI & User Experience**

* Fully responsive design (desktop, tablet, mobile).
* Dark / Light mode support.
* Clean, modern UI using Tailwind CSS and Shadcn UI.
* Accessible components built with Radix UI.
* Smooth navigation with Next.js App Router.

### **3.2 Authentication & Roles**

* Supabase authentication integration.
* Secure session management on the client side.
* Role-based UI rendering for:

  * **Admin**
  * **Moderator**
  * **Student**

### **3.3 Communication & Interaction**

* Real-time chat interface (WebSocket-ready).
* Notifications UI for messages, announcements, and AI responses.
* Resource sharing interface for images, videos, and documents.

### **3.4 AI-Powered Learning (Frontend Integration)**

* Chat-based AI interaction (EduConnectGPT via CX Genie).
* UI for:

  * Academic Q&A
  * Flashcard generation
  * Content summarization
* Real-time AI response rendering.

---

## **4. Technology Stack (Frontend)**

### **Core Technologies**

* **Next.js v16.1.1** – App Router, SSR, routing
* **React v19.2.3**
* **TypeScript v5**

### **Styling & UI**

* **Tailwind CSS v4**
* **Shadcn UI**
* **Radix UI**
* **Lucide React** – Icon library
* **Clsx & Tailwind Merge** – Conditional class handling
* **Next Themes** – Dark/Light mode

### **Forms & Validation**

* **React Hook Form**
* **Zod** – Schema validation

### **API & Services**

* **Axios** – REST & WebSocket API calls
* **Supabase JS** – Authentication and session handling

---

## **5. Frontend Responsibilities**

* Render all user-facing interfaces.
* Manage authentication and user sessions.
* Handle AI interactions and display responses.
* Upload, display, and download shared resources.
* Implement role-based UI security.
* Ensure accessibility, responsiveness, and performance.

---

## **6. Frontend Architecture**

1. **Routing**

   * Next.js App Router with file-based routing.

2. **Components**

   * Reusable UI components built with Shadcn UI & Radix UI.

3. **State Management**

   * React hooks for local state.
   * Context API for global state where needed.

4. **API Integration**

   * Axios for backend and AI service communication.

5. **Theming**

   * Tailwind CSS + Next Themes for styling and mode switching.

---

## **7. Project Structure (Example)**

```
frontend/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── chat/
│   └── ai-tools/
├── components/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── supabase/
│   └── axios.ts
├── hooks/
├── styles/
└── README.md
```

---

## **8. Getting Started**

### **Prerequisites**

* Node.js (LTS recommended)
* npm or pnpm

### **Installation**

```bash
npm install
```

### **Development**

```bash
npm run dev
```

### **Production Build**

```bash
npm run build
npm start
```

---

## **9. Expected Outcomes**

* Modern, scalable frontend UI.
* Seamless AI-powered learning experience.
* Secure, role-based user interaction.
* Real-time collaboration-ready interface.
* Maintainable and extensible codebase.

---

## **10. Author**

**Santosh Saha**
**Registration No.:** **2021331091**
