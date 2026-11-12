
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import CadastrarAssistido from './pages/CadastrarAssistido';
import Dashboard from './pages/Dashboard';
import GerenciarEquipe from './pages/GerenciarEquipe';
import HomeSeletor from './pages/HomeSeletor';
import GerenciarVoluntarios from './pages/GerenciarVoluntarios';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/modulos" element={
                <ProtectedRoute>
                  <HomeSeletor />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Dashboard />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/voluntarios" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <GerenciarVoluntarios />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-voluntarios" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <GerenciarVoluntarios />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/cadastrar" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <CadastrarAssistido />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-equipe" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <GerenciarEquipe />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/equipe" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <GerenciarEquipe />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/modulos" />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
