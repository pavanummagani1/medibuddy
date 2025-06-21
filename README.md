# MedBuddy - Medication Management System

A comprehensive medication management application built with React and Node.js, designed to help patients and caretakers track medication adherence and manage healthcare routines.

## Features

### ✅ Phase 1 (Completed)
- **User Authentication**: Secure login/signup with SQLite database
- **Medication CRUD Operations**:
  - Add medications with name, dosage, frequency, instructions
  - Edit existing medications
  - Delete medications
  - View medications in a clean, organized list
- **Dashboard with Real Data**:
  - Total medications count
  - Today's adherence percentage
  - Current streak tracking
  - Weekly adherence chart
  - Recent medications overview

### ✅ Phase 2 (Completed)
- **Adherence Tracking**: Visual tracking of medication intake with statistics
- **Calendar View**: Interactive calendar showing daily medication adherence
- **Real-time Updates**: Live data updates across all dashboard components

### 🚀 Key Features
- **Role-based Access**: Support for both patients and caretakers
- **Interactive Calendar**: Visual medication tracking with color-coded status
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Form Validation**: Comprehensive validation with helpful error messages
- **Loading States**: Proper loading indicators and error handling
- **Real-time Statistics**: Live adherence tracking and streak counting

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing
- **React Query** - Server state management and caching
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization for adherence charts
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Elegant toast notifications
- **Date-fns** - Date manipulation and formatting

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medication-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   JWT_SECRET=your-super-secret-jwt-secret-key-change-in-production
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Usage

### User Registration
1. Visit the application homepage
2. Click "Sign up" to create a new account
3. Choose your role (Patient or Caretaker)
4. Fill in your details and create an account

### Adding Medications
1. Navigate to the "Medications" page
2. Click "Add Medication"
3. Fill in the medication details:
   - Name (e.g., Aspirin, Metformin)
   - Dosage (e.g., 50mg, 1 tablet)
   - Frequency (Once daily, Twice daily, etc.)
   - Instructions (optional)
   - Start and end dates

### Tracking Adherence
1. **Mark as Taken**: Click the green checkmark next to a medication
2. **Mark as Missed**: Click the red X next to a medication
3. **View Calendar**: Use the calendar page to see your adherence history
4. **Dashboard Stats**: Monitor your overall progress on the dashboard

### Calendar Features
- **Color-coded Days**: 
  - Green: All medications taken
  - Yellow: Some medications taken
  - Red: Medications missed
  - Gray: No data available
- **Daily Details**: Click any date to see specific medication logs
- **Monthly Navigation**: Browse through different months

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Medications
- `GET /api/medications` - Get user's medications
- `POST /api/medications` - Create new medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Medication Logs
- `GET /api/medication-logs` - Get medication logs
- `POST /api/medication-logs` - Log medication intake

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/weekly-adherence` - Get weekly adherence data

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `role` - 'patient' or 'caretaker'
- `created_at` - Timestamp

### Medications Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Medication name
- `dosage` - Dosage information
- `frequency` - How often to take
- `instructions` - Additional instructions
- `start_date` - When to start taking
- `end_date` - When to stop (optional)
- `created_at` - Timestamp

### Medication Logs Table
- `id` - Primary key
- `medication_id` - Foreign key to medications
- `user_id` - Foreign key to users
- `taken_at` - When the log was created
- `status` - 'taken', 'missed', or 'skipped'
- `notes` - Optional notes
- `created_at` - Timestamp

## Testing

Run the test suite:
```bash
npm test
```

The project includes tests for:
- API service functionality
- Form validation and submission
- Component rendering and user interactions

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Performance Optimizations

- **React Query Caching**: Efficient data caching and synchronization
- **Lazy Loading**: Components and routes loaded on demand
- **Optimized Renders**: Proper use of React hooks to prevent unnecessary re-renders
- **Responsive Design**: Mobile-first approach with efficient CSS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.

---

**MedBuddy** - Making medication management simple and effective! 💊✨
