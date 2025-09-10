import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "@/lib/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-regular-svg-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = authenticate(email, password);
      if (user.role === "Instructor") navigate("/dashboard/instructor");
      else if (user.role === "Student") navigate("/dashboard/student");
      else navigate("/dashboard/admin");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-card border rounded-xl p-6 space-y-4">
        <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:shadow-lg" href="/">
          <FontAwesomeIcon icon={faCircleLeft} />
          <span>Back</span>
        </a>
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <div className="p-2 text-sm rounded-md border bg-rose-50 text-rose-700 border-rose-200">{error}</div>}
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border bg-background" required />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border bg-background" required />
        </div>
        <button type="submit" className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">Sign in</button>
        <div className="text-sm text-muted-foreground">No account? <a className="underline" href="/signup">Sign up</a></div>
      </form>
    </div>
  );
}
