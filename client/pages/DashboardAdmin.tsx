import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import TrendChart from "@/components/TrendChart";

export default function DashboardAdmin() {
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
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* <div className="mb-4">
        <a href="/dashboard/student" className="text-primary underline font-semibold mr-4">Student Dashboard</a>
        <a href="/dashboard/admin" className="text-primary underline font-semibold">Admin Dashboard</a>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Total courses</div><div className="mt-2 text-3xl font-bold">24</div></div>
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Users</div><div className="mt-2 text-3xl font-bold">1,245</div></div>
        <div className="bg-card border rounded-xl p-5"><div className="text-sm text-muted-foreground">Today sessions</div><div className="mt-2 text-3xl font-bold">11</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 lg:col-span-2">
          <h2 className="font-semibold mb-2">Overall attendance</h2>
          <TrendChart />
        </div>
        {/* <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-2">Management</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="/records" className="underline">Records & CSV export</a></li>
            <li><a href="/face-demo" className="underline">Face Recognition Demo</a></li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
