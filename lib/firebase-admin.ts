import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

try {
  if (getApps().length === 0) {
    console.log('Initializing Firebase Admin...');
    let serviceAccount;

    // 1. Try to load from file path environment variable (for production/deployment)
    if (process.env.FIREBASE_CREDENTIALS_PATH) {
      const filePath = path.resolve(process.env.FIREBASE_CREDENTIALS_PATH);
      if (fs.existsSync(filePath)) {
        console.log(`Using service account file from path: ${filePath}`);
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        console.error(`Firebase Admin: Service account file not found at path specified by FIREBASE_CREDENTIALS_PATH: ${filePath}`);
      }
    } 
    // 2. Try to load from JSON environment variable (fallback for production)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        console.log('Using service account from FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        console.error('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON.', e);
      }
    }
    // 3. Try to load from local file (for local development)
    else {
      const localPath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');
      if (fs.existsSync(localPath)) {
        console.log(`Using local service account file: ${localPath}`);
        serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      } else {
        console.log('Firebase Admin: No service account credentials found. Please set FIREBASE_CREDENTIALS_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or place serviceAccountKey.json in /config.');
      }
    }

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      adminAuth = getAuth(adminApp);
      console.log('Firebase Admin initialized successfully');
    } else {
      throw new Error('Could not find or parse Firebase service account credentials.');
    }

  } else {
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export { adminAuth, adminApp };
