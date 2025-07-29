/**
 * Simple test script to verify API endpoints
 * Run with: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Dynamic Link Generator API\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check endpoint...');
    const healthCheck = await makeRequest('GET', '/');
    console.log(`   Status: ${healthCheck.statusCode}`);
    console.log(`   Response: ${healthCheck.body}\n`);

    // Test 2: Generate dynamic link
    console.log('2. Testing dynamic link generation...');
    const testFormData = {
      formId: 'test-form-123',
      submissionId: 'test-submission-456',
      formData: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test submission'
      }
    };

    const generateResponse = await makeRequest('POST', '/api/generate-link', testFormData);
    console.log(`   Status: ${generateResponse.statusCode}`);
    const generateResult = JSON.parse(generateResponse.body);
    console.log(`   Response: ${JSON.stringify(generateResult, null, 2)}\n`);

    if (generateResult.success && generateResult.linkId) {
      // Test 3: Access dynamic link
      console.log('3. Testing dynamic link access...');
      const linkPath = `/link/${generateResult.linkId}`;
      const linkResponse = await makeRequest('GET', linkPath);
      console.log(`   Status: ${linkResponse.statusCode}`);
      console.log(`   Content-Type: ${linkResponse.headers['content-type']}`);
      console.log(`   Response length: ${linkResponse.body.length} characters\n`);

      // Test 4: Get link statistics
      console.log('4. Testing link statistics...');
      const statsPath = `/api/link-stats/${generateResult.linkId}`;
      const statsResponse = await makeRequest('GET', statsPath);
      console.log(`   Status: ${statsResponse.statusCode}`);
      const statsResult = JSON.parse(statsResponse.body);
      console.log(`   Response: ${JSON.stringify(statsResult, null, 2)}\n`);
    }

    // Test 5: Webhook endpoint
    console.log('5. Testing webhook endpoint...');
    const webhookData = {
      formId: 'webhook-test-form',
      submissionId: 'webhook-test-submission',
      formData: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      responseUrl: 'https://forms.google.com/response/123'
    };

    const webhookResponse = await makeRequest('POST', '/webhook/form-submission', webhookData);
    console.log(`   Status: ${webhookResponse.statusCode}`);
    const webhookResult = JSON.parse(webhookResponse.body);
    console.log(`   Response: ${JSON.stringify(webhookResult, null, 2)}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy this backend to your hosting service');
    console.log('2. Update the BACKEND_URL in your Google Apps Script');
    console.log('3. Set up the Google Forms add-on');
    console.log('4. Test with a real Google Form');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the server is running:');
    console.log('   npm run dev');
  }
}

// Check if server is running
console.log('Checking if server is running on port 3000...\n');
runTests();