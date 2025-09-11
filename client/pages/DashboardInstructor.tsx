import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import TrendChart from "@/components/TrendChart";

export default function DashboardInstructor() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Instructor Dashboard</h1>
        <div className="flex items-center gap-2">
          <a href="/face-demo" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Face Demo</a>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <a href="/dashboard/student" className="text-primary underline font-semibold mr-4">Student Dashboard</a>
        <a href="/dashboard/admin" className="text-primary underline font-semibold">Admin Dashboard</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Active courses</div><div className="mt-2 text-3xl font-bold">3</div></div>
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Today headcount</div><div className="mt-2 text-3xl font-bold">140</div></div>
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Late</div><div className="mt-2 text-3xl font-bold">9</div></div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-2">Attendance trend</h2>
        <TrendChart />
      </div>
    </div>
  );
}
