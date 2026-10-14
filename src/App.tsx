import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { KitchenPage } from './pages/KitchenPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { LiveBackground } from './components/LiveBackground';

import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="relative min-h-screen">
          <LiveBackground />
          <div className="relative z-10">
            <Routes>
              {/* Customer Self-Ordering Views */}
              <Route path="/" element={<CustomerMenuPage />} />

              {/* Kitchen Display System Views */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['kitchen', 'admin']} redirectPath="/kitchen/login">
                    <KitchenPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/kitchen/login" element={<LoginPage role="kitchen" />} />

              {/* Admin Management Views */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin/login" element={<LoginPage role="admin" />} />

              {/* General Login Hub */}
              <Route path="/login" element={<LoginPage role="kitchen" />} />

              {/* Catch-all redirect to Customer Menu */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
      </div>
    </div>
  </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
