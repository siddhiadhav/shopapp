
import { File } from '@shopverse/common'; // Adjust this to your actual file type
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      uploaderError?: Error;
      //files?: File[]; // or any[] depending on your uploader's return
      files?:import('@shopverse/common').File[];
      currentUser?: {
        userId: string;
        email: string;
        // Add other user properties as needed
      };
    }
  }
}
export{};