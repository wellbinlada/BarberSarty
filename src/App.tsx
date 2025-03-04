import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Login from './components/Login';
import BookingForm from './components/BookingForm';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-semibold text-gray-900">Barbearia Sarty</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<BookingForm />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;