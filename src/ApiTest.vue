<template>
  <div class="api-test">
    <h2>API Connection Test</h2>
    
    <div class="status">
      <div class="status-item">
        <span class="label">API Status:</span>
        <span :class="['value', apiStatus]">{{ apiStatusText }}</span>
      </div>
      <div class="status-item">
        <span class="label">Data Loaded:</span>
        <span :class="['value', dataStatus]">{{ dataLoaded ? 'Yes' : 'No' }}</span>
      </div>
      <div class="status-item">
        <span class="label">Phases Count:</span>
        <span class="value">{{ phasesCount }}</span>
      </div>
    </div>
    
    <div class="actions">
      <button @click="testAPI" :disabled="loading">Test API Connection</button>
      <button @click="loadData" :disabled="loading">Load Data</button>
      <button @click="checkDataService">Check DataService State</button>
    </div>
    
    <div v-if="loading" class="loading">Loading...</div>
    
    <div v-if="error" class="error">
      <h3>Error:</h3>
      <pre>{{ error }}</pre>
    </div>
    
    <div v-if="data && data.phases" class="data-preview">
      <h3>Phases:</h3>
      <div v-for="phase in data.phases" :key="phase.number" class="phase-item">
        <span class="phase-number">{{ phase.number }}</span>
        <span class="phase-name">{{ phase.name }}</span>
        <span :class="['phase-enabled', phase.enabled ? 'enabled' : 'disabled']">
          {{ phase.enabled ? 'Enabled' : 'Disabled' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataService from './services/DataService';

export default {
  name: 'ApiTest',
  setup() {
    const loading = ref(false);
    const error = ref(null);
    const data = ref(null);
    const apiStatus = ref('unknown');
    const apiStatusText = ref('Unknown');
    const dataLoaded = ref(false);
    const phasesCount = ref(0);
    const dataStatus = ref('unknown');
    
    onMounted(() => {
      testAPI();
    });
    
    const testAPI = async () => {
      loading.value = true;
      error.value = null;
      apiStatus.value = 'loading';
      apiStatusText.value = 'Checking...';
      
      try {
        console.log('Testing API connection...');
        const response = await axios.get('/api/data');
        console.log('API response:', response);
        
        apiStatus.value = 'success';
        apiStatusText.value = 'Connected';
        
        // Check response data
        if (response.data && response.data.phases) {
          dataLoaded.value = true;
          phasesCount.value = response.data.phases.length;
          data.value = response.data;
          dataStatus.value = 'success';
        } else {
          dataLoaded.value = false;
          phasesCount.value = 0;
          dataStatus.value = 'error';
          error.value = 'API response missing phases data';
        }
      } catch (err) {
        console.error('API connection test failed:', err);
        
        apiStatus.value = 'error';
        apiStatusText.value = 'Failed';
        dataStatus.value = 'error';
        
        // Detailed error information
        if (err.response) {
          error.value = `Status: ${err.response.status}\nMessage: ${err.message}\nData: ${JSON.stringify(err.response.data, null, 2)}`;
        } else if (err.request) {
          error.value = `No response received\nMessage: ${err.message}`;
        } else {
          error.value = `Error: ${err.message}`;
        }
      } finally {
        loading.value = false;
      }
    };
    
    const loadData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        console.log('Loading data through DataService...');
        const result = await DataService.refreshData();
        console.log('DataService result:', result);
        
        if (result && result.phases) {
          dataLoaded.value = true;
          phasesCount.value = result.phases.length;
          data.value = result;
          dataStatus.value = 'success';
        } else {
          dataLoaded.value = false;
          phasesCount.value = 0;
          dataStatus.value = 'error';
          error.value = 'DataService returned invalid data';
        }
      } catch (err) {
        console.error('DataService load failed:', err);
        dataStatus.value = 'error';
        error.value = err.message || 'Unknown error';
      } finally {
        loading.value = false;
      }
    };
    
    const checkDataService = () => {
      console.log('Checking DataService state...');
      DataService.debug();
    };
    
    return {
      loading,
      error,
      data,
      apiStatus,
      apiStatusText,
      dataLoaded,
      phasesCount,
      dataStatus,
      testAPI,
      loadData,
      checkDataService
    };
  }
}
</script>

<style scoped>
.api-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1c1c1c;
  border-radius: 8px;
}

h2 {
  color: #fff;
  margin-top: 0;
}

.status {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.status-item {
  padding: 10px;
  background: #252525;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  color: #ccccc2;
  font-size: 0.9rem;
}

.value {
  font-weight: bold;
  color: #fff;
}

.success {
  color: #4caf50;
}

.error {
  color: #f44336;
}

.loading {
  color: #2196f3;
}

.unknown {
  color: #9e9e9e;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 15px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #444;
}

button:disabled {
  background: #2a2a2a;
  color: #666;
  cursor: not-allowed;
}

.loading {
  padding: 10px;
  margin: 10px 0;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
}

.error {
  padding: 10px;
  margin: 10px 0;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
}

.error pre {
  margin: 10px 0 0;
  padding: 10px;
  background: #1e1e1e;
  border-radius: 4px;
  overflow: auto;
}

.data-preview {
  margin-top: 20px;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px;
}

.phase-item {
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #333;
}

.phase-item:last-child {
  border-bottom: none;
}

.phase-number {
  background: #333;
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.phase-name {
  flex: 1;
  color: #fff;
}

.phase-enabled {
  padding: 3px 8px;
  border-radius: 30px;
  font-size: 0.8rem;
}

.enabled {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.disabled {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}
</style> 