<div align="center">

# 🏛️ MahaBenefit-AI (माझी योजना)

### AI-Powered Government Scheme Recommendation System for Maharashtra Citizens

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**[Live Demo](https://majhi-yojna-frontend.onrender.com/)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Security](#-security)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**MahaBenefit-AI** is an AI-powered platform that recommends the most relevant Maharashtra government schemes to citizens based on their profile. Using a hybrid approach of **Rule-Based Filtering + Cosine Similarity Ranking (Machine Learning)**, it analyzes 30+ eligibility criteria to deliver personalized scheme recommendations.

### 🎯 Problem Statement

Maharashtra citizens often miss out on government benefits because:
- Hundreds of schemes exist with complex eligibility criteria
- No centralized recommendation system
- Citizens unaware of what they are eligible for

**MahaBenefit-AI solves this** by providing instant, AI-powered scheme matching.

---

## ✨ Key Features

### 👤 Citizen Portal

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based auth with BCrypt hashing |
| 🤖 **AI Recommendations** | Personalized scheme matches with ML confidence score |
| 📅 **Life Event Suggestions** | Age/gender/occupation-based scheme alerts |
| 💾 **Save Schemes** | Bookmark schemes for later |
| 📊 **Scheme Comparison** | Side-by-side comparison tool |
| 👨‍👩‍👧 **Family Dashboard** | View schemes for whole family |
| 🔔 **Notifications** | Real-time alerts on new schemes |

### 🔧 Admin Panel

| Feature | Description |
|---------|-------------|
| 📊 **Analytics Dashboard** | User growth, scheme categories, applications |
| 📝 **Schemes CRUD** | Add, edit, delete schemes with auto-notification |
| 👥 **User Management** | Block, unblock, delete users |
| 💬 **Contact Messages** | Reply and resolve citizen inquiries |

---

## 🛠️ Tech Stack

### Backend
├── Java 17 (OpenJDK)
├── Spring Boot 3.x
│   ├── Spring Security + JWT
│   ├── Spring Data JPA + Hibernate
│   └── RestTemplate (ML Communication)
└── Maven 3.8+

### Machine Learning
├── Python 3.10
├── Flask + Flask-CORS
├── Scikit-Learn (Cosine Similarity)
├── Pandas, NumPy, Joblib
└── Gunicorn WSGI

### Frontend
├── React 18.x
├── Create React App
├── Axios + Context API
└── React Router 6

### Database & Cloud
├── MySQL 8.0 / TiDB Cloud (Serverless MySQL)
└── Render (Cloud Deployment)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                          │
│         React 18 + Axios (Frontend - Port 3000)         │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JWT)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                       │
│      Spring Boot 3.x Backend (Port 8080)                │
│  JWT Filter → Controllers → Services → Repositories     │
└──────────────┬─────────────────────────┬────────────────┘
               │ JDBC                    │ RestTemplate
               ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│       DATA LAYER         │  │       ML AI LAYER        │
│  MySQL / TiDB Cloud      │  │  Python Flask (Port 5000)│
│  (mahabenefit database)  │  │  Rule Filter + Cosine Sim│
└──────────────────────────┘  └──────────────────────────┘

```
🔒 Security
✅ JWT Stateless Authentication
✅ BCrypt Password Hashing
✅ Role-Based Access Control (USER / ADMIN)
✅ Auto-logout on User Block/Delete
✅ Environment Variable Secrets

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

<div align="center">

## 👨‍💻 Amit Ingale  

📞 Contact  
Developer Information  

<br>

[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:amitgingale@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/amitgingale07)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AmitIngAI)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=todoist&logoColor=white)](https://amitingale.vercel.app/)

<br><br>

⭐ **Show Your Support**  
If this project helped you, please consider giving it a ⭐!

</div>
