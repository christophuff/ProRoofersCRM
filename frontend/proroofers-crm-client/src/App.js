import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import TaskDashboard from './components/TaskDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import './App.css';
import ProjectDashboard from './components/ProjectDashboard';

// Main dashboard component that renders different sections
function Dashboard() {
  const [currentSection, setCurrentSection] = useState('tasks');

  const renderSection = () => {
    switch(currentSection) {
      case 'tasks':
        return <TaskDashboard />;
      case 'customers':
        return <CustomerDashboard />;
      case 'projects':
        return <ProjectDashboard />;
      case 'users':
        return (
          <div className="section-placeholder">
            <h2>User Management</h2>
            <p>User administration coming soon!</p>
          </div>
        );
      default:
        return <TaskDashboard />;
    }
  };

  return (
    <div className="app">
      <Navbar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      <main className="main-content">
        {renderSection()}
      </main>
    </div>
  );
}

// Auth routing component
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? <Dashboard /> : <AuthForm />;
}

// Root App component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;