import "./global.css";


import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Records from "./pages/Records";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardInstructor from "./pages/DashboardInstructor";
import DashboardAdmin from "./pages/DashboardAdmin";
import FaceRecognitionDemo from "./pages/FaceRecognitionDemo";

const queryClient = new QueryClient();

const App = () => {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setRole(localStorage.getItem("role"));
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background border-b">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                 <a href="/" className="font-extrabold tracking-tight text-lg flex items-center gap-2"><img src="/attendance.jpg" className="w-8 object-cover"/>Student Tracker</a>
                <nav className="hidden md:flex items-center gap-4 text-sm">
                  <a href="/" className="hover:underline">Dashboard</a>
                  {/* Removed Run Session and Scan to focus on face recognition */}
                  <a href="/records" className="hover:underline">Records</a>
                  <a href="/face-demo" className="hover:underline">Face Demo</a>
                </nav>
                <div className="flex items-center gap-2">
                  {role && <span className="px-2 py-1 rounded-md text-xs border bg-secondary">{role}</span>}
                  <a href="/signup" className="px-3 py-1.5 rounded-md border text-sm">Sign up</a>
                  <a href="/login" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm">Login</a>
                </div>
              </div>
            </header>
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard/student" element={<DashboardStudent />} />
                <Route path="/dashboard/instructor" element={<DashboardInstructor />} />
                <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                {/* Session and Scan routes removed to focus on face recognition demo */}
                <Route path="/records" element={<Records />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/face-demo" element={<FaceRecognitionDemo />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="border-t py-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()}Student Tracker</footer>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
