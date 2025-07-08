# DataViz

A full-stack web application for uploading Excel files and creating interactive 2D/3D data visualizations, with user authentication and admin management.
# DataViz - Data Visualization Platform

---

## 🚀 Tech Stack
A modern, full-stack data visualization platform built with React, Node.js, and MongoDB. Features AI-powered chat assistance, comprehensive project management, and beautiful data visualizations.

## 🏗️ Project Structure

```
DataViz/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   └── src/
│       ├── components/
│       │   ├── common/              # Reusable components
│       │   │   ├── Logo.jsx         # Application logo variants
│       │   │   ├── VizardLogo.jsx   # AI assistant logo
│       │   │   ├── data-table.jsx   # Reusable data table
│       │   │   ├── chart-area-interactive.jsx
│       │   │   ├── section-cards.jsx
│       │   │   ├── theme-provider.jsx
│       │   │   ├── theme-context.jsx
│       │   │   ├── theme-selector.jsx
│       │   │   └── mode-toggle.jsx
│       │   ├── layout/              # Layout components
│       │   │   ├── app-sidebar.jsx  # Main navigation sidebar
│       │   │   ├── site-header.jsx  # Top header
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── nav-actions.jsx
│       │   │   ├── nav-favorites.jsx
│       │   │   ├── nav-projects.jsx
│       │   │   ├── nav-workspaces.jsx
│       │   │   ├── nav-main.jsx
│       │   │   ├── nav-secondary.jsx
│       │   │   ├── nav-user.jsx
│       │   │   └── team-switcher.jsx
│       │   ├── features/            # Feature-specific components
│       │   │   ├── auth/            # Authentication
│       │   │   │   ├── Login.jsx
│       │   │   │   └── Signup.jsx
│       │   │   ├── dashboard/       # Dashboard components
│       │   │   │   ├── Dashboard.jsx
│       │   │   │   ├── DashboardHeader.jsx
│       │   │   │   ├── PreviewSection.jsx
│       │   │   │   ├── ProfileCard.jsx
│       │   │   │   ├── RecentUploads.jsx
│       │   │   │   ├── UploadHistory.jsx
│       │   │   │   └── UploadSection.jsx
│       │   │   ├── chat/            # AI Chat feature
│       │   │   │   └── AskAI.jsx
│       │   │   ├── Projects.jsx     # Project management
│       │   │   └── Profile.jsx      # User profile
│       │   └── ui/                  # shadcn/ui components
│       ├── pages/                   # Page components
│       │   └── app/                 # App-specific pages
│       │       └── dashboard/
│       │           └── data.json
│       ├── store/                   # Redux store
│       │   └── redux/
│       │       ├── slices/
│       │       │   ├── authSlice.js
│       │       │   └── dashboardSlice.js
│       │       └── store.js
│       ├── services/                # API services
│       │   └── api.js
│       ├── utils/                   # Utility functions
│       │   └── lib/
│       │       └── utils.js
│       ├── hooks/                   # Custom hooks
│       │   └── use-mobile.js
│       ├── styles/                  # Global styles
│       │   └── index.css
│       ├── App.jsx                  # Main app component
│       └── main.jsx                 # App entry point
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/              # Custom middleware
│   │   │   └── auth.js
│   │   ├── models/                  # Database models
│   │   │   ├── User.js
│   │   │   └── ExcelData.js
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/                # Business logic
│   │   ├── utils/                   # Utility functions
│   │   │   └── validation.js
│   │   └── config/                  # Configuration files
│   ├── uploads/                     # File uploads
│   ├── package.json
│   └── server.js                    # Server entry point
└── README.md
```

## 🚀 Features

### 🎨 **UI/UX Enhancements**
- **Professional Logo System**: Multiple logo variants (default, minimal, chart, analytics)
- **Vizard AI Logo**: Wizard-themed design for AI assistant
- **Theme Integration**: Black/white dual tone design with theme adaptation
- **Responsive Design**: Mobile-first approach with consistent layouts

### 📊 **Projects Management**
- **Full CRUD Operations**: Create, Read, Update, Delete for uploaded files
- **Advanced Data Table**: shadcn/ui table with sorting, filtering, and search
- **Statistics Dashboard**: Project counts, status tracking, and metrics
- **Action Menus**: View Data, Create Chart, Pie Chart, Line Chart options
- **Delete Confirmation**: Modal dialogs with proper error handling

### 🤖 **AI Chat Integration (Vizard)**
- **Real-time Chat Interface**: Professional chat UI with user/bot distinction
- **Quick Actions Sidebar**: Chart creation options and recent conversations
- **Mock AI Responses**: Simulated AI assistant responses
- **Theme Integration**: Consistent with overall design system

### ⚡ **Quick Create Feature**
- **Modal Dialog**: Profile card-style chart selection interface
- **5 Chart Types**: Bar Chart, Pie Chart, Line Chart, Scatter Plot, Area Chart
- **Feature Descriptions**: Each chart includes badges and feature lists
- **One-click Navigation**: Direct routing to dashboard with chart type selection

### 🔧 **Technical Features**
- **Redux State Management**: Centralized state for user data and authentication
- **Protected Routes**: Authentication-based route protection
- **API Integration**: RESTful API with proper error handling
- **File Upload System**: Secure file handling with validation
- **Theme System**: Dynamic theme switching with persistence

### 🎯 **Navigation & Layout**
- **Sidebar Navigation**: Comprehensive navigation with Quick Create prominence
- **User Profile Integration**: Real user data with theme information
- **Responsive Layout**: Adaptive design for all screen sizes
- **Breadcrumb Navigation**: Clear navigation hierarchy

## 🛠️ Technology Stack

**Frontend**

- React 19, Redux Toolkit, Vite, TailwindCSS
- Chart.js (2D charts), Three.js (3D charts)
- React Router, Radix UI, Shadcn UI

**Backend**

- Node.js, Express.js, MongoDB + Mongoose
- JWT (Authentication), Multer (File uploads)
- SheetJS/xlsx (Excel parsing)
- Gemini API (AI summaries)

---

## 📁 Project Structure

```
DataViz/
├── client/         # React frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/         # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── README.md
```

---

## ✨ Features

- **User Authentication:** JWT-based, with role-based access (User/Admin)
- **Excel Upload & Parsing:** Upload `.xlsx`/`.xls` files, parse and validate data
- **Data Visualization:** Interactive 2D (Chart.js) and 3D (Three.js) charts
- **User Dashboard:** Upload history, profile management, chart analytics
- **Admin Panel:** User management, platform stats, edit/delete users
- **AI Summary:** Generate AI-powered summaries of your data (Gemini integration, requires API key)
- **Download Options:** Export your data and charts
- **Responsive UI:** Modern, mobile-friendly design with TailwindCSS and Shadcn UI

---

## 🛠️ Installation & Setup
### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (v5+)
- npm
- (Optional) Gemini API key for AI summaries

### 1. Backend Setup
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values (see below)
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
cp .env.example .env # (optional, only if you want to override API URL)
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`server/.env.example`)

```env
# MongoDB connection string (required)
MONGODB_URI=mongodb://localhost:27017/dataviz

# JWT secret key (required)
JWT_SECRET=your_jwt_secret_key

# JWT expiration (optional, default: 7d)
JWT_EXPIRES_IN=7d

# Node environment (optional, default: development)
NODE_ENV=development

# Port for backend server (optional, default: 5000)
PORT=5000

# Frontend URL for CORS (required in production)
FRONTEND_URL=http://localhost:5173

# Gemini API Key (required for AI summary features)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`client/.env.example`)

```env
# Base URL for backend API (optional, default: http://localhost:5000/api)
VITE_API_URL=http://localhost:5000/api
```

---

## 🚦 Development Workflow

- **Frontend:** `npm run dev` (Vite dev server)
- **Backend:** `npm run dev` (Nodemon/Express)
- **Build frontend:** `npm run build`
- **Lint frontend:** `npm run lint`

---

## 🧑‍💻 Contributing
### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DataViz
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in server directory
   cd server
   cp .env.example .env
   ```

   Add your environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start the server (from server directory)
   npm run dev

   # Start the client (from client directory)
   cd ../client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📁 Directory Organization Benefits

### **Client-side Organization**
- **`components/common/`**: Reusable components across features
- **`components/layout/`**: Layout and navigation components
- **`components/features/`**: Feature-specific components
- **`components/ui/`**: shadcn/ui component library
- **`store/`**: Redux store and slices
- **`services/`**: API service layer
- **`utils/`**: Utility functions and helpers
- **`styles/`**: Global styles and CSS

### **Server-side Organization**
- **`src/controllers/`**: Route handlers and business logic
- **`src/middleware/`**: Custom middleware functions
- **`src/models/`**: Database models and schemas
- **`src/routes/`**: API route definitions
- **`src/services/`**: Business logic services
- **`src/utils/`**: Utility functions
- **`src/config/`**: Configuration files

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Client and server-side route protection
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Secure cross-origin requests
- **Error Handling**: Proper error responses without sensitive data

## 🎨 Design System

- **Consistent Components**: shadcn/ui component library
- **Theme System**: Light/dark mode with custom color themes
- **Typography**: Consistent font hierarchy and spacing
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: WCAG compliant components

## 📈 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced chart customization
- [ ] Data export functionality
- [ ] User roles and permissions
- [ ] Advanced analytics dashboard
- [ ] Integration with external data sources
- [ ] Mobile application
- [ ] Real AI integration for chat

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature-amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@dataviz.com or create an issue in the repository.

---

**Built with ❤️ by the DataViz Team**

---

## 📚 API Overview

### Auth

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password

### Data

- `POST /api/dashboard/upload` — Upload Excel file
- `GET /api/dashboard/uploads` — Get upload history
- `DELETE /api/dashboard/uploads/:id` — Delete upload
- `POST /api/dashboard/analysis/:uploadId` — Save chart analysis
- `GET /api/dashboard/analysis/:uploadId` — Get analysis history
- `POST /api/dashboard/gemini/:uploadId` — Get AI summary (requires GEMINI_API_KEY)

### Admin

- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id` — Update user
- `DELETE /api/admin/users/:id` — Delete user
- `GET /api/admin/stats` — Platform statistics 