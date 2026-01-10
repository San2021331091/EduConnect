# **EduConnect – A Web Platform for Students with AI Integration**

## **1. Introduction**

Modern online learning platforms often lack academic-focused tools and intelligent assistance. **EduConnect** aims to provide a smart, collaborative, and student-centric platform including real-time communication, shared study spaces, and AI-powered learning support.

---

## **2. Objectives**

* Build a web-based student collaboration platform with real-time communication.
* Integrate AI tools through CX Genie.
* Implement secure authentication and role management using **Supabase**.
* Ensure scalability, security, and smooth cross-device performance.

---

## **3. Key Features**

### **3.1 Communication Tools**

* Real-time chat using **Websockets with the go fiber framework** for secure & high-performance WebSocket communication.

* Resource sharing (images, videos etc).

### **3.2 AI-Powered Features**

* **AI Q&A Bot** (EduConnectGPT).

### **3.3 Student Collaboration**

* Role-based access (Admin, Moderator, Student) via Supabase.


---

## **4. Technology Stack**

### **Frontend**

* **Next.js v16.1.1 **
* **React + Tailwind CSS + Shadcn** – modern UI components
* **TypeScript v5.9.3*
* **HTML5**

### **Backend (Core API & Realtime)**

* **Golang**
* **Frameworks:**

   * Fiber (Golang Services)
 

### **Realtime Communication**


* **Fiber + WebSocket** – low-latency instant messaging

### **AI/ML Services**

* CX Genie Bot for academic Q&A, summaries, flashcards & moderation

### **Authentication & Database**

* Supabase (JWT Auth + PostgreSQL)
* PostgreSQL (Neon)
* GORM (Go)

### **File Hosting**

* Cloudinary – file upload & sharing

---

## **5. System Architecture**

1. **Next.js +Tailwind CSS + Shadcn**

   * Frontend interface for communication & collaboration

2. **Supabase**

   * Authentication, session management, and user roles

3. **Golang (Fiber) Bckend**

   * Real-time communication using **Go Fiber WebSocket**
   * Core APIs & database interactions


4. **CX Genie Bot**

   * Handles advanced NLP, content generation & academic reasoning

---

## **6. Expected Outcomes**

* Functional real-time student platform using **Go Fiber WebSocket**.
* AI-powered learning features integrated via CX Genie.
* Secure, scalable authentication via Supabase.
* Modern UI built with **Shadcn UI**.
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



