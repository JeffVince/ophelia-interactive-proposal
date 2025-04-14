import axios from 'axios';

console.log('Starting API test...');

// Test direct API access
const testAPI = async () => {
  try {
    console.log('Attempting to call API...');
    const response = await axios.get('http://localhost:3001/api/data');
    console.log('API response status:', response.status);
    console.log('Phases count:', response.data.phases?.length || 0);
    
    if (response.data.phases && response.data.phases.length > 0) {
      console.log('First phase info:');
      console.log(`- Name: ${response.data.phases[0].name}`);
      console.log(`- Enabled: ${response.data.phases[0].enabled}`);
    } else {
      console.error('No phases found in API response');
    }
  } catch (error) {
    console.error('API call failed!');
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
testAPI(); 