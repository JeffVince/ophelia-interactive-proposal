import axios from 'axios';
import { ref, reactive, watch } from 'vue';

// Debug logging to help diagnose issues
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[DataService]', ...args);
const error = (...args) => console.error('[DataService]', ...args);

// Central store for project data
const projectData = ref(null);
const loading = ref(true);
const errorState = ref(null);

// Create a reactive event bus for components to communicate
const dataUpdateEvents = reactive({
  listeners: {},
  emit(event, data) {
    log(`Emitting event: ${event}`, data);
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  },
  on(event, callback) {
    log(`Adding listener for: ${event}`);
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  off(event, callback) {
    log(`Removing listener for: ${event}`);
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
});

// Base API URL
const API_URL = '/api';

// Watch for changes to the phases array
watch(() => projectData.value?.phases, (newPhases, oldPhases) => {
  if (newPhases && oldPhases) {
    log('Phases data changed');
    
    // Check for changes in enabled status
    newPhases.forEach((phase) => {
      const oldPhase = oldPhases.find(p => p.name === phase.name);
      if (oldPhase && phase.enabled !== oldPhase.enabled) {
        log(`Phase "${phase.name}" enabled status changed: ${oldPhase.enabled} → ${phase.enabled}`);
        // Notify all listening components about this phase change
        dataUpdateEvents.emit('phase-update', { phaseName: phase.name, enabled: phase.enabled });
      }
    });
  }
}, { deep: true });

const DataService = {
  /**
   * Load all project data
   */
  async loadData() {
    log('Loading data...');
    try {
      loading.value = true;
      errorState.value = null;
      
      try {
        // Fetch data from our API server
        log(`Fetching from: ${API_URL}/data`);
        const response = await axios.get(`${API_URL}/data`);
        log('API response received:', response.status);
        
        if (response.data && response.data.phases) {
          log(`Loaded ${response.data.phases.length} phases from API`);
          
          // Log enabled phases
          const enabledPhases = response.data.phases.filter(p => p.enabled);
          log(`Enabled phases (${enabledPhases.length}):`, 
              enabledPhases.map(p => `${p.name} (#${p.number})`).join(', '));
        }
        
        projectData.value = response.data;
        return projectData.value;
      } catch (apiError) {
        error('API request failed:', apiError.message);
        throw apiError; // Rethrow to fall back to local data
      }
    } catch (err) {
      error('Error loading project data:', err);
      errorState.value = 'Failed to load project data';
      
      // Fallback to local data.json if API is not available
      try {
        log('Falling back to local data.json');
        const response = await import('../data/data.json');
        log('Local data loaded successfully');
        projectData.value = response.default;
        
        // Log loaded phases from local file
        if (projectData.value && projectData.value.phases) {
          log(`Loaded ${projectData.value.phases.length} phases from local file`);
          
          // Log enabled phases
          const enabledPhases = projectData.value.phases.filter(p => p.enabled);
          log(`Enabled phases (${enabledPhases.length}):`, 
              enabledPhases.map(p => `${p.name} (#${p.number})`).join(', '));
        }
        
        return projectData.value;
      } catch (fallbackErr) {
        error('Fallback data load failed:', fallbackErr);
        throw err;
      }
    } finally {
      loading.value = false;
    }
  },
  
  /**
   * Get cached project data or load if not available
   */
  async getData() {
    if (!projectData.value) {
      log('No cached data, loading fresh data');
      return await this.loadData();
    }
    
    log('Returning cached data');
    if (projectData.value.phases) {
      log(`Cached phases: ${projectData.value.phases.length}`);
      
      // Log enabled phases from cache
      const enabledPhases = projectData.value.phases.filter(p => p.enabled);
      log(`Enabled phases in cache (${enabledPhases.length}):`, 
          enabledPhases.map(p => `${p.name} (#${p.number})`).join(', '));
    }
    
    return projectData.value;
  },
  
  /**
   * Update a phase's enabled status
   */
  async updatePhaseEnabled(phaseName, enabled) {
    log(`Updating phase "${phaseName}" enabled status to:`, enabled);
    try {
      if (!projectData.value) {
        log('No data loaded, loading first');
        await this.loadData();
      }
      
      // Local update first for immediate UI response
      const phase = projectData.value.phases.find(p => p.name === phaseName);
      if (phase) {
        log(`Found phase locally: ${phase.name} (#${phase.number})`);
        log(`Current enabled status: ${phase.enabled}`);
        
        // Store original state for rollback if needed
        const originalEnabled = phase.enabled;
        
        // Update locally
        phase.enabled = enabled;
        log(`Updated local enabled status to: ${phase.enabled}`);
        
        // Explicitly notify all components listening for this change
        dataUpdateEvents.emit('phase-update', { phaseName, enabled });
        
        // Server update
        log(`Sending update to API: ${API_URL}/phases/${phaseName}/toggle`);
        try {
          const response = await axios.put(`${API_URL}/phases/${phaseName}/toggle`, { enabled });
          
          log('Server response:', response.status);
          if (response.data.success) {
            log('Server update successful');
            return response.data;
          } else {
            error('Server update failed:', response.data.error);
            // If server update failed, revert local change
            phase.enabled = originalEnabled;
            dataUpdateEvents.emit('phase-update', { phaseName, enabled: originalEnabled });
            return { success: false, error: response.data.error || 'Unknown server error' };
          }
        } catch (apiError) {
          error('API request failed:', apiError.message);
          
          // For development, we'll keep the local change even if API fails
          log('Keeping local change despite API failure (development mode)');
          
          // In production, you might want to uncomment this to revert on API failure:
          // phase.enabled = originalEnabled;
          // dataUpdateEvents.emit('phase-update', { phaseName, enabled: originalEnabled });
          
          return { success: true, message: 'Local update only - API unavailable' };
        }
      } else {
        error(`Phase "${phaseName}" not found in local data`);
        log('Available phases:', projectData.value.phases.map(p => p.name).join(', '));
        return { success: false, error: `Phase "${phaseName}" not found` };
      }
    } catch (err) {
      error(`Error updating phase "${phaseName}":`, err);
      errorState.value = `Failed to update phase "${phaseName}"`;
      throw err;
    }
  },
  
  /**
   * List all phases with their enabled status
   */
  getPhases() {
    if (!projectData.value || !projectData.value.phases) {
      return [];
    }
    
    return projectData.value.phases.map(p => ({
      number: p.number,
      name: p.name,
      displayName: p.displayName || p.name,
      enabled: p.enabled
    }));
  },
  
  /**
   * Get enabled phases only
   */
  getEnabledPhases() {
    if (!projectData.value || !projectData.value.phases) {
      return [];
    }
    
    return projectData.value.phases.filter(p => p.enabled);
  },
  
  /**
   * Force refresh data from the server
   */
  async refreshData() {
    log('Forcing data refresh');
    try {
      // Store current enabled states before refresh
      const enabledStates = {};
      if (projectData.value && projectData.value.phases) {
        projectData.value.phases.forEach(phase => {
          enabledStates[phase.name] = phase.enabled;
        });
        log('Stored current enabled states:', enabledStates);
      }
      
      // Clear the cache first
      projectData.value = null;
      
      // Then reload
      const freshData = await this.loadData();
      
      // Verify enabled states after refresh
      if (freshData && freshData.phases) {
        log('Checking enabled states after refresh:');
        freshData.phases.forEach(phase => {
          const oldState = enabledStates[phase.name];
          log(`Phase "${phase.name}" (#${phase.number}): previous=${oldState}, current=${phase.enabled}`);
          
          // If state changed unexpectedly, force emit the update
          if (oldState !== undefined && oldState !== phase.enabled) {
            log(`Phase "${phase.name}" enabled state changed during refresh: ${oldState} → ${phase.enabled}`);
            dataUpdateEvents.emit('phase-update', { phaseName: phase.name, enabled: phase.enabled });
          }
        });
      }
      
      // Notify all components of refresh
      log('Broadcasting data-refresh event');
      dataUpdateEvents.emit('data-refresh', { timestamp: new Date().toISOString() });
      
      return freshData;
    } catch (err) {
      error('Failed to refresh data:', err);
      throw err;
    }
  },
  
  /**
   * Subscribe to data update events
   */
  onUpdate(event, callback) {
    dataUpdateEvents.on(event, callback);
  },
  
  /**
   * Unsubscribe from data update events
   */
  offUpdate(event, callback) {
    dataUpdateEvents.off(event, callback);
  },
  
  // Getter for loading state
  isLoading() {
    return loading.value;
  },
  
  // Getter for error state
  getError() {
    return errorState.value;
  },
  
  // Debug function to log current state
  debug() {
    console.log('===== DataService Debug =====');
    console.log('Loading:', loading.value);
    console.log('Error:', errorState.value);
    console.log('Data loaded:', !!projectData.value);
    
    if (projectData.value && projectData.value.phases) {
      console.log('All phases:');
      projectData.value.phases.forEach(p => {
        console.log(`- ${p.name} (#${p.number}): enabled=${p.enabled}`);
      });
      
      console.log('\nEnabled phases:');
      const enabled = projectData.value.phases.filter(p => p.enabled);
      if (enabled.length === 0) {
        console.log('(none)');
      } else {
        enabled.forEach(p => {
          console.log(`- ${p.name} (#${p.number})`);
        });
      }
    }
    
    console.log('Event listeners:', Object.keys(dataUpdateEvents.listeners));
    console.log('===========================');
  }
};

// Initialize data on service creation
DataService.loadData()
  .then(() => {
    log('Initial data load successful');
    DataService.debug();
  })
  .catch(err => {
    error('Initial data load failed:', err.message);
  });

export default DataService; 