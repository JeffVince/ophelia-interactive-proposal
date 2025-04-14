<template>
  <div class="budget-container">
    <div class="budget-header">
      <h3>Project Budget Overview</h3>
    </div>
    
    <div class="budget-summary">
      <!-- Required phases -->
      <div v-for="phase in requiredPhases" :key="phase.number" class="budget-card">
        <div class="budget-card-title">{{ phase.displayName }}</div>
        <div class="budget-card-value">${{ formatCurrency(calculatePhaseCost(phase)) }}</div>
      </div>
      
      <!-- Optional phases that are enabled -->
      <div v-for="phase in enabledOptionalPhases" :key="phase.number" class="budget-card optional">
        <div class="budget-card-title">{{ phase.displayName }} <span class="optional-tag">Optional</span></div>
        <div class="budget-card-value">${{ formatCurrency(calculatePhaseCost(phase)) }}</div>
      </div>
      
      <div class="budget-card total">
        <div class="budget-card-title">Total Budget</div>
        <div class="budget-card-value">${{ formatCurrency(totalBudget) }}</div>
      </div>
    </div>
    
    <div class="budget-details">
      <h4>Detailed Breakdown</h4>
      
      <!-- Required Phases -->
      <div v-for="phase in requiredPhases" :key="`breakdown-${phase.number}`" class="accordion">
        <div class="accordion-header" @click="toggleAccordion(phase.number)">
          <h5>{{ phase.displayName }}</h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(phase.number) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(phase.number)">
          <table class="budget-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Duration</th>
                <th>Team Members</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(round, roundKey) in phase.rounds" :key="roundKey">
                <td>{{ round.name }}</td>
                <td>{{ round.duration_days }} days</td>
                <td>{{ round.team.length }} members</td>
                <td>${{ formatCurrency(calculateRoundCost(round)) }}</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>${{ formatCurrency(calculatePhaseCost(phase)) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Optional Services Separator -->
      <div v-if="enabledOptionalPhases.length > 0" class="optional-services-divider">
        <h4>Optional Services</h4>
      </div>
      
      <!-- Optional Phases that are enabled -->
      <div v-for="phase in enabledOptionalPhases" :key="`optional-${phase.number}`" class="accordion optional">
        <div class="accordion-header" @click="toggleAccordion(phase.number)">
          <h5>{{ phase.displayName }} <span class="optional-tag">Optional</span></h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(phase.number) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(phase.number)">
          <table class="budget-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Duration</th>
                <th>Team Members</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(round, roundKey) in phase.rounds" :key="roundKey">
                <td>{{ round.name }}</td>
                <td>{{ round.duration_days }} days</td>
                <td>{{ round.team.length }} members</td>
                <td>${{ formatCurrency(calculateRoundCost(round)) }}</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>${{ formatCurrency(calculatePhaseCost(phase)) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DataService from '../services/DataService'

export default {
  name: 'BudgetDashboard',
  setup() {
    const phases = ref([])
    const openAccordions = ref([]) // Start with all accordions closed
    
    // Required phases are the first 4 phases
    const requiredPhaseNumbers = [1, 2, 3, 4]
    
    onMounted(async () => {
      try {
        console.log("[BudgetDashboard] Loading data from DataService...");
        // Load phases from DataService
        const data = await DataService.getData();
        console.log("[BudgetDashboard] Data loaded successfully:", data);
        console.log("[BudgetDashboard] Phases count:", data.phases?.length || 0);
        
        if (!data.phases || data.phases.length === 0) {
          console.error("[BudgetDashboard] No phases found in loaded data!");
          return;
        }
        
        phases.value = data.phases || [];
        console.log("[BudgetDashboard] phases.value set with phases:", phases.value.length);
        
        // Log required and optional phases
        const required = phases.value.filter(phase => 
          requiredPhaseNumbers.includes(phase.number) && phase.enabled
        );
        const optional = phases.value.filter(phase => 
          !requiredPhaseNumbers.includes(phase.number) && phase.enabled
        );
        console.log("[BudgetDashboard] Required phases count:", required.length);
        console.log("[BudgetDashboard] Optional phases count:", optional.length);
        
        // Subscribe to phase update events from other components
        DataService.onUpdate('phase-update', handlePhaseUpdate);
        // Subscribe to data refresh events
        DataService.onUpdate('data-refresh', handleDataRefresh);
        console.log("[BudgetDashboard] Component initialization complete");
      } catch (error) {
        console.error('[BudgetDashboard] Failed to load phases data:', error);
      }
    })
    
    // Clean up event listeners when component is unmounted
    onBeforeUnmount(() => {
      DataService.offUpdate('phase-update', handlePhaseUpdate);
      DataService.offUpdate('data-refresh', handleDataRefresh);
    });
    
    // Handle complete data refresh events
    const handleDataRefresh = async () => {
      console.log('[BudgetDashboard] Handling data refresh event');
      try {
        // Reload all data
        const freshData = await DataService.getData();
        if (freshData && freshData.phases) {
          phases.value = freshData.phases;
          console.log(`[BudgetDashboard] Refreshed phases data: ${phases.value.length} phases`);
          console.log(`[BudgetDashboard] New total budget: $${formatCurrency(totalBudget.value)}`);
        }
      } catch (error) {
        console.error('[BudgetDashboard] Error handling data refresh:', error);
      }
    };
    
    // Handle phase updates from other components
    const handlePhaseUpdate = ({ phaseName, enabled }) => {
      console.log(`[BudgetDashboard] Received phase update for '${phaseName}': ${enabled}`);
      // Find and update the phase in our local array
      const phase = phases.value.find(p => p.name === phaseName);
      if (phase) {
        console.log(`[BudgetDashboard] Updating phase '${phaseName}' from ${phase.enabled} to ${enabled}`);
        phase.enabled = enabled;
        
        // Force reactive update by creating a new array
        phases.value = [...phases.value];
        console.log(`[BudgetDashboard] Updated budget calculations`);
        console.log(`[BudgetDashboard] New total budget: $${formatCurrency(totalBudget.value)}`);
      } else {
        console.error(`[BudgetDashboard] Phase '${phaseName}' not found in local data`);
      }
    };
    
    // Get required phases (the first 4)
    const requiredPhases = computed(() => {
      const filteredPhases = phases.value.filter(phase => 
        requiredPhaseNumbers.includes(phase.number) && phase.enabled
      );
      console.log(`[BudgetDashboard] Computed requiredPhases: ${filteredPhases.length} enabled phases`);
      filteredPhases.forEach(phase => {
        console.log(`[BudgetDashboard] Required phase #${phase.number} (${phase.name}): enabled=${phase.enabled}`);
      });
      return filteredPhases;
    })
    
    // Get optional phases that are enabled
    const enabledOptionalPhases = computed(() => {
      const filteredPhases = phases.value.filter(phase => 
        !requiredPhaseNumbers.includes(phase.number) && phase.enabled
      );
      console.log(`[BudgetDashboard] Computed enabledOptionalPhases: ${filteredPhases.length} enabled phases`);
      filteredPhases.forEach(phase => {
        console.log(`[BudgetDashboard] Optional phase #${phase.number} (${phase.name}): enabled=${phase.enabled}`);
      });
      return filteredPhases;
    })
    
    // Calculate cost for a single round
    const calculateRoundCost = (round) => {
      if (!round || !round.team) return 0
      
      let cost = 0
      round.team.forEach(member => {
        cost += member.day_rate * round.duration_days
      })
      return cost
    }
    
    // Calculate cost for an entire phase
    const calculatePhaseCost = (phase) => {
      if (!phase || !phase.rounds) return 0
      
      let cost = 0
      Object.values(phase.rounds).forEach(round => {
        cost += calculateRoundCost(round)
      })
      return cost
    }
    
    // Calculate the total budget for all enabled phases
    const totalBudget = computed(() => {
      let total = 0
      
      // Add cost of required phases
      requiredPhases.value.forEach(phase => {
        total += calculatePhaseCost(phase)
      })
      
      // Add cost of optional enabled phases
      enabledOptionalPhases.value.forEach(phase => {
        total += calculatePhaseCost(phase)
      })
      
      return total
    })
    
    // Format currency (add commas and round to nearest dollar)
    const formatCurrency = (value) => {
      return Math.round(value).toLocaleString('en-US')
    }
    
    // Toggle accordion open/closed
    const toggleAccordion = (phaseNumber) => {
      if (openAccordions.value.includes(phaseNumber)) {
        openAccordions.value = openAccordions.value.filter(id => id !== phaseNumber)
      } else {
        openAccordions.value.push(phaseNumber)
      }
    }
    
    return {
      phases,
      requiredPhases,
      enabledOptionalPhases,
      openAccordions,
      toggleAccordion,
      calculateRoundCost,
      calculatePhaseCost,
      totalBudget,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.budget-container {
  padding: 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.budget-header {
  margin-bottom: 1.5rem;
}

.budget-header h3 {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
}

.budget-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.budget-card {
  background-color: #252525;
  border-radius: 8px;
  padding: 1.25rem;
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid rgba(180, 180, 170, 0.15);
  transition: all 0.2s ease;
}

.budget-card:hover {
  border-color: rgba(180, 180, 170, 0.3);
  transform: translateY(-2px);
}

.budget-card-title {
  color: #ccccc2;
  font-size: 1rem;
  font-weight: 500;
}

.budget-card-value {
  color: #e6e6dc;
  font-size: 1.5rem;
  font-weight: 700;
}

.budget-card.optional {
  background-color: #2a2520;
  border-color: rgba(255, 145, 0, 0.3);
}

.optional-tag {
  background-color: rgba(255, 145, 0, 0.2);
  color: #ff9100;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.budget-card.total {
  background-color: #292923;
  border-color: rgba(255, 107, 0, 0.3);
}

.budget-card.total .budget-card-value {
  color: #ff6b00;
}

.budget-details {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid rgba(180, 180, 170, 0.2);
}

.budget-details h4 {
  margin-bottom: 1rem;
  color: #fff;
  font-size: 1.1rem;
}

.optional-services-divider {
  margin: 2rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 145, 0, 0.3);
}

.optional-services-divider h4 {
  color: #ff9100;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.accordion {
  margin-bottom: 1rem;
  border: 1px solid rgba(180, 180, 170, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.accordion.optional {
  border-color: rgba(255, 145, 0, 0.3);
}

.accordion-header {
  background-color: #252525;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.accordion.optional .accordion-header {
  background-color: #2a2520;
}

.accordion-header:hover {
  background-color: #2a2a2a;
}

.accordion.optional .accordion-header:hover {
  background-color: #302920;
}

.accordion-header h5 {
  color: #fff;
  margin: 0;
  font-size: 1rem;
}

.accordion-icon {
  color: #ccccc2;
  transition: transform 0.3s ease;
}

.accordion-icon.open {
  transform: rotate(45deg);
}

.accordion-content {
  padding: 1rem;
  background-color: #1c1c1c;
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
}

.budget-table th, 
.budget-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(180, 180, 170, 0.1);
}

.budget-table th {
  color: #ccccc2;
  font-weight: 500;
  font-size: 0.9rem;
}

.budget-table td {
  color: #f5f5f0;
}

.phase-total td {
  border-top: 2px solid rgba(180, 180, 170, 0.2);
  background-color: rgba(255, 255, 255, 0.03);
}

.accordion.optional .phase-total td {
  border-top: 2px solid rgba(255, 145, 0, 0.2);
  background-color: rgba(255, 145, 0, 0.05);
}
</style> 