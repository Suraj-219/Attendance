/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Face recognition API types
 */
export interface FaceRecognitionRequest {
  descriptor: number[]; // Float32Array converted to regular array for JSON
  threshold?: number;
}

export interface FaceRecognitionResponse {
  success: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
  };
  distance?: number;
  message: string;
}
