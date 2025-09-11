import * as faceapi from 'face-api.js';

export interface User {
  name: string;
  email: string;
  role: string;
  faceDescriptor?: Float32Array;
}

export interface FaceRecognitionResult {
  success: boolean;
  user?: User;
  distance?: number;
  message: string;
}

/**
 * Compare a face descriptor with stored user descriptors
 */
export function recognizeFace(
  descriptor: Float32Array, 
  threshold: number = 0.6
): FaceRecognitionResult {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter((user: any) => 
      user.role === 'Student' && user.faceDescriptor
    );
    
    let bestMatch: User | null = null;
    let bestDistance = threshold;

    for (const student of students) {
      if (student.faceDescriptor) {
        const storedDescriptor = new Float32Array(student.faceDescriptor);
        const distance = faceapi.euclideanDistance(descriptor, storedDescriptor);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = {
            name: student.name,
            email: student.email,
            role: student.role,
            faceDescriptor: storedDescriptor
          };
        }
      }
    }

    if (bestMatch) {
      return {
        success: true,
        user: bestMatch,
        distance: bestDistance,
        message: `Welcome, ${bestMatch.name}!`
      };
    } else {
      return {
        success: false,
        message: 'Face not recognized. Please try again or register first.'
      };
    }
  } catch (error) {
    console.error('Error recognizing face:', error);
    return {
      success: false,
      message: 'Error during face recognition. Please try again.'
    };
  }
}

/**
 * Store face descriptor for a user
 */
export function storeFaceDescriptor(
  email: string, 
  descriptor: Float32Array
): boolean {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].faceDescriptor = Array.from(descriptor);
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error storing face descriptor:', error);
    return false;
  }
}

/**
 * Get face descriptor for a user
 */
export function getFaceDescriptor(email: string): Float32Array | null {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((user: any) => user.email === email);
    
    if (user && user.faceDescriptor) {
      return new Float32Array(user.faceDescriptor);
    }
    return null;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
}

/**
 * Remove face descriptor for a user
 */
export function removeFaceDescriptor(email: string): boolean {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((user: any) => user.email === email);
    
    if (userIndex !== -1) {
      delete users[userIndex].faceDescriptor;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing face descriptor:', error);
    return false;
  }
}

/**
 * Check if a user has face recognition enabled
 */
export function hasFaceRecognition(email: string): boolean {
  return getFaceDescriptor(email) !== null;
}

/**
 * Get all users with face recognition
 */
export function getUsersWithFaceRecognition(): User[] {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter((user: any) => 
      user.faceDescriptor && user.role === 'Student'
    ).map((user: any) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      faceDescriptor: new Float32Array(user.faceDescriptor)
    }));
  } catch (error) {
    console.error('Error getting users with face recognition:', error);
    return [];
  }
}



