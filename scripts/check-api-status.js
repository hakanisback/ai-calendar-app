const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');
require('dotenv').config();

async function checkAPIStatus() {
  try {
    console.log('Checking API status...');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const service = google.serviceusage('v1');
    const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || 'sirschedule-main';
    const serviceName = 'aiplatform.googleapis.com';
    
    console.log(`Checking status of ${serviceName} for project ${projectId}`);
    
    const res = await service.services.get({
      name: `projects/${projectId}/services/${serviceName}`,
      auth: auth,
    });
    
    console.log('\nAPI Status:', res.data.state);
    console.log('Details:', JSON.stringify(res.data, null, 2));
    
  } catch (error) {
    console.error('\nError checking API status:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkAPIStatus();
