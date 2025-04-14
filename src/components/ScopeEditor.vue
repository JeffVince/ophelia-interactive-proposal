<template>
  <div class="scope-editor">
    <div class="left-panel">
      <div class="phase-toggles">
        <h4>Project Scope</h4>
        
        <!-- Required Phases -->
        <div class="required-phases">
          <div v-for="phase in getRequiredPhases()" :key="phase.name" class="phase">
            <div class="phase-toggle-header" @click="togglePhase(phase.name)">
              <div class="toggle-icon">{{ expandedPhases[phase.name] ? '−' : '+' }}</div>
              <div class="toggle-label">{{ getPhaseDisplayName(phase.name) }}</div>
            </div>
            <div v-if="expandedPhases[phase.name]" class="deliverable-toggles">
              <div v-for="deliverable in getAllPhaseDeliverables(phase.name)" :key="deliverable" class="deliverable-item-simple">
                {{ getDeliverableWithEmoji(deliverable) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Divider -->
        <div v-if="getOptionalPhases().length > 0" class="phases-divider">
          <div class="divider-line"></div>
          <div class="optional-toggle" @click="toggleOptionalPhasesVisibility">
            Optional Services {{ showOptionalPhases ? '▾' : '▸' }}
          </div>
          <div class="divider-line"></div>
        </div>
        
        <!-- Optional Phases -->
        <div v-if="showOptionalPhases" class="optional-phases">
          <div v-for="phase in getOptionalPhases()" :key="phase.name" class="phase">
            <div class="phase-toggle-header">
              <div class="toggle-checkbox">
                <input type="checkbox" :id="'phase-' + phase.name" :checked="phaseEnabled[phase.name]" @change="togglePhaseEnabled(phase.name)">
                <label :for="'phase-' + phase.name"></label>
              </div>
              <div class="toggle-icon" @click="togglePhase(phase.name)">{{ expandedPhases[phase.name] ? '−' : '+' }}</div>
              <div class="toggle-label" @click="togglePhase(phase.name)">{{ getPhaseDisplayName(phase.name) }}</div>
            </div>
            <div v-if="expandedPhases[phase.name]" class="deliverable-toggles">
              <div v-for="deliverable in getAllPhaseDeliverables(phase.name)" :key="deliverable" class="deliverable-item-simple">
                {{ getDeliverableWithEmoji(deliverable) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <!-- Show details for all expanded phases, stacked vertically -->
      <div v-for="phase in process" :key="`details-${phase.name}`" v-show="expandedPhases[phase.name]" class="phase-details">
        <div class="phase-header">
          <h3>{{ getPhaseDisplayName(phase.name) }}</h3>
          <div class="phase-summary">
            <div class="summary-row">
              <div class="summary-item dates-column">
                <div class="date-item">
                  <span class="summary-label">Start Date</span>
                  <span class="summary-value">{{ formatDate(getFirstRoundStartDate(phase)) }}</span>
                </div>
                <div class="date-item">
                  <span class="summary-label">Delivery Date</span>
                  <span class="summary-value">{{ formatDate(getLastRoundEndDate(phase)) }}</span>
                </div>
                <div class="date-item">
                  <span class="summary-label">Duration</span>
                  <span class="summary-value">{{ calculatePhaseDuration(phase) }} days</span>
                </div>
              </div>
              
              <div class="summary-item deliverables-column">
                <span class="deliverables-label">Deliverables</span>
                <div class="deliverables-list">
                  <div v-for="deliverable in getEnabledDeliverables(phase.name)" :key="deliverable" class="deliverable-item">
                    {{ getDeliverableWithEmoji(deliverable) }}
                  </div>
                </div>
              </div>
              
              <div class="summary-item sample-deliverable-column">
                <span class="sample-deliverable-label">Sample Deliverable</span>
                <div class="sample-deliverable-content">
                  <iframe 
                    v-if="phase.name === 'EP Brand Book'"
                    src="https://docs.google.com/presentation/d/e/2PACX-1vQAntZF8MYZcfIboGSM5iHhHmyCZc0eN7Pyh3TYxg1zhJBClGpbAOIIwtAq1IyYBiyzkkvsg6CwtCK-/embed?start=false&loop=false&delayms=3000" 
                    frameborder="0" 
                    width="100%" 
                    height="240" 
                    allowfullscreen="true" 
                    mozallowfullscreen="true" 
                    webkitallowfullscreen="true"
                  ></iframe>
                  <iframe 
                    v-else
                    src="https://docs.google.com/presentation/d/e/2PACX-1vTtgRdIkyvUSJjZozWL1Wrwiebx9k8-_GWHGmsCsk3t3P9HyOVmtCxYOEjljAhI7epM4H0SU5_zR0jv/embed?start=false&loop=false&delayms=3000" 
                    frameborder="0" 
                    width="100%" 
                    height="240" 
                    allowfullscreen="true" 
                    mozallowfullscreen="true" 
                    webkitallowfullscreen="true"
                  ></iframe>
                </div>
              </div>
            </div>
            
            <div class="summary-row stakeholders-team-row">
              <div class="summary-item stakeholders-column">
                <span class="summary-label">Stakeholders</span>
                <div class="stakeholders">
                  <span v-for="stakeholder in phase.stakeholders" :key="stakeholder" class="stakeholder">
                    {{ stakeholder }}
                  </span>
                </div>
                <div class="meetings-info">
                  <span class="meetings-label">Stakeholder Meetings</span>
                  <div class="meetings-badge">
                    <span class="meetings-value">{{ countPhaseMeetings(phase) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="summary-item team-column">
                <span class="summary-label">Team Members</span>
                <div class="stakeholders">
                  <span v-for="member in getUniqueTeamMembers(phase)" :key="member" class="stakeholder">
                    {{ member }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="phase-content">
          <div class="rounds">
            <div v-for="(round, roundKey) in phase.rounds" :key="roundKey" class="round">
              <div class="round-header" @click="toggleRound(roundKey)">
                <div class="round-toggle">{{ expandedRounds[roundKey] ? '−' : '+' }}</div>
                <h4>{{ getRoundName(roundKey) }}</h4>
                <div class="round-duration">{{ getRoundDurationDisplay(round.duration_days) }}</div>
              </div>
              
              <div v-if="expandedRounds[roundKey]" class="round-content">
                <div class="round-details">
                  <div class="round-section">
                    <h5>Tasks</h5>
                    <ul class="deliverable-list">
                      <li v-for="(task, i) in round.tasks" :key="i">
                        {{ task }}
                      </li>
                    </ul>
                  </div>
                  
                  <div class="round-section">
                    <h5>Deliverables</h5>
                    <ul class="deliverable-list">
                      <li v-for="(deliverable, i) in round.deliverables" :key="i">
                        {{ deliverable }}
                      </li>
                    </ul>
                  </div>
                  
                  <div v-if="getRoundMeetings(round).length > 0" class="round-section">
                    <h5>Stakeholder Meetings</h5>
                    <div v-for="(meeting, i) in getRoundMeetings(round)" :key="i" class="stakeholder-review">
                      <div class="review-date">{{ formatDate(meeting.date) }} - {{ meeting.type }}</div>
                      <div v-if="meeting.description" class="review-description">{{ meeting.description }}</div>
                      <div class="stakeholders">
                        <span v-for="stakeholder in meeting.stakeholders" :key="stakeholder" class="stakeholder">
                          {{ stakeholder }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="round-section">
                    <h5 class="section-heading" @click="openDeliverableModal(roundKey)">
                      See Sample {{ roundKey }} Here
                    </h5>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Show placeholder when no phases are expanded -->
      <div v-if="!hasExpandedPhases" class="no-phase-selected">
        <div class="placeholder-message">
          <div class="placeholder-icon">+</div>
          <p>Select a phase from the left panel to view details</p>
        </div>
      </div>
    </div>
    
    <!-- Modal for deliverables -->
    <div v-if="modalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <iframe 
            :src="getRoundIframeSrc(currentRoundKey)" 
            frameborder="0" 
            width="100%" 
            height="500" 
            allowfullscreen="true" 
            mozallowfullscreen="true" 
            webkitallowfullscreen="true"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted, watch, onBeforeUnmount } from 'vue'
import DataService from '../services/DataService'

export default {
  name: 'ScopeEditor',
  emits: ['cost-updated'],
  setup(props, { emit }) {
    const process = ref([])
    const expandedRounds = reactive({})
    const phaseEnabled = reactive({})
    const deliverableEnabled = reactive({})
    const costData = ref({
      baseCost: 50000,
      additionalCost: 25000,
      total: 75000,
      totalDeliverables: 15
    })
    
    // Map phase names for display
    const phaseNameMap = {
      'Brand Foundation': 'Brand Book',
      'Brand Extensions': 'Brand Activations',
      'EP Brand Book': 'EP Brand Book',
      'Music Video & Press Concepts': 'EP Brand Activations'
    }
    
    // Initialize expanded phases state
    const expandedPhases = reactive({})
    
    // Computed property to check if any phases are expanded
    const hasExpandedPhases = computed(() => {
      return Object.values(expandedPhases).some(isExpanded => isExpanded)
    })
    
    // Modal state
    const modalOpen = ref(false)
    const modalTitle = ref('')
    
    // Add a ref to track the current round key
    const currentRoundKey = ref('')
    
    // Add a ref to track the visibility of optional phases
    const showOptionalPhases = ref(false)
    
    // Define required phases and optional phases
    const requiredPhaseNames = [
      'Brand Foundation',
      'Brand Extensions',
      'EP Brand Book',
      'Music Video & Press Concepts'
    ]
    
    // Map iframe sources for each round
    const roundIframeSrcMap = {
      'R1': 'https://docs.google.com/presentation/d/e/2PACX-1vSK0uTTSHeOpCGYjEtilu9CkLckLEeBN_3NkTBHknb1bZ-JlAIsEs2Rn6NEez1l3viDbXL_0TQmBiWR/embed?start=false&loop=false&delayms=3000',
      'R2': 'https://docs.google.com/presentation/d/e/2PACX-1vSpd7OawXhDm6f4vo5mkv-RTZ_-gk3aqqM3KDU_WfRS7pHkapkGFF8tK30dOzqwOP5XKnUoW59PH-gV/embed?start=false&loop=false&delayms=3000',
      'R3': 'https://docs.google.com/presentation/d/e/2PACX-1vT3o4j2wilmouAU7KMOW8hhnQ3AvRX7D_1kfG9_WpdMJC5cb2z1SiPuvB5lejPBv5vzNKRB0Eefem0Z/embed?start=false&loop=false&delayms=3000',
      'R4': 'https://docs.google.com/presentation/d/e/2PACX-1vQnkkcIy6s3amZvT8BTqf0rGjdY4dp17PXtSwtRXFVDC2dMETaiQsVUblM8aK6xi2CsSFFcNK7Nod_e/embed?start=false&loop=false&delayms=3000'
    }
    
    onMounted(async () => {
      try {
        console.log("[ScopeEditor] Loading data from DataService...");
        // Load data from the API through DataService
        const data = await DataService.getData();
        console.log("[ScopeEditor] Data loaded successfully:", data);
        console.log("[ScopeEditor] Phases count:", data.phases?.length || 0);
        
        if (!data.phases || data.phases.length === 0) {
          console.error("[ScopeEditor] No phases found in loaded data!");
          return;
        }

        process.value = data.phases || [];
        console.log("[ScopeEditor] process.value set with phases:", process.value.length);
        
        // Initialize phase toggles
        process.value.forEach(phase => {
          console.log(`[ScopeEditor] Initializing phase: ${phase.name}, enabled: ${phase.enabled}`);
          // Use the enabled property from the data file
          phaseEnabled[phase.name] = phase.enabled;
          deliverableEnabled[phase.name] = {};
          
          // Enable all deliverables by default
          if (Array.isArray(phase.core_deliverables)) {
            // Handle array format
            phase.core_deliverables.forEach(deliverable => {
              deliverableEnabled[phase.name][deliverable] = true;
            });
          } else {
            // Handle object format - enable all deliverables
            if (phase.core_deliverables?.default_enabled) {
              phase.core_deliverables.default_enabled.forEach(deliverable => {
                deliverableEnabled[phase.name][deliverable] = true;
              });
            }
            if (phase.core_deliverables?.default_disabled) {
              phase.core_deliverables.default_disabled.forEach(deliverable => {
                deliverableEnabled[phase.name][deliverable] = true;
              });
            }
          }
        });
        
        // Initialize expanded rounds
        process.value.forEach(phase => {
          if (phase.rounds) {
            Object.keys(phase.rounds).forEach(round => {
              expandedRounds[round] = false;
            });
          }
        });
        
        // Initialize all phases as collapsed
        process.value.forEach(phase => {
          expandedPhases[phase.name] = false;
        });
        
        // Initial cost calculation
        updateCost();
        console.log("[ScopeEditor] Component initialization complete");
      } catch (error) {
        console.error('[ScopeEditor] Failed to load phases data:', error);
      }
      
      // Subscribe to phase update events from other components
      DataService.onUpdate('phase-update', handlePhaseUpdate);
    })
    
    // Clean up event listeners when component is unmounted
    onBeforeUnmount(() => {
      DataService.offUpdate('phase-update', handlePhaseUpdate);
    });
    
    // Handle phase updates from other components
    const handlePhaseUpdate = ({ phaseName, enabled }) => {
      if (phaseName in phaseEnabled && phaseEnabled[phaseName] !== enabled) {
        phaseEnabled[phaseName] = enabled;
      }
    };
    
    // Watch for changes to phaseEnabled and update via API
    watch(phaseEnabled, async (newValues, oldValues) => {
      console.log('[ScopeEditor] phaseEnabled changed:', newValues);
      for (const phaseName in newValues) {
        // Only make API call if value actually changed
        if (oldValues[phaseName] !== newValues[phaseName]) {
          console.log(`[ScopeEditor] Toggling phase '${phaseName}' to ${newValues[phaseName]}`);
          try {
            // Update phase enabled status via API and update local data
            await DataService.updatePhaseEnabled(phaseName, newValues[phaseName]);
            console.log(`[ScopeEditor] Phase '${phaseName}' toggled successfully`);
            
            // Update the state in the process.value array to keep UI in sync
            const phaseToUpdate = process.value.find(p => p.name === phaseName);
            if (phaseToUpdate) {
              phaseToUpdate.enabled = newValues[phaseName];
            }
            
            // Force a refresh on the data to ensure it's reflected in data.json
            await DataService.refreshData();
          } catch (error) {
            console.error(`[ScopeEditor] Failed to update phase '${phaseName}':`, error);
            // Revert the local state if API call failed
            phaseEnabled[phaseName] = oldValues[phaseName] || false;
          }
        }
      }
      
      // Recalculate cost when phases are enabled/disabled
      updateCost();
      
      // Emit cost update to parent component
      emit('cost-updated', costData.value);
    }, { deep: true });
    
    // Add a direct method to toggle phase enabled status
    const togglePhaseEnabled = async (phaseName) => {
      console.log(`[ScopeEditor] Directly toggling phase '${phaseName}' enabled status`);
      const currentEnabled = phaseEnabled[phaseName];
      const newEnabled = !currentEnabled;
      
      try {
        // Update the local reactive state first
        phaseEnabled[phaseName] = newEnabled;
        console.log(`[ScopeEditor] Local state for '${phaseName}' set to ${newEnabled}`);
        
        // Update the state in the process.value array to keep UI in sync
        const phaseToUpdate = process.value.find(p => p.name === phaseName);
        if (phaseToUpdate) {
          console.log(`[ScopeEditor] Found phase in process array: '${phaseToUpdate.name}' (#${phaseToUpdate.number})`);
          phaseToUpdate.enabled = newEnabled;
          console.log(`[ScopeEditor] Updated process array phase.enabled to ${newEnabled}`);
        } else {
          console.error(`[ScopeEditor] Could not find phase '${phaseName}' in process array`);
        }
        
        // Update via DataService
        await DataService.updatePhaseEnabled(phaseName, newEnabled);
        console.log(`[ScopeEditor] Successfully toggled phase '${phaseName}' via DataService`);
        
        // Force a refresh on the data to ensure it's reflected in data.json and other components
        await DataService.refreshData();
        console.log(`[ScopeEditor] Refreshed data to ensure consistency`);
        
        // Update cost
        updateCost();
      } catch (error) {
        console.error(`[ScopeEditor] Failed to toggle phase '${phaseName}':`, error);
        // Revert on failure
        phaseEnabled[phaseName] = currentEnabled;
        
        // Update the phase in process array back to original state
        const phaseToUpdate = process.value.find(p => p.name === phaseName);
        if (phaseToUpdate) {
          phaseToUpdate.enabled = currentEnabled;
        }
      }
    };
    
    const filteredPhases = computed(() => {
      return process.value.filter(phase => phaseEnabled[phase.name]);
    });
    
    const getPhaseDisplayName = (phase) => {
      // First check if the phase has a displayName property in the data
      const phaseData = process.value.find(p => p.name === phase)
      if (phaseData && phaseData.displayName) {
        return phaseData.displayName
      }
      // Fall back to the map if displayName not found directly in the data
      return phaseNameMap[phase] || phase
    }
    
    const getPhaseNumber = (phase) => {
      return `Phase ${phase.number}`
    }
    
    const getRoundName = (round) => {
      // Look for the round name in all phases
      for (const phase of process.value) {
        if (phase.rounds && phase.rounds[round] && phase.rounds[round].name) {
          return phase.rounds[round].name
        }
      }
      // If no name is found, just return the round key
      return round
    }
    
    const formatCurrency = (value) => {
      return value.toLocaleString('en-US')
    }
    
    const formatDate = (dateString) => {
      // Create a date forcing it to be interpreted as UTC
      const date = new Date(dateString)
      
      // Use toLocaleDateString with explicit options
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Force UTC timezone to avoid date shifting
      })
    }
    
    const toggleRound = (round) => {
      expandedRounds[round] = !expandedRounds[round]
    }
    
    const getAllPhaseDeliverables = (phase) => {
      const phaseData = process.value.find(p => p.name === phase)
      if (!phaseData) return []
      
      if (Array.isArray(phaseData.core_deliverables)) {
        return phaseData.core_deliverables
      }
      
      if (phaseData.core_deliverables) {
        const allDeliverables = []
        if (phaseData.core_deliverables.default_enabled) {
          allDeliverables.push(...phaseData.core_deliverables.default_enabled)
        }
        if (phaseData.core_deliverables.default_disabled) {
          allDeliverables.push(...phaseData.core_deliverables.default_disabled)
        }
        return allDeliverables
      }
      return []
    }
    
    const getFilteredRoundDeliverables = (phase, round) => {
      const phaseData = process.value.find(p => p.name === phase)
      if (!phaseData || !phaseEnabled[phase] || !phaseData.rounds[round]) return []
      
      // Return the actual deliverables array from the round data
      return phaseData.rounds[round].deliverables || []
    }
    
    const getRoundTeam = (round, phaseName) => {
      const phaseData = process.value.find(p => p.name === phaseName)
      if (!phaseData || !phaseData.rounds[round]) return []
      
      return phaseData.rounds[round].team
    }
    
    const hasStakeholderMeetings = (round) => {
      return round.events && Array.isArray(round.events) && 
        round.events.some(event => 
          (event.type === 'review' || event.type === 'check_in') && 
          event.stakeholders && 
          event.stakeholders.length > 0
        )
    }
    
    const getStakeholderReviews = (round, phaseName) => {
      const phaseData = process.value.find(p => p.name === phaseName)
      if (!phaseData) return []
      
      return [{
        date: new Date(),
        stakeholders: phaseData.stakeholders,
        deliverables: getFilteredRoundDeliverables(phaseName, round)
      }]
    }
    
    const updateCost = () => {
      let totalCost = 0
      
      process.value.forEach(phase => {
        if (phaseEnabled[phase.name]) {
          Object.values(phase.rounds).forEach(round => {
            // Calculate cost for each team member for this round
            round.team.forEach(member => {
              totalCost += member.day_rate * round.duration_days
            })
          })
        }
      })
      
      costData.value.total = totalCost
    }
    
    const togglePhase = (phase) => {
      expandedPhases[phase] = !expandedPhases[phase]
    }
    
    const getDeliverableWithEmoji = (deliverable) => {
      // Use more specific and relevant emojis for each deliverable type
      if (deliverable.includes('Band Name') || deliverable.includes('Overall Concept')) {
        return `🎵 ${deliverable}`
      } else if (deliverable.includes('Wordmark')) {
        return `✏️ ${deliverable}`
      } else if (deliverable.includes('Icon')) {
        return `🔍 ${deliverable}`
      } else if (deliverable.includes('Type') || deliverable.includes('Typography')) {
        return `🔤 ${deliverable}`
      } else if (deliverable.includes('Pantone') || deliverable.includes('Color')) {
        return `🎨 ${deliverable}`
      } else if (deliverable.includes('Sticker') || deliverable.includes('Bug')) {
        return `🏷️ ${deliverable}`
      } else if (deliverable.includes('Video')) {
        return `🎥 ${deliverable}`
      } else if (deliverable.includes('Merch')) {
        return `👕 ${deliverable}`
      } else if (deliverable.includes('Press')) {
        return `📸 ${deliverable}`
      } else if (deliverable.includes('Social')) {
        return `📱 ${deliverable}`
      } else if (deliverable.includes('Motion')) {
        return `🎬 ${deliverable}`
      } else if (deliverable.includes('Print')) {
        return `🖨️ ${deliverable}`
      } else if (deliverable.includes('Digital')) {
        return `💻 ${deliverable}`
      } else if (deliverable.includes('Animated')) {
        return `✨ ${deliverable}`
      } else {
        return `📋 ${deliverable}` // default emoji
      }
    }
    
    const getUniqueTeamMembers = (phase) => {
      const teamMembers = new Set()
      
      Object.values(phase.rounds).forEach(round => {
        if (round.team && Array.isArray(round.team)) {
          round.team.forEach(member => {
            teamMembers.add(member.role || member)
          })
        }
      })
      
      return Array.from(teamMembers)
    }
    
    const getFirstRoundStartDate = (phase) => {
      let earliestDate = null
      
      Object.values(phase.rounds).forEach(round => {
        if (round.start_date) {
          const roundDate = new Date(round.start_date)
          if (!earliestDate || roundDate < earliestDate) {
            earliestDate = roundDate
          }
        }
      })
      
      return earliestDate || new Date()
    }

    const getLastRoundEndDate = (phase) => {
      let latestDate = null
      
      Object.values(phase.rounds).forEach(round => {
        if (round.start_date) {
          // Calculate end date by adding duration to start date
          const startDate = new Date(round.start_date)
          const endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + round.duration_days)
          
          if (!latestDate || endDate > latestDate) {
            latestDate = endDate
          }
        }
      })
      
      return latestDate || new Date()
    }

    const getEnabledDeliverables = (phaseName) => {
      const phaseData = process.value.find(p => p.name === phaseName)
      if (!phaseData || !deliverableEnabled[phaseName]) return []
      
      return Object.keys(deliverableEnabled[phaseName])
        .filter(key => deliverableEnabled[phaseName][key])
    }
    
    const calculatePhaseDuration = (phase) => {
      const totalDays = Object.values(phase.rounds).reduce((sum, round) => sum + round.duration_days, 0)
      return totalDays
    }

    const getRoundDurationDisplay = (durationDays) => {
      // Convert duration days to a more human-readable format
      if (durationDays >= 5) {
        return `${Math.floor(durationDays / 5)} Week${durationDays >= 10 ? 's' : ''}`
      } else {
        return `${durationDays} Day${durationDays !== 1 ? 's' : ''}`
      }
    }
    
    const countPhaseMeetings = (phase) => {
      let meetingCount = 0
      
      // Count all events with type 'review' or 'check_in'
      Object.values(phase.rounds).forEach(round => {
        if (round.events && Array.isArray(round.events)) {
          meetingCount += round.events.filter(event => 
            event.type === 'review' || event.type === 'check_in'
          ).length
        }
      })
      
      return meetingCount
    }
    
    const getRoundMeetings = (round) => {
      if (!round.events || !Array.isArray(round.events)) {
        return []
      }
      
      return round.events.filter(event => 
        event.type === 'review' || event.type === 'check_in'
      ).map(event => ({
        date: event.date,
        type: event.type === 'review' ? 'Review' : 'Check-In',
        description: event.description || '',
        stakeholders: event.stakeholders || []
      }))
    }
    
    const openDeliverableModal = (roundKey) => {
      const roundName = getRoundName(roundKey)
      modalTitle.value = `Example: ${roundName}`
      modalOpen.value = true
      
      // Store the current round key for use in template
      currentRoundKey.value = roundKey
      
      document.body.style.overflow = 'hidden' // Prevent scrolling while modal is open
    }
    
    const closeModal = () => {
      modalOpen.value = false
      document.body.style.overflow = '' // Restore scrolling
    }
    
    // Get optional phases (those not in the required list)
    const getOptionalPhases = () => {
      return process.value.filter(phase => !requiredPhaseNames.includes(phase.name))
    }
    
    // Get required phases
    const getRequiredPhases = () => {
      return process.value.filter(phase => requiredPhaseNames.includes(phase.name))
    }
    
    // Toggle the visibility of optional phases
    const toggleOptionalPhasesVisibility = () => {
      showOptionalPhases.value = !showOptionalPhases.value
    }
    
    // Function to get the iframe source based on round key
    const getRoundIframeSrc = (roundKey) => {
      return roundIframeSrcMap[roundKey] || 'https://www.google.com'
    }
    
    return {
      process,
      processPhases: process,
      filteredPhases,
      expandedRounds,
      phaseEnabled,
      deliverableEnabled,
      costData,
      formatCurrency,
      formatDate,
      getPhaseDisplayName,
      getPhaseNumber,
      getRoundName,
      toggleRound,
      getAllPhaseDeliverables,
      getFilteredRoundDeliverables,
      getRoundTeam,
      hasStakeholderMeetings,
      getStakeholderReviews,
      updateCost,
      expandedPhases,
      togglePhase,
      getDeliverableWithEmoji,
      getFirstRoundStartDate,
      getLastRoundEndDate,
      getEnabledDeliverables,
      calculatePhaseDuration,
      getRoundDurationDisplay,
      countPhaseMeetings,
      getUniqueTeamMembers,
      getRoundMeetings,
      hasExpandedPhases,
      modalOpen,
      modalTitle,
      openDeliverableModal,
      closeModal,
      currentRoundKey,
      getRequiredPhases,
      getOptionalPhases,
      showOptionalPhases,
      toggleOptionalPhasesVisibility,
      getRoundIframeSrc,
      togglePhaseEnabled,
    }
  }
}
</script>

<style scoped>
/* Updated styling to match onyx/ivory theme */
.scope-editor {
  display: flex;
  width: 100%;
  gap: 1.5rem;
  margin-bottom: 2rem;
  margin-top: 2rem;
  padding: 0 1rem;
}

.left-panel {
  width: 450px;
  flex-shrink: 0;
}

.left-panel h4 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.phase-toggles {
  background: #1c1c1c;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(180, 180, 170, 0.2);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  margin-right: 1rem;
}

.phases {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.phase-toggle-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.25s;
}

.phase-toggle-header:hover {
  background: #282828;
}

.toggle-icon {
  width: 22px;
  height: 22px;
  background: #282828;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: #e6e6dc;
  font-weight: bold;
  font-size: 1rem;
}

.toggle-label {
  font-weight: 500;
  color: #f5f5f0;
}

.deliverable-toggles {
  margin-top: 0.75rem;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.deliverable-item-simple {
  padding: 0.4rem 0;
  color: #ccccc2;
}

.phase-details {
  background: #1c1c1c;
  border: 1px solid rgba(180, 180, 170, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  margin-top: 0;
}

.phase-header {
  padding: 1.75rem;
  background: #1c1c1c;
  border-bottom: 1px solid rgba(180, 180, 170, 0.2);
  position: relative;
}

.phase-header::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  width: 2px;
  height: 2px;
  background: #d6d6ce;
  transform: translateX(-50%);
  z-index: 1;
}

.phase-header h3 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.rounds {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
}

.round {
  border: 1px solid rgba(180, 180, 170, 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: #1c1c1c;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
}

.round:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.round-header {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: #1c1c1c;
  cursor: pointer;
  transition: background-color 0.2s;
}

.round-header:hover {
  background: #282828;
}

.round-toggle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282828;
  border-radius: 4px;
  margin-right: 1rem;
  color: #fff;
  font-weight: bold;
}

.round-header h4 {
  flex: 1;
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
  letter-spacing: 0.2px;
}

.round-duration {
  color: #e6e6dc;
  font-size: 0.9rem;
  font-weight: 500;
}

.round-content {
  padding: 1.5rem;
  background: #101010;
  border-top: 1px solid rgba(180, 180, 170, 0.2);
  width: 100%;
  box-sizing: border-box;
}

.round-section {
  margin-bottom: 2rem;
}

.round-section:last-child {
  margin-bottom: 0;
}

.round-section h5 {
  margin: 0 0 1rem;
  color: #e6e6dc;
  font-size: 0.95rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-member {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #1c1c1c;
  border-radius: 6px;
  border: 1px solid rgba(180, 180, 170, 0.2);
}

.member-role {
  font-weight: 500;
  color: #f5f5f0;
}

.member-rate {
  color: #e6e6dc;
  font-size: 0.9rem;
  font-weight: 500;
}

.deliverable-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.deliverable-list li {
  padding: 0.75rem 1rem;
  background: #1c1c1c;
  border-radius: 6px;
  color: #f0f0e6;
  border: 1px solid rgba(180, 180, 170, 0.2);
}

.stakeholder-review {
  padding: 1rem;
  background: #1c1c1c;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(180, 180, 170, 0.2);
}

.stakeholder-review:last-child {
  margin-bottom: 0;
}

.review-date {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #fff;
}

.stakeholders {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stakeholder {
  background: rgba(214, 214, 206, 0.15);
  color: #e6e6dc;
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
}

.phase-summary {
  margin-top: 1.5rem;
  border-top: 1px solid rgba(180, 180, 170, 0.2);
  padding-top: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.stakeholders-team-row {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(180, 180, 170, 0.2);
}

.stakeholders-column, .team-column {
  flex: 1;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dates-column {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex: 1;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: left;
}

.deliverables-column {
  flex: 1;
}

.sample-deliverable-column {
  flex: 1.5;
}

.summary-label {
  font-size: 0.8rem;
  color: #ccccc2;
  font-weight: 500;
}

.summary-value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

.meetings-column {
  align-items: flex-end;
  flex: 1;
}

.meetings-label, .deliverables-label {
  font-size: 0.8rem;
  color: #ccccc2;
  font-weight: 500;
}

.deliverables-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.deliverable-item {
  color: #fff;
  font-size: 0.9rem;
}

.meetings-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282828;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.meetings-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.section-heading {
  color: #e6e6dc;
  cursor: pointer;
  transition: color 0.2s;
  margin-bottom: 1rem;
}

.section-heading:hover {
  color: #fff;
}

.deliverable-link {
  color: #f0f0e6;
  text-decoration: none;
  display: block;
  cursor: pointer;
  transition: color 0.2s;
}

.deliverable-link:hover {
  color: #ffffff;
}

@media (max-width: 1200px) {
  .scope-editor {
    flex-direction: column;
  }
  
  .left-panel {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .phase-navigation {
    flex-wrap: wrap;
  }
  
  .phase-btn {
    flex: 1;
    min-width: 150px;
    text-align: center;
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.phase-navigation::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.phase-navigation {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.stakeholders-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meetings-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(180, 180, 170, 0.1);
}

.meetings-label {
  font-size: 0.8rem;
  color: #ccccc2;
  font-weight: 500;
}

.no-phase-selected {
  background: #1c1c1c;
  border: 1px solid rgba(180, 180, 170, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 300px;
}

.placeholder-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  opacity: 0.6;
}

.placeholder-icon {
  background: #282828;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #d6d6ce;
}

.placeholder-message p {
  color: #d6d6ce;
  font-size: 1.1rem;
}

.phase-details {
  margin-bottom: 2rem;
}

.phase-details:last-child {
  margin-bottom: 0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-container {
  background: #1c1c1c;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(180, 180, 170, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(180, 180, 170, 0.2);
  background: #252525;
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 500;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #d6d6ce;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close-btn:hover {
  background-color: rgba(180, 180, 170, 0.1);
  color: #fff;
}

.modal-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.modal-content iframe {
  flex-grow: 1;
  border: none;
  background: white;
}

@media (max-width: 600px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-content iframe {
    height: 400px;
  }
}

.sample-deliverable-row {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.sample-deliverable-content {
  border: 1px solid rgba(180, 180, 170, 0.2);
  border-radius: 8px;
  overflow: hidden;
  background: #101010;
  height: 100%;
  min-height: 240px;
  display: flex;
}

.sample-deliverable-content iframe {
  flex: 1;
}

.phases-divider {
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(180, 180, 170, 0.2);
}

.optional-toggle {
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #ccccc2;
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  transition: color 0.2s;
}

.optional-toggle:hover {
  color: #fff;
}

.required-phases, .optional-phases {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-checkbox {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
}

.toggle-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-checkbox label {
  position: relative;
  cursor: pointer;
  width: 20px;
  height: 20px;
  background: #1c1c1c;
  border: 1px solid rgba(180, 180, 170, 0.4);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-checkbox input[type="checkbox"]:checked + label:after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border-radius: 2px;
}

.review-description {
  color: #e6e6dc;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}
</style> 