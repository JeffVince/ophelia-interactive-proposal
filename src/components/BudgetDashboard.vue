<template>
  <div class="budget-container">
    <div class="budget-header">
      <h3>Project Budget Overview</h3>
    </div>
    
    <div class="budget-summary">
      <div class="budget-card">
        <div class="budget-card-title">Brand Book</div>
        <div class="budget-card-value">$73,750</div>
      </div>
      
      <div class="budget-card">
        <div class="budget-card-title">Brand Activations</div>
        <div class="budget-card-value">$73,750</div>
      </div>
      
      <div class="budget-card">
        <div class="budget-card-title">EP Brand Book</div>
        <div class="budget-card-value">$73,750</div>
      </div>
      
      <div class="budget-card">
        <div class="budget-card-title">EP Brand Activations</div>
        <div class="budget-card-value">$73,750</div>
      </div>
      
      <div class="budget-card total">
        <div class="budget-card-title">Total Budget</div>
        <div class="budget-card-value">$295,000</div>
      </div>
    </div>
    
    <div class="budget-details">
      <h4>Detailed Breakdown</h4>
      
      <!-- Phase 1: Brand Book -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion(1)">
          <h5>Brand Book</h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(1) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(1)">
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
              <tr>
                <td>Discovery & Exploration</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Development</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Refinement</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Final Approval</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>$73,750</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Phase 2: Brand Activations -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion(2)">
          <h5>Brand Activations</h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(2) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(2)">
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
              <tr>
                <td>Development</td>
                <td>5 days</td>
                <td>7 members</td>
                <td>$24,696</td>
              </tr>
              <tr>
                <td>Refinement</td>
                <td>5 days</td>
                <td>7 members</td>
                <td>$24,696</td>
              </tr>
              <tr>
                <td>Final Approval</td>
                <td>5 days</td>
                <td>7 members</td>
                <td>$24,359</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>$73,750</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Phase 3: EP Brand Book -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion(3)">
          <h5>EP Brand Book</h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(3) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(3)">
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
              <tr>
                <td>Discovery & Exploration</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Development</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Refinement</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Final Approval</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>$73,750</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Phase 4: EP Brand Activations -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion(4)">
          <h5>EP Brand Activations</h5>
          <div class="accordion-icon" :class="{ 'open': openAccordions.includes(4) }">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        
        <div class="accordion-content" v-show="openAccordions.includes(4)">
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
              <tr>
                <td>Discovery & Exploration</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Development</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Refinement</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr>
                <td>Final Approval</td>
                <td>5 days</td>
                <td>5 members</td>
                <td>$18,438</td>
              </tr>
              <tr class="phase-total">
                <td colspan="3"><strong>Phase Subtotal</strong></td>
                <td><strong>$73,750</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="total-calculations">
        <h5>Budget Summary</h5>
        <div class="calc-row">
          <span>Brand Book:</span>
          <span>$73,750</span>
        </div>
        <div class="calc-row">
          <span>Brand Activations:</span>
          <span>$73,750</span>
        </div>
        <div class="calc-row">
          <span>EP Brand Book:</span>
          <span>$73,750</span>
        </div>
        <div class="calc-row">
          <span>EP Brand Activations:</span>
          <span>$73,750</span>
        </div>
        <div class="calc-row total">
          <span>Total Budget:</span>
          <span>$295,000</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BudgetDashboard',
  data() {
    return {
      openAccordions: [] // Start with all accordions closed
    }
  },
  methods: {
    toggleAccordion(phaseNumber) {
      if (this.openAccordions.includes(phaseNumber)) {
        this.openAccordions = this.openAccordions.filter(id => id !== phaseNumber);
      } else {
        this.openAccordions.push(phaseNumber);
      }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-header h3 {
  font-size: 1.5rem;
  color: #fff;
}

.budget-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.budget-card {
  background-color: #1c1c1c;
  border-radius: 8px;
  padding: 1.25rem;
  flex: 1;
  border: 1px solid rgba(180, 180, 170, 0.2);
}

.budget-card-title {
  font-size: 0.9rem;
  color: #ccccc2;
  margin-bottom: 0.5rem;
}

.budget-card-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #d6d6ce;
}

.budget-card.total {
  background-color: #252525;
  border: 1px solid rgba(214, 214, 206, 0.3);
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

.accordion {
  margin-bottom: 1rem;
  border: 1px solid rgba(180, 180, 170, 0.15);
  border-radius: 6px;
  overflow: hidden;
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

.accordion-header:hover {
  background-color: #2a2a2a;
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

.total-calculations {
  margin-top: 2rem;
  border-top: 1px solid rgba(180, 180, 170, 0.2);
  padding-top: 1rem;
}

.total-calculations h5 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(180, 180, 170, 0.1);
}

.calc-row.total {
  border-top: 2px solid rgba(180, 180, 170, 0.2);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: #ff6b00;
}
</style> 