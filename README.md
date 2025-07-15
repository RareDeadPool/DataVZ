# DataViz

A modern, collaborative data visualization and analytics platform powered by AI.

---

## 📖 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [Usage Instructions](#usage-instructions)
- [API Overview](#api-overview)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🚀 Project Overview

**DataViz** is a full-stack web application that empowers users and teams to upload, analyze, and visualize data with ease. It features an AI assistant (Vizard) for natural language queries, real-time collaboration, and a beautiful, responsive UI. DataViz is designed for professionals, analysts, and teams who want actionable insights from their data without complex setup or coding.

**Key Goals:**
- Democratize data analytics and visualization
- Enable AI-powered insights for everyone
- Provide a seamless, collaborative experience
- Support a wide range of data sources and chart types

---

## ✨ Features

### AI Assistant (Vizard)
- **Natural Language Queries:** Ask questions like "Show me sales trends for Q4" and get instant visual answers.
- **Smart Pattern Detection:** AI identifies trends, outliers, and patterns in your data.
- **Predictive Insights:** Get forecasts and predictions using machine learning.
- **Chart Generation:** Instantly create the best chart type for your data with AI recommendations.

### Dashboard
- **Data Upload:** Upload Excel, CSV, and other data files.
- **Preview & Recent Uploads:** Instantly preview uploaded data and access recent files.
- **Project Creation:** Create new projects and organize your datasets.

### Analytics
- **Advanced Visualizations:** Generate interactive charts and dashboards.
- **Summary Statistics:** View key metrics and analytics summaries.
- **Export Options:** Download charts and data in various formats.

### Projects & Collaboration
- **Project Management:** Create, edit, and manage multiple projects.
- **Templates:** Start quickly with pre-built dashboard templates.
- **Real-time Collaboration:** Work with your team on shared projects and dashboards.

### User Management
- **Authentication:** Secure login/register with JWT, Google OAuth.
- **Profile & Settings:** Manage your account, avatar, and preferences.
- **Admin Dashboard:** (Placeholder) For system stats and user management.

### UI/UX
- **Modern Design:** Built with shadcn/ui and Tailwind CSS for a beautiful, responsive interface.
- **Dark/Light Mode:** Seamless theme switching.
- **Accessibility:** Keyboard navigation and ARIA support.

### Help & Support
- **FAQ:** Built-in help page with common questions.
- **Support Contact:** Easy way to reach out for help.

---

## 🛠️ Tech Stack

### Frontend
- **React (JavaScript):** Component-based UI
- **Vite:** Fast build tool and dev server
- **Redux:** State management
- **shadcn/ui:** Modern, accessible UI components
- **Tailwind CSS:** Utility-first styling
- **React Router:** Client-side routing
- **Lucide React:** Icon library

### Backend
- **Node.js:** JavaScript runtime
- **Express.js:** Web framework
- **MongoDB:** NoSQL database
- **Mongoose:** MongoDB ODM
- **JWT:** Authentication
- **Multer:** File uploads
- **CORS:** Cross-origin resource sharing
- **SheetJS/xlsx:** Excel/CSV parsing
- **Gemini API:** AI-powered insights (or similar)

### Deployment
- **Netlify:** Frontend hosting
- **Render:** Backend hosting

---

## 📁 Folder Structure

```
DataViz/
  client/           # Frontend (React, Vite)
    src/
      components/   # UI and feature components
        common/     # Reusable UI (Logo, ThemeToggle, etc.)
        features/   # Feature pages (Dashboard, Projects, AskAI, etc.)
        layout/     # Layout components (Sidebar, Header)
        ui/         # shadcn/ui components
      store/        # Redux store and slices
      services/     # API calls
      hooks/        # Custom React hooks
      lib/          # Utility functions
      styles/       # Global styles (Tailwind)
      main.jsx      # App entry point
      App.jsx       # Main app component (routing)
    public/         # Static assets (images, icons)
    index.html      # HTML entry point
    ...
  server/           # Backend (Node.js, Express)
    src/
      controllers/  # Route controllers (auth, project, chart, etc.)
      models/       # Mongoose models (User, Project, etc.)
      routes/       # Express routes
      middleware/   # Auth, error handling, etc.
      utils/        # Utility functions (AI, email, etc.)
      config/       # DB and server config
    uploads/        # Uploaded files (avatars, data)
    server.js       # Server entry point
    ...
  README.md         # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local or cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/DataViz.git
cd DataViz
```

### 2. Setup Backend
```bash
cd server
npm install
# Create a .env file (see below)
npm start
```

### 3. Setup Frontend
```bash
cd ../client
npm install
# Create a .env file (see below)
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
| Variable         | Description                                 |
|------------------|---------------------------------------------|
| MONGO_URI        | MongoDB connection string                   |
| JWT_SECRET       | Secret for JWT authentication               |
| GEMINI_API_KEY   | API key for Gemini/AI integration           |
| PORT             | (Optional) Port for backend (default: 5000) |
| FRONTEND_URL     | (Optional) For CORS, your Netlify URL       |

Example:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
FRONTEND_URL=https://your-frontend.netlify.app
```

### Frontend (`client/.env`)
| Variable      | Description                        |
|---------------|------------------------------------|
| VITE_API_URL  | URL of your backend API            |

Example:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🌐 Deployment Guide

### Backend (Render)
1. Push your code to GitHub/GitLab/Bitbucket.
2. Go to [Render](https://render.com/) and create a new Web Service.
3. Set root directory to `server`, build command to `npm install`, and start command to `node src/server.js` (or `npm start`).
4. Add environment variables as above.
5. Deploy and note your Render backend URL (e.g., `https://your-backend.onrender.com`).

### Frontend (Netlify)
1. Go to [Netlify](https://netlify.com/) and create a new site from Git.
2. Set base directory to `client`, build command to `npm run build`, and publish directory to `dist`.
3. Add environment variable `VITE_API_URL` pointing to your Render backend URL (e.g., `https://your-backend.onrender.com/api`).
4. Deploy and note your Netlify frontend URL.

### CORS Setup
Make sure your backend allows requests from your Netlify domain. In your backend, set CORS like:
```js
const cors = require('cors');
app.use(cors({
  origin: 'https://your-frontend.netlify.app', // replace with your Netlify URL
  credentials: true,
}));
```

---

## 🧩 Usage Instructions

### 1. Access the App
- Open your Netlify frontend URL in a browser.
- Register or log in (Google OAuth supported).

### 2. Upload Data
- Go to the Dashboard.
- Click "New Project & Upload Data" to upload Excel/CSV files.
- Preview your data and recent uploads.

### 3. Create Projects & Charts
- Use the Projects page to create/manage projects.
- Use the AI Assistant (Vizard) to ask questions or generate charts.
- Use Analytics for advanced visualizations.

### 4. Collaborate
- Invite team members (if enabled).
- Share projects and dashboards.

### 5. Profile & Settings
- Update your profile, avatar, and preferences.
- Switch between dark/light mode.

### 6. Help & Support
- Visit the Help page for FAQs or to contact support.

---

## 📚 API Overview

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password

### Projects & Data
- `POST /api/projects` — Create project
- `GET /api/projects` — List projects
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `POST /api/excel/upload` — Upload Excel/CSV file
- `GET /api/excel/recent` — Get recent uploads
- `GET /api/charts` — List charts
- `POST /api/charts` — Create chart
- `GET /api/charts/:id` — Get chart details

### AI Assistant
- `POST /api/ai/ask` — Ask a question to Vizard

### Admin
- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id` — Update user
- `DELETE /api/admin/users/:id` — Delete user
- `GET /api/admin/stats` — Platform statistics

---

## 🛠️ Troubleshooting & FAQ

### Common Issues
- **Frontend cannot connect to backend:**
  - Check `VITE_API_URL` in your frontend `.env`.
  - Make sure backend is deployed and CORS is configured.
- **MongoDB connection errors:**
  - Verify `MONGO_URI` in backend `.env`.
  - Ensure MongoDB is running and accessible.
- **AI features not working:**
  - Check `GEMINI_API_KEY` in backend `.env`.
  - Ensure your AI provider is reachable.
- **File uploads fail:**
  - Check backend logs for Multer errors.
  - Ensure `uploads/` directory exists and is writable.

### FAQ
- **Can I use a different database?**
  - The backend is designed for MongoDB, but you can adapt models for other databases.
- **How do I add new chart types?**
  - Extend the frontend chart components and backend chart logic.
- **How do I invite team members?**
  - Team collaboration is supported in Project Workspace. Invite via the UI (if enabled).
- **How do I change the AI provider?**
  - Update the backend AI service integration in `server/src/utils/geminiService.js`.
- **How do I deploy on other platforms?**
  - The app is platform-agnostic. You can use Heroku, Vercel, AWS, etc. Adjust build and environment settings as needed.

---

## 🧑‍💻 Contributing

We welcome contributions from the community!

1. **Fork the repo** and create your branch: `git checkout -b feature/your-feature`
2. **Commit your changes:** `git commit -m 'Add some feature'`
3. **Push to the branch:** `git push origin feature/your-feature`
4. **Open a pull request** and describe your changes.

**Contribution Guidelines:**
- Write clear, descriptive commit messages.
- Follow the existing code style and structure.
- Add tests for new features if possible.
- Document your code and update the README if needed.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙋‍♂️ Support

For questions, open an issue or contact the maintainer via GitHub.

---

**Built with ❤️ by Aditya Sawant** 