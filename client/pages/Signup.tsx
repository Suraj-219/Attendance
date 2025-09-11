import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, Role } from "@/lib/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-regular-svg-icons";
import FaceRecognition from "@/components/FaceRecognition";
import { storeFaceDescriptor } from "@/lib/faceRecognition";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [error, setError] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [step, setStep] = useState<'form' | 'face-capture'>('form');
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    // For students, require face capture
    if (role === "Student") {
      setStep('face-capture');
      return;
    }
    
    // For non-students, create user directly
    try {
      createUser({ name, email, password, role });
      navigate("/login");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleFaceCaptured(descriptor: Float32Array) {
    setFaceDescriptor(descriptor);
    try {
      // Create user first
      createUser({ name, email, password, role });
      
      // Then store face descriptor
      const success = storeFaceDescriptor(email, descriptor);
      if (success) {
        navigate("/login");
      } else {
        setError("Failed to store face data. Please try again.");
        setStep('form');
      }
    } catch (e) {
      setError((e as Error).message);
      setStep('form');
    }
  }

  function handleFaceError(error: string) {
    setError(error);
    setStep('form');
  }

  if (step === 'face-capture') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="mb-4">
            <button 
              onClick={() => setStep('form')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faCircleLeft} />
              <span>Back to Form</span>
            </button>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold mb-2">Face Registration</h1>
            <p className="text-muted-foreground">
              Please position your face in the camera frame and click "Capture Face" to complete your registration.
            </p>
          </div>
          {error && (
            <div className="mb-4 p-2 text-sm rounded-md border bg-rose-50 text-rose-700 border-rose-200">
              {error}
            </div>
          )}
          <FaceRecognition
            mode="capture"
            onFaceDetected={handleFaceCaptured}
            onError={handleFaceError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-card border rounded-xl p-6 space-y-4">
        <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-background shadow-sm transition hover:bg-primary hover:text-primary-foreground hover:shadow-lg" href="/">
          <FontAwesomeIcon icon={faCircleLeft} />
          <span>Back</span>
        </a>
        <h1 className="text-2xl font-semibold">Sign up</h1>
        {error && <div className="p-2 text-sm rounded-md border bg-rose-50 text-rose-700 border-rose-200">{error}</div>}
        <div>
          <label className="text-sm text-muted-foreground">Name</label>
          <input className="mt-1 w-full px-3 py-2 rounded-md border bg-background" value={name} onChange={(e)=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <input type="email" className="mt-1 w-full px-3 py-2 rounded-md border bg-background" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Password</label>
          <input type="password" className="mt-1 w-full px-3 py-2 rounded-md border bg-background" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Role</label>
          <select value={role} onChange={(e)=>setRole(e.target.value as Role)} className="mt-1 w-full px-3 py-2 rounded-md border bg-background">
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        {role === "Student" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Students will need to register their face for attendance tracking.
            </p>
          </div>
        )}
        <button type="submit" className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium">
          {role === "Student" ? "Continue to Face Registration" : "Create account"}
        </button>
        <div className="text-sm text-muted-foreground">Already have an account? <a className="underline" href="/login">Login</a></div>
      </form>
    </div>
  );
}
