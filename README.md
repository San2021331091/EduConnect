# **EduConnect – A Web Platform for Students with AI Integration**

## **1. Introduction**

Modern online learning platforms often lack academic-focused tools and intelligent assistance. **EduConnect** aims to provide a smart, collaborative, and student-centric platform including real-time communication, shared study spaces, and AI-powered learning support.

---

## **2. Objectives**

* Build a web-based student collaboration platform with real-time communication.
* Integrate AI tools through **Flask + DeepSeek API** for academic support.
* Implement secure authentication and role management using **Supabase**.
* Ensure scalability, security, and smooth cross-device performance.

---

## **3. Key Features**

### **3.1 Communication Tools**

* Real-time chat using **Gorilla WebSocket (Golang)** for secure & high-performance WebSocket communication.
* Audio/video calling using **WebRTC**.
* Resource sharing (notes, files, lecture slides).

### **3.2 AI-Powered Features**

* **AI Q&A Bot** (Flask + DeepSeek API).
* **AI Study Assistant**: summarization, flashcard generation, quiz creation.
* **AI Moderator**: spam detection & inappropriate content filtering.

### **3.3 Student Collaboration**

* Role-based access (Admin, Moderator, Student) via Supabase.
* Private/public study servers.
* AI-enhanced reminders for deadlines and events.

---

## **4. Technology Stack**

### **Frontend**

* **Next.js v14 (CSR)**
* **React + Material UI (MUI) + Tailwind CSS + Shadcn** – modern UI components
* **TypeScript v5.3**
* **HTML5**

### **Backend (Core API & Realtime)**

* **Golang, TypeScript, Python**
* **Frameworks:**

  * Fastify (Node.js APIs)
  * Fiber (Golang Services)
  * Flask (AI Microservice)

### **Realtime Communication (Updated)**

* **Gorilla WebSocket (Go)** – high-performance real-time messaging
* **WebRTC** – voice & video calling
* **Fiber + Gorilla WebSocket** – low-latency instant messaging

### **AI/ML Services**

* Flask microservice
* DeepSeek API for academic Q&A, summaries, flashcards & moderation

### **Authentication & Database**

* Supabase (JWT Auth + PostgreSQL)
* bcrypt for password hashing
* PostgreSQL (Neon)
* Prisma ORM (Node.js)
* GORM (Go)

### **File Hosting**

* Cloudinary – file upload & sharing

---

## **5. System Architecture**

1. **Next.js + Material UI+Tailwind CSS + Shadcn**

   * Frontend interface for communication & collaboration

2. **Supabase**

   * Authentication, session management, and user roles

3. **Golang (Fiber) Bckend**

   * Real-time communication using **Gorilla WebSocket**
   * WebRTC signaling for audio/video
   * Core APIs & database interactions

4. **Flask AI Microservice**

   * Connects with DeepSeek API for AI-powered tasks

5. **DeepSeek API**

   * Handles advanced NLP, content generation & academic reasoning

---

## **6. Expected Outcomes**

* Functional real-time student platform using **Gorilla WebSocket**.
* AI-powered learning features integrated via Flask + DeepSeek API.
* Secure, scalable authentication via Supabase.
* Modern UI built with **React Material UI**.
* Modular architecture suitable for future extension.

---

## **7. Conclusion**

EduConnect combines modern real-time technologies with intelligent AI services to enhance student communication and learning. With a scalable backend, strong authentication system, and clean Material UI interface, EduConnect will provide an advanced collaborative environment for academic success.

---

### **Submitted By**

**Santosh Saha**

Registration No.: 2021331091

**Harun Or Rashid Rasel**

Registration No.: 2021331075

---



