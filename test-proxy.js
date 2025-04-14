import axios from 'axios';

console.log('Starting proxy test...');

// Test Vite proxy access
const testProxy = async () => {
  try {
    // Vite server usually runs on port 5173
    console.log('Attempting to call API through Vite proxy...');
    const response = await axios.get('http://localhost:5173/api/data');
    console.log('Proxy response status:', response.status);
    console.log('Phases count:', response.data.phases?.length || 0);
    
    if (response.data.phases && response.data.phases.length > 0) {
      console.log('First phase info:');
      console.log(`- Name: ${response.data.phases[0].name}`);
      console.log(`- Enabled: ${response.data.phases[0].enabled}`);
    } else {
      console.error('No phases found in proxy response');
    }
  } catch (error) {
    console.error('Proxy call failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
  }
};

// Run the test
testProxy(); 