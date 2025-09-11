import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-regular-svg-icons";

export default function DashboardStudent() {
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
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:shadow-lg mb-4" href="/">
          <FontAwesomeIcon icon={faCircleLeft} />
          <span>Back</span>
        </a>
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
      
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
        <div className="bg-card border rounded-xl p-5">
          <div className="text-sm text-muted-foreground">Today</div>
          <div className="mt-2 text-3xl font-bold">2 sessions</div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="text-sm text-muted-foreground">Attendance rate</div>
          <div className="mt-2 text-3xl font-bold">92%</div>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="mt-2 text-3xl font-bold">On time</div>
        </div>
      </div>

      {/* <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/face-demo" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Face Recognition Demo</a>
          <a href="/records" className="px-4 py-2 rounded-md border">My records</a>
        </div>
      </div> */}
    </div>
  );
}
