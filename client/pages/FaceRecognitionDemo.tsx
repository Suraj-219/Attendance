import { useState } from 'react';
import FaceRecognition from '@/components/FaceRecognition';
import CameraTest from '@/components/CameraTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUsersWithFaceRecognition, removeFaceDescriptor } from '@/lib/faceRecognition';
import { Trash2, User, Camera, Scan } from 'lucide-react';

export default function FaceRecognitionDemo() {
  const [recognizedUser, setRecognizedUser] = useState<{ name: string; email: string } | null>(null);
  const [users, setUsers] = useState(getUsersWithFaceRecognition());

  const handleFaceRecognized = (user: { name: string; email: string }) => {
    setRecognizedUser(user);
    setUsers(getUsersWithFaceRecognition()); // Refresh the list
  };

  const handleFaceError = (error: string) => {
    console.error('Face recognition error:', error);
  };

  const handleRemoveUser = (email: string) => {
    if (confirm('Are you sure you want to remove face recognition for this user?')) {
      removeFaceDescriptor(email);
      setUsers(getUsersWithFaceRecognition());
      if (recognizedUser?.email === email) {
        setRecognizedUser(null);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Face Recognition Demo</h1>
          <p className="text-muted-foreground">
            Test the face recognition system for student authentication
          </p>
        </div>

        <Tabs defaultValue="face-recognition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="face-recognition" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Face Recognition
            </TabsTrigger>
            <TabsTrigger value="camera-test" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Camera Test
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="face-recognition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Face Recognition Component */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Face Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FaceRecognition
                    mode="recognize"
                    onRecognized={handleFaceRecognized}
                    onError={handleFaceError}
                  />
                </CardContent>
              </Card>

              {/* Recognition Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Recognition Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {recognizedUser ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-800">User Recognized!</h3>
                        <p className="text-green-700">Name: {recognizedUser.name}</p>
                        <p className="text-green-700">Email: {recognizedUser.email}</p>
                      </div>
                      <Button 
                        onClick={() => setRecognizedUser(null)}
                        variant="outline"
                        className="w-full"
                      >
                        Clear Results
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No user recognized yet</p>
                      <p className="text-sm">Use the face recognition on the left to test</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="camera-test" className="space-y-6">
            <CameraTest />
          </TabsContent>
        </Tabs>

        {/* Registered Users */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users with Face Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Student</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveUser(user.email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users with face recognition registered</p>
                <p className="text-sm">Register as a student to enable face recognition</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Register a Student Account</p>
                  <p className="text-muted-foreground">
                    Go to the signup page and create a student account. You'll be prompted to capture your face.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Test Face Recognition</p>
                  <p className="text-muted-foreground">
                    Use the face recognition component above to test if you can be recognized.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Login with Face Recognition</p>
                  <p className="text-muted-foreground">
                    Go to the login page and try the "Face Recognition" tab to login without a password.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
