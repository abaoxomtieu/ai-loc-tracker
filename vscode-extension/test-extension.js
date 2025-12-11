/**
 * Test script to simulate extension sending events to backend
 * This simulates what the extension would do when tracking code
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';
const DEVELOPER_ID = 'test-dev-1';

async function testExtension() {
  console.log('Testing VSCode Extension Integration...\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/metrics/health`);
    console.log('✅ Backend is healthy:', healthResponse.data);

    // Test 2: Simulate completion event (AI-generated code)
    console.log('\n2. Simulating completion event (AI inline completion)...');
    const completionEvent = {
      source: 'completion',
      lines: 15,
      file_path: '/Users/test/project/src/main.py',
      language: 'python',
      type: 'code'
    };
    const completionResponse = await axios.post(
      `${BACKEND_URL}/api/events/code`,
      { ...completionEvent, developer_id: DEVELOPER_ID }
    );
    console.log('✅ Completion event sent:', completionResponse.data);

    // Test 3: Simulate manual code event
    console.log('\n3. Simulating manual code event...');
    const manualEvent = {
      source: 'manual',
      lines: 8,
      file_path: '/Users/test/project/src/utils.py',
      language: 'python',
      type: 'code'
    };
    const manualResponse = await axios.post(
      `${BACKEND_URL}/api/events/code`,
      { ...manualEvent, developer_id: DEVELOPER_ID }
    );
    console.log('✅ Manual event sent:', manualResponse.data);

    // Test 4: Simulate test generation event
    console.log('\n4. Simulating test generation event...');
    const testEvent = {
      source: 'completion',
      lines: 20,
      file_path: '/Users/test/project/tests/test_main.py',
      language: 'python',
      test_framework: 'pytest',
      coverage: 85.5,
      type: 'test'
    };
    const testResponse = await axios.post(
      `${BACKEND_URL}/api/events/test`,
      { ...testEvent, developer_id: DEVELOPER_ID }
    );
    console.log('✅ Test event sent:', testResponse.data);

    // Test 5: Simulate documentation event
    console.log('\n5. Simulating documentation event...');
    const docEvent = {
      source: 'manual',
      lines: 5,
      file_path: '/Users/test/project/README.md',
      doc_type: 'readme',
      type: 'documentation'
    };
    const docResponse = await axios.post(
      `${BACKEND_URL}/api/events/documentation`,
      { ...docEvent, developer_id: DEVELOPER_ID }
    );
    console.log('✅ Documentation event sent:', docResponse.data);

    // Test 6: Get developer metrics
    console.log('\n6. Getting developer metrics...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit for events to be processed
    const metricsResponse = await axios.get(
      `${BACKEND_URL}/api/metrics/developer/${DEVELOPER_ID}`
    );
    console.log('✅ Developer metrics:');
    console.log(JSON.stringify(metricsResponse.data, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed! Extension integration is working.');
    console.log('\nSummary:');
    console.log(`- Total LOC: ${metricsResponse.data.code_metrics.total_lines}`);
    console.log(`- AI LOC: ${metricsResponse.data.code_metrics.ai_lines} (${metricsResponse.data.code_metrics.ai_percentage}%)`);
    console.log(`- Manual LOC: ${metricsResponse.data.code_metrics.manual_lines} (${metricsResponse.data.code_metrics.manual_percentage}%)`);
    console.log(`- Overall Score: ${metricsResponse.data.overall_score}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testExtension();

