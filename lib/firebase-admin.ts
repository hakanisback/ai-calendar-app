import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

// Path to the service account key file
const serviceAccountPath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');

// Initialize Firebase Admin
let adminApp: App | null = null;
let adminAuth: Auth | null = null;

try {
  // Check if service account file exists
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Firebase Admin: Service account key file not found at', serviceAccountPath);
    console.error('Please download the service account key from Firebase Console and save it as config/serviceAccountKey.json');
  } else {
    // Read the service account file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Initialize Firebase Admin if not already done
    if (getApps().length === 0) {
      console.log('Initializing Firebase Admin with service account...');
      
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      
      adminAuth = getAuth(adminApp);
      console.log('Firebase Admin initialized successfully');
    } else {
      adminApp = getApps()[0];
      adminAuth = getAuth(adminApp);
    }
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export { adminAuth, adminApp };
