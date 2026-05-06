# 🏪 Store Rating Platform (Full-Stack)

**Author:** Amir Hussain  
---
## 🚀 Overview
This project is a full-stack web application built as part of a coding challenge.  
It allows users to explore stores, submit ratings (1–5), and manage data based on their roles.

The goal of this project was to implement:
- Clean role-based access control  
- Scalable backend structure  
- Real-world database relationships  
- Smooth and intuitive user experience  
---
## 🎯 Key Features

### 🔐 Authentication
- Secure login & signup system  
- Role-based access (Admin / User / Store Owner)  
- Password encryption  
---
### 👤 System Administrator
- Add new users (Admin / Normal User / Store Owner)  
- Add and manage stores  
- Dashboard with:
  - Total Users  
  - Total Stores  
  - Total Ratings  
- View and filter users & stores  
- Access complete user details  
---
### 🙋 Normal User
- Signup & login  
- Browse all stores  
- Search stores by name & address  
- Submit ratings (1–5)  
- Update ratings  
- View personal submitted rating  
---
### 🏬 Store Owner
- View users who rated their store  
- See average rating  
- Access store-specific dashboard  
---
## 🧠 Form Validations
- **Name:** 20–60 characters  
- **Address:** Max 400 characters  
- **Password:** 8–16 characters, must include:
  - 1 uppercase letter  
  - 1 special character  
- **Email:** Valid email format  
---
## ⚙️ Tech Stack
### Frontend
- React.js  
- Vite  
- Tailwind CSS  
- Axios  

### Backend / Database
- Supabase (PostgreSQL)  
- Row Level Security (RLS)  
- Authentication via Supabase  
---
## 🗄️ Database Design

- **users** → stores user info & roles  
- **stores** → store details + owner  
- **ratings** → user ratings (1–5)  

### Relationships:
- One user → many ratings  
- One store → many ratings  
- One owner → one/many stores  
---
## 🔐 Security
- Row-Level Security (RLS) implemented  
- Role-based access control  
- Users can only access allowed data  

## ▶️ Run Locally
### 1️⃣ Clone the repository

git clone https://github.com/123-Amir/store-rating-platform.git

2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create .env file:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
4️⃣ Run the app
npm run dev

👉 App will run on:

http://localhost:5173
