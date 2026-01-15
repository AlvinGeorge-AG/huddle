import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { auth } from "./firebase";
import Login from "./Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import Loading from "./components/Loading";
import Chat from "./chat";
import Ch2 from "./ch2";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <Loading />;

  return (
    <QueryClientProvider client={queryClient}>
    
        <Routes>
  {/* 1. PUBLIC LANDING PAGE */}
  <Route
  path="/"
  element={user ? <Navigate to="/dashboard" replace /> : <Index />}
/>


  {/* 2. LOGIN PAGE */}
  <Route
    path="/login"
    element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
  />

  {/* 3. PROTECTED DASHBOARD */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute user={user}>
        <Dashboard user={user} />
      </ProtectedRoute>
    }
  />

  {/* 4. PROTECTED CHAT */}
  <Route
    path="/chat"
    element={
      <ProtectedRoute user={user}>
        <Chat user={user} />
      </ProtectedRoute>
    }
  />
  {/* 4.1 Activity Chat */}
  <Route path="/chat/:roomId" element={<Ch2 user={user} />} />

        <Route path="*" element={<Navigate to="/" replace />} 
  />
  {/* 5. 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>

        <Toaster />
    </QueryClientProvider>
  );
}

export default App;