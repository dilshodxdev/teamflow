import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PendingApprovalPage } from "./pages/auth/PendingApprovalPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { TasksPage } from "./pages/tasks/TasksPage";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { TeamPage } from "./pages/team/TeamPage";
import { RisksPage } from "./pages/risks/RisksPage";
import { Logo } from "./components/ui/Logo";

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Logo size="lg" />
        <div className="flex items-center gap-2 text-primary font-headline-md">
          <span className="material-symbols-outlined animate-spin text-[24px]">
            refresh
          </span>
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "pending") {
    return <Navigate to="/pending" replace />;
  }

  return <>{children}</>;
};

// Pending Route Guard
const PendingRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Logo size="lg" />
        <div className="flex items-center gap-2 text-primary font-headline-md">
          <span className="material-symbols-outlined animate-spin text-[24px]">
            refresh
          </span>
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "pending") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Guard (prevents logged in users from visiting login/register)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <Logo size="lg" />
      </div>
    );
  }

  if (user) {
    if (user.role === "pending") {
      return <Navigate to="/pending" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Pending Approval Route */}
          <Route
            path="/pending"
            element={
              <PendingRoute>
                <PendingApprovalPage />
              </PendingRoute>
            }
          />

          {/* Authenticated Application Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="risks" element={<RisksPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
