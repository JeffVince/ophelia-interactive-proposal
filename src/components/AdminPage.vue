<template>
  <div class="admin-page">
    <header class="admin-header">
      <h1>Data Administration</h1>
      <p class="subtitle">Manage project phases, team members, and settings</p>
      
      <div class="action-bar">
        <button class="btn btn-primary" @click="saveData" :disabled="isSaving || isLoading">
          <span class="icon">💾</span> {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button class="btn btn-secondary" @click="resetData" :disabled="isSaving || isLoading">
          <span class="icon">↺</span> Reset Changes
        </button>
        <button class="btn btn-secondary" @click="openRawJsonEditor">
          <span class="icon">{ }</span> Edit Raw JSON
        </button>
        <div v-if="statusMessage" class="status-message">{{ statusMessage }}</div>
      </div>
    </header>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>

    <div v-else class="content-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id" 
          :class="['tab', { 'active': activeTab === tab.id }]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Phases Tab -->
      <div v-if="activeTab === 'phases'" class="tab-content">
        <div class="header-with-actions">
          <h2>Phases</h2>
          <button class="btn btn-add" @click="addPhase">+ Add Phase</button>
        </div>
        
        <div class="phase-list">
          <div v-for="(phase, phaseIndex) in jsonData.phases" :key="phaseIndex" class="phase-card">
            <div class="phase-card-header" @click="toggleAccordion('phase', phaseIndex)">
              <h3>Phase {{ phase.number }}: {{ phase.displayName }}</h3>
              <div class="card-actions">
                <button class="btn-icon" @click.stop="openModal('phase', phaseIndex)">✎</button>
                <span class="expand-icon">{{ expandedItems.phase[phaseIndex] ? '▼' : '►' }}</span>
              </div>
            </div>
            
            <div v-if="expandedItems.phase[phaseIndex]" class="phase-card-content">
              <div class="phase-info">
                <div class="form-row">
                  <div class="form-group">
                    <label>Number</label>
                    <div class="edit-field-wrapper">
                      <input type="number" v-model.number="phase.number" class="form-control" />
                      <button class="field-edit-btn" @click="editField('number', phase.number, 'number', 'Phase Number', phaseIndex, 'phases')">✎</button>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Name</label>
                    <div class="edit-field-wrapper">
                      <input type="text" v-model="phase.name" class="form-control" />
                      <button class="field-edit-btn" @click="editField('name', phase.name, 'text', 'Phase Name', phaseIndex, 'phases')">✎</button>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Display</label>
                    <div class="edit-field-wrapper">
                      <input type="text" v-model="phase.displayName" class="form-control" />
                      <button class="field-edit-btn" @click="editField('displayName', phase.displayName, 'text', 'Display Name', phaseIndex, 'phases')">✎</button>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="phase.enabled" />
                      <span>Enabled</span>
                      <button class="field-edit-btn" @click="editField('enabled', phase.enabled, 'boolean', 'Enabled Status', phaseIndex, 'phases')">✎</button>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Core Deliverables section -->
              <div class="section">
                <div class="section-header">
                  <h4>Core Deliverables</h4>
                  <div>
                    <button class="btn btn-sm" @click="openModal('deliverable', phaseIndex)">+ Add</button>
                    <button class="btn-icon" @click="editField('default_enabled', phase.core_deliverables?.default_enabled || [], 'array', 'Core Deliverables', phaseIndex, 'phases', 'core_deliverables')">✎</button>
                  </div>
                </div>
                
                <div class="card-grid">
                  <div 
                    v-for="(item, index) in phase.core_deliverables?.default_enabled" 
                    :key="'enabled-'+index" 
                    class="data-card"
                  >
                    <div class="data-card-content">{{ item }}</div>
                    <div class="data-card-actions">
                      <button class="btn-icon" @click="editField('default_enabled['+index+']', item, 'text', 'Deliverable', phaseIndex, 'phases', 'core_deliverables')">✎</button>
                      <button class="btn-icon btn-icon-danger" @click="removeArrayItem(phase.core_deliverables.default_enabled, index)">✕</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Rounds section -->
              <div class="section">
                <div class="section-header">
                  <h4>Rounds</h4>
                  <div>
                    <button class="btn btn-sm" @click="addRound(phase)">+ Add Round</button>
                    <button class="btn-icon" @click="editField('rounds', phase.rounds, 'object', 'Rounds', phaseIndex, 'phases')">✎</button>
                  </div>
                </div>
                
                <div class="card-grid">
                  <div 
                    v-for="(round, roundKey) in phase.rounds" 
                    :key="roundKey" 
                    class="round-card"
                  >
                    <div class="round-card-header" @click="toggleAccordion('round', phaseIndex + '-' + roundKey)">
                      <h5>{{ roundKey }}: {{ round.name }}</h5>
                      <div class="card-actions">
                        <button class="btn-icon" @click.stop="editField(roundKey, round, 'object', `Round ${roundKey}`, phaseIndex, 'phases', 'rounds')">✎</button>
                        <span class="expand-icon">{{ expandedItems.round[phaseIndex + '-' + roundKey] ? '▼' : '►' }}</span>
                      </div>
                    </div>
                    
                    <div v-if="expandedItems.round[phaseIndex + '-' + roundKey]" class="round-card-content">
                      <div class="form-row">
                        <div class="form-group">
                          <label>Duration (days)</label>
                          <div class="edit-field-wrapper">
                            <input type="number" v-model.number="round.duration_days" class="form-control" />
                            <button class="field-edit-btn" @click.stop="editField('duration_days', round.duration_days, 'number', 'Duration Days', phaseIndex, 'phases', `rounds.${roundKey}`)">✎</button>
                          </div>
                        </div>
                        <div class="form-group">
                          <label>Start Date</label>
                          <div class="edit-field-wrapper">
                            <input type="date" v-model="round.start_date" class="form-control" />
                            <button class="field-edit-btn" @click.stop="editField('start_date', round.start_date, 'date', 'Start Date', phaseIndex, 'phases', `rounds.${roundKey}`)">✎</button>
                          </div>
                        </div>
                      </div>
                      
                      <div class="tag-section">
                        <h6>Deliverables</h6>
                        <button class="field-edit-btn" @click.stop="editField('deliverables', round.deliverables, 'array', 'Round Deliverables', phaseIndex, 'phases', `rounds.${roundKey}`)">✎</button>
                        <div class="tag-container">
                          <div v-for="(item, index) in round.deliverables" :key="'del-'+index" class="tag">
                            <span>{{ item }}</span>
                            <button class="tag-remove" @click="removeArrayItem(round.deliverables, index)">✕</button>
                          </div>
                          <button class="btn btn-sm" @click="addArrayItem(round.deliverables, '')">+ Add</button>
                        </div>
                      </div>
                      
                      <div class="tag-section">
                        <h6>Tasks</h6>
                        <button class="field-edit-btn" @click.stop="editField('tasks', round.tasks, 'array', 'Round Tasks', phaseIndex, 'phases', `rounds.${roundKey}`)">✎</button>
                        <div class="tag-container">
                          <div v-for="(item, index) in round.tasks" :key="'task-'+index" class="tag">
                            <span>{{ item }}</span>
                            <button class="tag-remove" @click="removeArrayItem(round.tasks, index)">✕</button>
                          </div>
                          <button class="btn btn-sm" @click="addArrayItem(round.tasks, '')">+ Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Stakeholders section -->
              <div class="section">
                <div class="section-header">
                  <h4>Stakeholders</h4>
                  <button class="btn-icon" @click="editField('stakeholders', phase.stakeholders, 'array', 'Stakeholders', phaseIndex, 'phases')">✎</button>
                </div>
                
                <div class="tag-container">
                  <div v-for="(item, index) in phase.stakeholders" :key="'stake-'+index" class="tag">
                    <span>{{ item }}</span>
                    <button class="tag-remove" @click="removeArrayItem(phase.stakeholders, index)">✕</button>
                  </div>
                  <button class="btn btn-sm" @click="addArrayItem(phase.stakeholders, '')">+ Add</button>
                </div>
              </div>
              
              <button class="btn btn-danger" @click="removePhase(phaseIndex)">Delete Phase</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Team Tab -->
      <div v-if="activeTab === 'team'" class="tab-content">
        <h2>Creative Team</h2>
        
        <div class="team-grid">
          <!-- Leadership section -->
          <div class="team-section">
            <div class="section-header">
              <h3>Leadership</h3>
              <div>
                <button class="btn btn-sm btn-add" @click="openModal('team-member', { section: 'leadership' })">+ Add</button>
                <button class="btn-icon btn-edit-section" @click="editField('leadership', jsonData.creativeTeam.leadership, 'array', 'Leadership Team', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.leadership" 
                :key="'lead-'+index" 
                class="member-card"
              >
                <div class="member-avatar-wrapper">
                  <div class="member-avatar" @click="uploadProfilePhoto(member, 'leadership', index)">
                    <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" class="profile-image">
                    <div v-else v-html="PLACEHOLDER_PORTRAIT" class="placeholder-avatar"></div>
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                    </div>
                  </div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                  <p v-if="member.day_rate" class="rate">{{ member.day_rate }} / day</p>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit-item" @click="editField('leadership['+index+']', member, 'object', 'Team Member', index, 'creativeTeam', 'leadership')">✎</button>
                  <button class="btn-icon btn-delete-item" @click="removeArrayItem(jsonData.creativeTeam.leadership, index)">✕</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Designers section -->
          <div class="team-section">
            <div class="section-header">
              <h3>Designers</h3>
              <div>
                <button class="btn btn-sm btn-add" @click="openModal('team-member', { section: 'designers' })">+ Add</button>
                <button class="btn-icon btn-edit-section" @click="editField('designers', jsonData.creativeTeam.designers, 'array', 'Design Team', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.designers" 
                :key="'design-'+index" 
                class="member-card"
              >
                 <div class="member-avatar-wrapper">
                  <div class="member-avatar" @click="uploadProfilePhoto(member, 'designers', index)">
                    <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" class="profile-image">
                    <div v-else v-html="PLACEHOLDER_PORTRAIT" class="placeholder-avatar"></div>
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                    </div>
                  </div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                  <p v-if="member.day_rate" class="rate">{{ member.day_rate }} / day</p>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit-item" @click="editField('designers['+index+']', member, 'object', 'Designer', index, 'creativeTeam', 'designers')">✎</button>
                  <button class="btn-icon btn-delete-item" @click="removeArrayItem(jsonData.creativeTeam.designers, index)">✕</button>
                </div>
              </div>
            </div>
          </div>
          
           <!-- Production section -->
          <div class="team-section">
            <div class="section-header">
              <h3>Production</h3>
              <div>
                <button class="btn btn-sm btn-add" @click="openModal('team-member', { section: 'production' })">+ Add</button>
                <button class="btn-icon btn-edit-section" @click="editField('production', jsonData.creativeTeam.production, 'array', 'Production Team', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.production" 
                :key="'prod-'+index" 
                class="member-card"
              >
                <div class="member-avatar-wrapper">
                  <div class="member-avatar" @click="uploadProfilePhoto(member, 'production', index)">
                    <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" class="profile-image">
                    <div v-else v-html="PLACEHOLDER_PORTRAIT" class="placeholder-avatar"></div>
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                    </div>
                  </div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                  <p v-if="member.day_rate" class="rate">{{ member.day_rate }} / day</p>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit-item" @click="editField('production['+index+']', member, 'object', 'Production Member', index, 'creativeTeam', 'production')">✎</button>
                  <button class="btn-icon btn-delete-item" @click="removeArrayItem(jsonData.creativeTeam.production, index)">✕</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Creatives section -->
          <div class="team-section">
            <div class="section-header">
              <h3>Creatives</h3>
              <div>
                 <button class="btn btn-sm btn-add" @click="openModal('team-member', { section: 'creatives' })">+ Add</button>
                <button class="btn-icon btn-edit-section" @click="editField('creatives', jsonData.creativeTeam.creatives, 'array', 'Creative Team Rates', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.creatives" 
                :key="'creative-'+index" 
                class="member-card"
              >
                 <div class="member-avatar-wrapper">
                  <div class="member-avatar" @click="uploadProfilePhoto(member, 'creatives', index)">
                    <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" class="profile-image">
                    <div v-else v-html="PLACEHOLDER_PORTRAIT" class="placeholder-avatar"></div>
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                    </div>
                  </div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                   <p v-if="member.day_rate" class="rate">{{ member.day_rate }} / day</p>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit-item" @click="editField('creatives['+index+']', member, 'object', 'Creative', index, 'creativeTeam', 'creatives')">✎</button>
                  <button class="btn-icon btn-delete-item" @click="removeArrayItem(jsonData.creativeTeam.creatives, index)">✕</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Stakeholders section -->
          <div class="team-section">
            <div class="section-header">
              <h3>Stakeholders</h3>
              <button class="btn-icon btn-edit-section" @click="editField('stakeholders', jsonData.creativeTeam.stakeholders, 'array', 'Team Stakeholders', 0, 'creativeTeam')">✎</button>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.stakeholders" 
                :key="'stake-'+index" 
                class="member-card"
              >
                <div class="member-avatar-wrapper">
                  <div class="member-avatar" @click="uploadProfilePhoto(member, 'stakeholders', index)">
                     <img v-if="member.avatarUrl" :src="member.avatarUrl" :alt="member.name" class="profile-image">
                    <div v-else v-html="PLACEHOLDER_PORTRAIT" class="placeholder-avatar"></div>
                    <div class="upload-overlay">
                      <span class="upload-icon">📷</span>
                    </div>
                  </div>
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>
                   <p v-if="member.day_rate" class="rate">{{ member.day_rate }} / day</p>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit-item" @click="editField('stakeholders['+index+']', member, 'object', 'Stakeholder', index, 'creativeTeam', 'stakeholders')">✎</button>
                  <button class="btn-icon btn-delete-item" @click="removeArrayItem(jsonData.creativeTeam.stakeholders, index)">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Budget Settings Tab -->
      <div v-if="activeTab === 'budget'" class="tab-content">
        <h2>Budget Settings</h2>
        <p class="subtitle">Adjust day rates, fees, and assignments that affect the budget calculations.</p>
        
        <!-- Fee Settings Section -->
        <div class="budget-section">
          <h3>Project Fees</h3>
          <p class="subtitle">These fees are applied to the total budget calculation.</p>
          
          <div class="fee-settings-grid">
            <div class="fee-card">
              <div class="fee-info">
                <h4>Insurance</h4>
                <p>Project liability insurance</p>
              </div>
              <div class="form-group budget-rate-group">
                <div class="edit-field-wrapper">
                  <input 
                    type="number" 
                    v-model.number="insuranceRate" 
                    class="form-control rate-input" 
                  />
                  <span class="rate-unit">%</span>
                  <button class="field-edit-btn" @click="editField('insurance_rate', insuranceRate, 'number', 'Insurance Rate', 0, 'budgetSettings')">✎</button>
                </div>
              </div>
            </div>
            
            <div class="fee-card">
              <div class="fee-info">
                <h4>Markup</h4>
                <p>Agency markup fee</p>
              </div>
              <div class="form-group budget-rate-group">
                <div class="edit-field-wrapper">
                  <input 
                    type="number" 
                    v-model.number="markupRate" 
                    class="form-control rate-input" 
                  />
                  <span class="rate-unit">%</span>
                  <button class="field-edit-btn" @click="editField('markup_rate', markupRate, 'number', 'Markup Rate', 0, 'budgetSettings')">✎</button>
                </div>
              </div>
            </div>
            
            <div class="fee-card">
              <div class="fee-info">
                <h4>Payroll Processing</h4>
                <p>External payroll service</p>
              </div>
              <div class="form-group budget-rate-group">
                <div class="edit-field-wrapper">
                  <input 
                    type="number" 
                    v-model.number="payrollRate" 
                    class="form-control rate-input" 
                  />
                  <span class="rate-unit">%</span>
                  <button class="field-edit-btn" @click="editField('payroll_rate', payrollRate, 'number', 'Payroll Rate', 0, 'budgetSettings')">✎</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="team-grid">
          <!-- Leadership Rates -->
          <div class="team-section">
            <div class="section-header">
              <h3>Leadership</h3>
              <div>
                <button class="btn btn-sm" @click="openModal('team-member', 'leadership')">+ Add</button>
                <button class="btn-icon" @click="editField('leadership', jsonData.creativeTeam.leadership, 'array', 'Leadership Team Rates', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.leadership" 
                :key="'lead-rate-'+index" 
                class="member-card budget-member-card"
              >
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>

                  <!-- Member Card Header -->
                  <div class="member-card-header">
                    <div class="member-rate-status">
                      <span class="header-day-rate">${{ member.day_rate }} / day</span>
                      <button class="btn-icon-text" @click="editField('leadership['+index+'].day_rate', member.day_rate, 'number', 'Day Rate', index, 'creativeTeam', 'leadership')">✎</button>
                      <span :class="['booking-status', getBookingStatus(member.role).class]">
                        {{ getBookingStatus(member.role).text }}
                      </span>
                    </div>
                    <div class="member-dates">
                      <div class="date-item">
                        <span class="date-label">Start:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).earliestStart) }}</span>
                      </div>
                      <div class="date-item">
                        <span class="date-label">End:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).latestEnd) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Assignment info -->
                  <div class="assignment-info">
                    <div class="assignment-label">
                      <span>Assignments</span>
                      <span class="total-days-badge">{{ getTotalDays(member.role) }} days</span>
                    </div>
                    <div v-if="!hasAssignments(member.role)" class="no-assignments">
                      Not currently assigned
                    </div>
                    <div v-else class="assignment-details">
                      <div v-for="(assignment, index) in getDetailedAssignments(member.role)" :key="index" class="assignment-item">
                        <div class="assignment-header" @click="toggleAssignmentDetails(member.role, index)">
                          <div class="phase-name">{{ assignment.phase }}</div>
                          <div class="assignment-badges">
                            <span class="badge round-badge">{{ assignment.rounds.length }} rounds</span>
                            <span class="badge days-badge">{{ assignment.totalDays }} days</span>
                            <span class="toggle-details">{{ isAssignmentExpanded(member.role, index) ? '▼' : '►' }}</span>
                          </div>
                        </div>
                        <div v-if="isAssignmentExpanded(member.role, index)" class="assignment-expanded">
                          <div class="dates-row">
                            <div class="date-item">
                              <span class="date-label">Start:</span>
                              <span class="date-value">{{ formatDate(assignment.earliest) }}</span>
                            </div>
                            <div class="date-item">
                              <span class="date-label">End:</span>
                              <span class="date-value">{{ formatDate(assignment.latest) }}</span>
                            </div>
                          </div>
                          
                          <!-- Rounds -->
                          <div class="rounds-section">
                            <div class="section-label">Rounds ({{ assignment.rounds.length }})</div>
                            <div class="rounds-list">
                              <div v-for="(round, rIndex) in assignment.rounds" :key="rIndex" class="round-item">
                                <div class="round-header">
                                  <span class="round-name">{{ round.name }}</span>
                                  <span class="round-days">{{ round.days }} days</span>
                                </div>
                                <div class="round-dates">
                                  {{ formatDate(round.startDate) }} - {{ formatDate(round.endDate) }}
                                </div>
                                
                                <div class="round-details">
                                  <div v-if="round.tasks.length > 0" class="tasks-section">
                                    <div class="subsection-label">Tasks ({{ round.tasks.length }})</div>
                                    <ul class="tasks-list">
                                      <li v-for="(task, tIndex) in round.tasks" :key="tIndex">{{ task }}</li>
                                    </ul>
                                  </div>
                                  <div v-if="round.deliverables.length > 0" class="deliverables-section">
                                    <div class="subsection-label">Deliverables ({{ round.deliverables.length }})</div>
                                    <ul class="deliverables-list">
                                      <li v-for="(deliverable, dIndex) in round.deliverables" :key="dIndex">{{ deliverable }}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group budget-rate-group">
                  <label :for="'lead-rate-'+index" class="sr-only">Rate for {{ member.name }}</label>
                  <div class="edit-field-wrapper">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Designers Rates -->
          <div class="team-section">
            <div class="section-header">
              <h3>Designers</h3>
              <div>
                <button class="btn btn-sm" @click="openModal('team-member', 'designers')">+ Add</button>
                <button class="btn-icon" @click="editField('designers', jsonData.creativeTeam.designers, 'array', 'Design Team Rates', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.designers" 
                :key="'design-rate-'+index" 
                class="member-card budget-member-card"
              >
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>

                  <!-- Member Card Header -->
                  <div class="member-card-header">
                    <div class="member-rate-status">
                      <span class="header-day-rate">${{ member.day_rate }} / day</span>
                      <button class="btn-icon-text" @click="editField('designers['+index+'].day_rate', member.day_rate, 'number', 'Day Rate', index, 'creativeTeam', 'designers')">✎</button>
                      <span :class="['booking-status', getBookingStatus(member.role).class]">
                        {{ getBookingStatus(member.role).text }}
                      </span>
                    </div>
                    <div class="member-dates">
                      <div class="date-item">
                        <span class="date-label">Start:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).earliestStart) }}</span>
                      </div>
                      <div class="date-item">
                        <span class="date-label">End:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).latestEnd) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Assignment info -->
                  <div class="assignment-info">
                    <div class="assignment-label">
                      <span>Assignments</span>
                      <span class="total-days-badge">{{ getTotalDays(member.role) }} days</span>
                    </div>
                    <div v-if="!hasAssignments(member.role)" class="no-assignments">
                      Not currently assigned
                    </div>
                    <div v-else class="assignment-details">
                      <div v-for="(assignment, index) in getDetailedAssignments(member.role)" :key="index" class="assignment-item">
                        <div class="assignment-header" @click="toggleAssignmentDetails(member.role, index)">
                          <div class="phase-name">{{ assignment.phase }}</div>
                          <div class="assignment-badges">
                            <span class="badge round-badge">{{ assignment.rounds.length }} rounds</span>
                            <span class="badge days-badge">{{ assignment.totalDays }} days</span>
                            <span class="toggle-details">{{ isAssignmentExpanded(member.role, index) ? '▼' : '►' }}</span>
                          </div>
                        </div>
                        <div v-if="isAssignmentExpanded(member.role, index)" class="assignment-expanded">
                          <div class="dates-row">
                            <div class="date-item">
                              <span class="date-label">Start:</span>
                              <span class="date-value">{{ formatDate(assignment.earliest) }}</span>
                            </div>
                            <div class="date-item">
                              <span class="date-label">End:</span>
                              <span class="date-value">{{ formatDate(assignment.latest) }}</span>
                            </div>
                          </div>
                          
                          <!-- Rounds -->
                          <div class="rounds-section">
                            <div class="section-label">Rounds ({{ assignment.rounds.length }})</div>
                            <div class="rounds-list">
                              <div v-for="(round, rIndex) in assignment.rounds" :key="rIndex" class="round-item">
                                <div class="round-header">
                                  <span class="round-name">{{ round.name }}</span>
                                  <span class="round-days">{{ round.days }} days</span>
                                </div>
                                <div class="round-dates">
                                  {{ formatDate(round.startDate) }} - {{ formatDate(round.endDate) }}
                                </div>
                                
                                <div class="round-details">
                                  <div v-if="round.tasks.length > 0" class="tasks-section">
                                    <div class="subsection-label">Tasks ({{ round.tasks.length }})</div>
                                    <ul class="tasks-list">
                                      <li v-for="(task, tIndex) in round.tasks" :key="tIndex">{{ task }}</li>
                                    </ul>
                                  </div>
                                  <div v-if="round.deliverables.length > 0" class="deliverables-section">
                                    <div class="subsection-label">Deliverables ({{ round.deliverables.length }})</div>
                                    <ul class="deliverables-list">
                                      <li v-for="(deliverable, dIndex) in round.deliverables" :key="dIndex">{{ deliverable }}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group budget-rate-group">
                  <label :for="'design-rate-'+index" class="sr-only">Rate for {{ member.name }}</label>
                  <div class="edit-field-wrapper">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Production Rates -->
          <div class="team-section">
            <div class="section-header">
              <h3>Production</h3>
              <div>
                <button class="btn btn-sm" @click="openModal('team-member', 'production')">+ Add</button>
                <button class="btn-icon" @click="editField('production', jsonData.creativeTeam.production, 'array', 'Production Team Rates', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.production" 
                :key="'prod-rate-'+index" 
                class="member-card budget-member-card"
              >
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>

                  <!-- Member Card Header -->
                  <div class="member-card-header">
                    <div class="member-rate-status">
                      <span class="header-day-rate">${{ member.day_rate }} / day</span>
                      <button class="btn-icon-text" @click="editField('production['+index+'].day_rate', member.day_rate, 'number', 'Day Rate', index, 'creativeTeam', 'production')">✎</button>
                      <span :class="['booking-status', getBookingStatus(member.role).class]">
                        {{ getBookingStatus(member.role).text }}
                      </span>
                    </div>
                    <div class="member-dates">
                      <div class="date-item">
                        <span class="date-label">Start:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).earliestStart) }}</span>
                      </div>
                      <div class="date-item">
                        <span class="date-label">End:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).latestEnd) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Assignment info -->
                  <div class="assignment-info">
                    <div class="assignment-label">
                      <span>Assignments</span>
                      <span class="total-days-badge">{{ getTotalDays(member.role) }} days</span>
                    </div>
                    <div v-if="!hasAssignments(member.role)" class="no-assignments">
                      Not currently assigned
                    </div>
                    <div v-else class="assignment-details">
                      <div v-for="(assignment, index) in getDetailedAssignments(member.role)" :key="index" class="assignment-item">
                        <div class="assignment-header" @click="toggleAssignmentDetails(member.role, index)">
                          <div class="phase-name">{{ assignment.phase }}</div>
                          <div class="assignment-badges">
                            <span class="badge round-badge">{{ assignment.rounds.length }} rounds</span>
                            <span class="badge days-badge">{{ assignment.totalDays }} days</span>
                            <span class="toggle-details">{{ isAssignmentExpanded(member.role, index) ? '▼' : '►' }}</span>
                          </div>
                        </div>
                        <div v-if="isAssignmentExpanded(member.role, index)" class="assignment-expanded">
                          <div class="dates-row">
                            <div class="date-item">
                              <span class="date-label">Start:</span>
                              <span class="date-value">{{ formatDate(assignment.earliest) }}</span>
                            </div>
                            <div class="date-item">
                              <span class="date-label">End:</span>
                              <span class="date-value">{{ formatDate(assignment.latest) }}</span>
                            </div>
                          </div>
                          
                          <!-- Rounds -->
                          <div class="rounds-section">
                            <div class="section-label">Rounds ({{ assignment.rounds.length }})</div>
                            <div class="rounds-list">
                              <div v-for="(round, rIndex) in assignment.rounds" :key="rIndex" class="round-item">
                                <div class="round-header">
                                  <span class="round-name">{{ round.name }}</span>
                                  <span class="round-days">{{ round.days }} days</span>
                                </div>
                                <div class="round-dates">
                                  {{ formatDate(round.startDate) }} - {{ formatDate(round.endDate) }}
                                </div>
                                
                                <div class="round-details">
                                  <div v-if="round.tasks.length > 0" class="tasks-section">
                                    <div class="subsection-label">Tasks ({{ round.tasks.length }})</div>
                                    <ul class="tasks-list">
                                      <li v-for="(task, tIndex) in round.tasks" :key="tIndex">{{ task }}</li>
                                    </ul>
                                  </div>
                                  <div v-if="round.deliverables.length > 0" class="deliverables-section">
                                    <div class="subsection-label">Deliverables ({{ round.deliverables.length }})</div>
                                    <ul class="deliverables-list">
                                      <li v-for="(deliverable, dIndex) in round.deliverables" :key="dIndex">{{ deliverable }}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group budget-rate-group">
                   <label :for="'prod-rate-'+index" class="sr-only">Rate for {{ member.name }}</label>
                  <div class="edit-field-wrapper">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Creatives Rates -->
          <div class="team-section">
            <div class="section-header">
              <h3>Creatives</h3>
              <div>
                <button class="btn btn-sm" @click="openModal('team-member', 'creatives')">+ Add</button>
                <button class="btn-icon" @click="editField('creatives', jsonData.creativeTeam.creatives, 'array', 'Creative Team Rates', 0, 'creativeTeam')">✎</button>
              </div>
            </div>
            <div class="card-grid">
              <div 
                v-for="(member, index) in jsonData.creativeTeam.creatives" 
                :key="'creative-rate-'+index" 
                class="member-card budget-member-card"
              >
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p>{{ member.role }}</p>

                  <!-- Member Card Header -->
                  <div class="member-card-header">
                    <div class="member-rate-status">
                      <span class="header-day-rate">${{ member.day_rate }} / day</span>
                      <button class="btn-icon-text" @click="editField('creatives['+index+'].day_rate', member.day_rate, 'number', 'Day Rate', index, 'creativeTeam', 'creatives')">✎</button>
                      <span :class="['booking-status', getBookingStatus(member.role).class]">
                        {{ getBookingStatus(member.role).text }}
                      </span>
                    </div>
                    <div class="member-dates">
                      <div class="date-item">
                        <span class="date-label">Start:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).earliestStart) }}</span>
                      </div>
                      <div class="date-item">
                        <span class="date-label">End:</span>
                        <span class="date-value">{{ formatDate(getOverallDates(member.role).latestEnd) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Assignment info -->
                  <div class="assignment-info">
                    <div class="assignment-label">
                      <span>Assignments</span>
                      <span class="total-days-badge">{{ getTotalDays(member.role) }} days</span>
                    </div>
                    <div v-if="!hasAssignments(member.role)" class="no-assignments">
                      Not currently assigned
                    </div>
                    <div v-else class="assignment-details">
                      <div v-for="(assignment, index) in getDetailedAssignments(member.role)" :key="index" class="assignment-item">
                        <div class="assignment-header" @click="toggleAssignmentDetails(member.role, index)">
                          <div class="phase-name">{{ assignment.phase }}</div>
                          <div class="assignment-badges">
                            <span class="badge round-badge">{{ assignment.rounds.length }} rounds</span>
                            <span class="badge days-badge">{{ assignment.totalDays }} days</span>
                            <span class="toggle-details">{{ isAssignmentExpanded(member.role, index) ? '▼' : '►' }}</span>
                          </div>
                        </div>
                        <div v-if="isAssignmentExpanded(member.role, index)" class="assignment-expanded">
                          <div class="dates-row">
                            <div class="date-item">
                              <span class="date-label">Start:</span>
                              <span class="date-value">{{ formatDate(assignment.earliest) }}</span>
                            </div>
                            <div class="date-item">
                              <span class="date-label">End:</span>
                              <span class="date-value">{{ formatDate(assignment.latest) }}</span>
                            </div>
                          </div>
                          
                          <!-- Rounds -->
                          <div class="rounds-section">
                            <div class="section-label">Rounds ({{ assignment.rounds.length }})</div>
                            <div class="rounds-list">
                              <div v-for="(round, rIndex) in assignment.rounds" :key="rIndex" class="round-item">
                                <div class="round-header">
                                  <span class="round-name">{{ round.name }}</span>
                                  <span class="round-days">{{ round.days }} days</span>
                                </div>
                                <div class="round-dates">
                                  {{ formatDate(round.startDate) }} - {{ formatDate(round.endDate) }}
                                </div>
                                
                                <div class="round-details">
                                  <div v-if="round.tasks.length > 0" class="tasks-section">
                                    <div class="subsection-label">Tasks ({{ round.tasks.length }})</div>
                                    <ul class="tasks-list">
                                      <li v-for="(task, tIndex) in round.tasks" :key="tIndex">{{ task }}</li>
                                    </ul>
                                  </div>
                                  <div v-if="round.deliverables.length > 0" class="deliverables-section">
                                    <div class="subsection-label">Deliverables ({{ round.deliverables.length }})</div>
                                    <ul class="deliverables-list">
                                      <li v-for="(deliverable, dIndex) in round.deliverables" :key="dIndex">{{ deliverable }}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group budget-rate-group">
                  <label :for="'creative-rate-'+index" class="sr-only">Rate for {{ member.name }}</label>
                  <div class="edit-field-wrapper">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h4>{{ modalTitle }}</h4>
          <div class="modal-header-actions">
            <button v-if="currentItem.formType === 'phase'" class="view-toggle-btn" @click="togglePhaseJsonView">
              {{ phaseJsonView ? 'Form View' : 'JSON View' }}
            </button>
            <button class="close-button" @click="closeModal">✕</button>
          </div>
        </div>
        
        <div class="modal-body">
          <!-- JSON View for Phase -->
          <div v-if="currentItem.formType === 'phase' && phaseJsonView" class="json-view-editor">
            <div class="form-group">
              <div class="json-editor-toolbar">
                <button class="btn btn-sm" @click="formatPhaseJson">Format JSON</button>
                <span v-if="phaseJsonError" class="json-error">{{ phaseJsonError }}</span>
              </div>
              <textarea 
                v-model="phaseJsonText" 
                class="json-editor field-json-editor" 
                spellcheck="false"
                @input="validatePhaseJson"
              ></textarea>
              
              <!-- AI Edit for Phase JSON -->
              <div class="ai-edit-panel">
                <div class="ai-edit-input">
                  <input 
                    type="text" 
                    v-model="phaseAiPrompt" 
                    class="form-control" 
                    placeholder="Prompt for edits"
                  />
                  <button class="ai-edit-btn" @click="applyPhaseAiEdit" :disabled="phaseAiProcessing">
                    <span v-if="!phaseAiProcessing">✨</span>
                    <span v-else class="spinner"></span>
                  </button>
                </div>
                <span v-if="phaseAiError" class="ai-error">{{ phaseAiError }}</span>
              </div>
            </div>
          </div>
          
          <!-- Form View -->
          <form v-else @submit.prevent="saveModalChanges">
            <!-- Form contents based on modalType -->
            <!-- Phase Form -->
            <div v-if="currentItem.formType === 'phase'" class="form-grid">
              <div class="form-group">
                <label>Number</label>
                <input type="number" v-model.number="currentItem.number" class="form-control" />
              </div>
              <div class="form-group">
                <label>Name</label>
                <input type="text" v-model="currentItem.name" class="form-control" />
              </div>
              <div class="form-group">
                <label>Display Name</label>
                <input type="text" v-model="currentItem.displayName" class="form-control" />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="currentItem.enabled" />
                  <span>Enabled</span>
                </label>
              </div>
            </div>

            <!-- Other form types would go here -->
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveModalChanges">Save</button>
        </div>
      </div>
    </div>

    <!-- Team Member Modal -->
    <div v-if="currentModal === 'team-member'" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h4>{{ modalData?.index !== undefined ? 'Edit' : 'Add' }} Team Member</h4>
          <button class="close-button" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="teamMemberName">Name</label>
            <input type="text" id="teamMemberName" v-model="tempFormData.name" class="form-control" />
          </div>
          <div class="form-group">
            <label for="teamMemberRole">Role</label>
            <input type="text" id="teamMemberRole" v-model="tempFormData.role" class="form-control" />
          </div>
          <div class="form-group">
            <label for="teamMemberRate">Day Rate</label>
            <input type="number" id="teamMemberRate" v-model.number="tempFormData.day_rate" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="saveFormData('team-member')">Save</button>
        </div>
      </div>
    </div>

    <!-- Raw JSON Editor Modal -->
    <div v-if="showRawJsonEditor" class="modal-overlay" @click.self="closeRawJsonEditor">
      <div class="modal-container raw-json-editor">
        <div class="modal-header">
          <h4>Edit Raw JSON</h4>
          <button class="close-button" @click="closeRawJsonEditor">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <div class="json-editor-toolbar">
              <button class="btn btn-sm" @click="formatJson">Format JSON</button>
              <span v-if="jsonError" class="json-error">{{ jsonError }}</span>
            </div>
            <textarea 
              v-model="rawJsonText" 
              class="json-editor" 
              spellcheck="false"
              @input="validateJson"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRawJsonEditor">Cancel</button>
          <button class="btn btn-primary" @click="saveRawJson" :disabled="!!jsonError">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Field Editor Modal -->
    <div v-if="fieldEditor.show" class="modal-overlay" @click.self="closeFieldEditor">
      <div class="modal-container">
        <div class="modal-header">
          <h4>{{ fieldEditor.title }}</h4>
          <div class="modal-header-actions">
            <button class="view-toggle-btn" @click="toggleFieldEditorView">
              {{ fieldEditor.jsonView ? 'Form View' : 'JSON View' }}
            </button>
            <button class="view-toggle-btn" @click="toggleFullJsonView" v-if="fieldEditor.jsonView">
              {{ fieldEditor.fullJsonView ? 'Field JSON' : 'Full JSON' }}
            </button>
            <button class="close-button" @click="closeFieldEditor">✕</button>
          </div>
        </div>
        <div class="modal-body">
          <!-- Form View -->
          <div v-if="!fieldEditor.jsonView">
            <div v-if="fieldEditor.type === 'text'" class="form-group">
              <label>{{ fieldEditor.label || 'Value' }}</label>
              <input type="text" v-model="fieldEditor.value" class="form-control" />
            </div>
            
            <div v-if="fieldEditor.type === 'number'" class="form-group">
              <label>{{ fieldEditor.label || 'Value' }}</label>
              <input type="number" v-model.number="fieldEditor.value" class="form-control" />
            </div>
            
            <div v-if="fieldEditor.type === 'boolean'" class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="fieldEditor.value" />
                <span>{{ fieldEditor.label || 'Enabled' }}</span>
              </label>
            </div>
            
            <div v-if="fieldEditor.type === 'date'" class="form-group">
              <label>{{ fieldEditor.label || 'Date' }}</label>
              <input type="date" v-model="fieldEditor.value" class="form-control" />
            </div>
            
            <div v-if="fieldEditor.type === 'select'" class="form-group">
              <label>{{ fieldEditor.label || 'Select' }}</label>
              <select v-model="fieldEditor.value" class="form-control">
                <option v-for="option in fieldEditor.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div v-if="fieldEditor.type === 'array'" class="array-editor">
              <div v-for="(item, index) in fieldEditor.value" :key="index" class="array-item-editor">
                <div class="form-row">
                  <div v-if="typeof item === 'object'" class="object-editor">
                    <div v-for="(val, key) in item" :key="key" class="form-group">
                      <label>{{ formatLabel(key) }}</label>
                      <input 
                        :type="getInputType(val)" 
                        v-model="item[key]" 
                        class="form-control" 
                      />
                    </div>
                  </div>
                  <div v-else class="form-group flex-grow">
                    <input 
                      :type="getInputType(item)" 
                      v-model="fieldEditor.value[index]" 
                      class="form-control" 
                    />
                  </div>
                  <button class="btn-icon btn-icon-danger" @click="removeItem(index)">✕</button>
                </div>
              </div>
              <button class="btn btn-sm" @click="addFieldEditorItem">+ Add Item</button>
            </div>
            
            <div v-if="fieldEditor.type === 'object'" class="object-editor">
              <div v-for="(val, key) in fieldEditor.value" :key="key" class="form-group">
                <label>{{ formatLabel(key) }}</label>
                <div v-if="typeof val === 'object' && val !== null && !Array.isArray(val)">
                  <button class="btn btn-sm" @click="editNestedObject(key, val)">Edit {{ formatLabel(key) }}</button>
                </div>
                <div v-else-if="Array.isArray(val)">
                  <button class="btn btn-sm" @click="editNestedArray(key, val)">Edit {{ formatLabel(key) }} ({{ val.length }} items)</button>
                </div>
                <input 
                  v-else
                  :type="getInputType(val)" 
                  v-model="fieldEditor.value[key]" 
                  class="form-control" 
                />
              </div>
            </div>
            
            <!-- AI edit panel moved to bottom -->
            <div class="ai-edit-panel">
              <div class="ai-edit-input">
                <input 
                  type="text" 
                  v-model="fieldEditor.aiPrompt" 
                  class="form-control" 
                  placeholder="Prompt for edits"
                />
                <button class="ai-edit-btn" @click="applyAiEdit" :disabled="fieldEditor.isAiProcessing">
                  <span v-if="!fieldEditor.isAiProcessing">✨</span>
                  <span v-else class="spinner"></span>
                </button>
              </div>
              <span v-if="fieldEditor.aiError" class="ai-error">{{ fieldEditor.aiError }}</span>
            </div>
          </div>
          
          <!-- JSON View -->
          <div v-if="fieldEditor.jsonView" class="json-view-editor">
            <div class="form-group">
              <div class="json-editor-toolbar">
                <button class="btn btn-sm" @click="formatFieldJson">Format JSON</button>
                <span v-if="fieldEditor.jsonError" class="json-error">{{ fieldEditor.jsonError }}</span>
              </div>
              <textarea 
                v-if="fieldEditor.fullJsonView"
                v-model="fieldEditor.fullJsonText" 
                class="json-editor field-json-editor" 
                spellcheck="false"
                @input="validateFieldJson"
              ></textarea>
              <textarea 
                v-else
                v-model="fieldEditor.jsonText" 
                class="json-editor field-json-editor" 
                spellcheck="false"
                @input="validateFieldJson"
              ></textarea>
              
              <!-- AI Edit in JSON View -->
              <div class="ai-edit-panel">
                <div class="ai-edit-input">
                  <input 
                    type="text" 
                    v-model="fieldEditor.aiPrompt" 
                    class="form-control" 
                    placeholder="Prompt for edits"
                  />
                  <button class="ai-edit-btn" @click="applyAiEdit" :disabled="fieldEditor.isAiProcessing">
                    <span v-if="!fieldEditor.isAiProcessing">✨</span>
                    <span v-else class="spinner"></span>
                  </button>
                </div>
                <span v-if="fieldEditor.aiError" class="ai-error">{{ fieldEditor.aiError }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeFieldEditor">Cancel</button>
            <button class="btn btn-primary" @click="saveFieldEditor" :disabled="!!fieldEditor.jsonError">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import Swal from 'sweetalert2' // Import SweetAlert2

// Define placeholder for missing images using a sleek SVG
const PLACEHOLDER_PORTRAIT = `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="40" cy="40" r="40" fill="#E2E8F0"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M40 48C48.8366 48 56 40.8366 56 32C56 23.1634 48.8366 16 40 16C31.1634 16 24 23.1634 24 32C24 40.8366 31.1634 48 40 48ZM40 52C51.0457 52 60 60.9543 60 72H20C20 60.9543 28.9543 52 40 52Z" fill="#A0AEC0"/> </svg>`;

// Get the webhook UUID from URL parameter, local storage, or use default
// This allows users to configure the webhook without changing code
function getWebhookUuid() {
  // Check URL parameters first (for easy testing)
  const urlParams = new URLSearchParams(window.location.search);
  const urlUuid = urlParams.get('webhook_uuid');
  if (urlUuid) {
    console.log("Using webhook UUID from URL parameter:", urlUuid);
    // Optionally save to local storage
    localStorage.setItem('webhook_uuid', urlUuid);
    return urlUuid;
  }
  
  // Then check local storage (for persistence)
  const storedUuid = localStorage.getItem('webhook_uuid');
  if (storedUuid) {
    console.log("Using webhook UUID from local storage:", storedUuid);
    return storedUuid;
  }
  
  // Default UUID
  const defaultUuid = "a5492bd0-a2b9-4e25-9de6-24e5fede1dda";
  console.log("Using default webhook UUID:", defaultUuid);
  return defaultUuid;
}

// Use a dynamic webhook UUID that can be overridden
const WEBHOOK_UUID = getWebhookUuid();

// Add this constant for the webhook base URL
const LANGFLOW_URL = "http://localhost:7860";
const FLOW_UUID = "a5492bd0-a2b9-4e25-9de6-24e5fede1dda"; // Update with the actual Flow UUID from your curl command

export default {
  name: 'AdminPage',
  setup() {
    const jsonData = ref({ phases: [], creativeTeam: {}, budgetSettings: {} })
    const originalData = ref({})
    const activeTab = ref('team') // Start on team tab for visibility
    const expandedItems = reactive({
      phase: {},
      round: {}
    })
    const isLoading = ref(false)
    const isSaving = ref(false)
    const statusMessage = ref('')
    
    // ... existing modal state ...
    const showModal = ref(false)
    const modalType = ref('')
    const modalId = ref(null)
    const modalText = ref('')
    const modalTitle = ref('')
    const modalPlaceholder = ref('')
    const currentItem = ref({})
    const currentModal = ref(null)
    const tempFormData = ref({})
    const modalData = ref(null)
    const phaseJsonView = ref(false)
    const phaseJsonText = ref('')
    const phaseJsonError = ref('')
    const phaseAiPrompt = ref('')
    const phaseAiError = ref('')
    const phaseAiProcessing = ref(false)
    const showRawJsonEditor = ref(false)
    const rawJsonText = ref('')
    const jsonError = ref('')
    const fieldEditor = ref({ show: false })

    const tabs = [
      { id: 'phases', name: 'Phases' },
      { id: 'team', name: 'Creative Team' },
      { id: 'budget', name: 'Budget Settings' }
    ]
    
    // Function to add avatarUrl to existing team members if it doesn't exist
    const ensureAvatarUrls = (data) => {
      if (data && data.creativeTeam) {
        Object.keys(data.creativeTeam).forEach(sectionKey => {
          if (Array.isArray(data.creativeTeam[sectionKey])) {
            data.creativeTeam[sectionKey].forEach(member => {
              if (member && typeof member === 'object' && !member.avatarUrl) {
                member.avatarUrl = null; // Initialize with null or an empty string
              }
            });
          }
        });
      }
    };

    onMounted(async () => {
      try {
        isLoading.value = true
        statusMessage.value = 'Loading data...'
        
        let data = null;
        try {
          const response = await fetch('http://localhost:3001/api/data')
          if (!response.ok) throw new Error('API fetch failed');
          data = await response.json()
          statusMessage.value = 'Data loaded from API'
        } catch (apiError) {
          console.warn('API not available, loading from static file:', apiError)
          const response = await fetch('/src/data/data.json')
          if (!response.ok) throw new Error('Static file fetch failed');
          data = await response.json()
          statusMessage.value = 'Data loaded from static file'
        }

        // Ensure avatarUrl exists on team members
        ensureAvatarUrls(data);
        
        jsonData.value = data
        originalData.value = JSON.parse(JSON.stringify(data))
        
        // Initialize budgetSettings if not present
        if (!jsonData.value.budgetSettings) {
          console.log("Initializing budget settings");
          jsonData.value.budgetSettings = {
            insurance_rate: 3.5,
            markup_rate: 15,
            payroll_rate: 2.75
          }
        }
        
      } catch (error) {
        console.error('Failed to load data:', error)
        statusMessage.value = 'Error loading data: ' + error.message
      } finally {
        isLoading.value = false
        setTimeout(() => { statusMessage.value = '' }, 3000)
      }
    })
    
    const loadData = async () => {
      try {
        isLoading.value = true
        statusMessage.value = 'Loading data...'
        
        // Try first to load from the API
        try {
          const response = await fetch('http://localhost:3001/api/data')
          const data = await response.json()
          jsonData.value = data
          originalData.value = JSON.parse(JSON.stringify(data)) // Deep copy for reset functionality
          statusMessage.value = 'Data loaded from API'
        } catch (apiError) {
          console.warn('API not available, loading from static file:', apiError)
          
          // Fallback to local file if API is not available
          const response = await fetch('/src/data/data.json')
          const data = await response.json()
          jsonData.value = data
          originalData.value = JSON.parse(JSON.stringify(data))
          statusMessage.value = 'Data loaded from static file (API not available)'
        }
      } catch (error) {
        console.error('Error loading data:', error)
        statusMessage.value = 'Error loading data: ' + error.message
      } finally {
        isLoading.value = false
        setTimeout(() => {
          statusMessage.value = ''
        }, 3000)
      }
    }
    
    const toggleAccordion = (type, id) => {
      expandedItems[type][id] = !expandedItems[type][id]
    }
    
    const addArrayItem = (array, defaultValue) => {
      array.push(defaultValue)
    }
    
    const removeArrayItem = (array, index) => { 
      // Add confirmation before deleting a team member
      if (array && array[index] && array[index].name) { // Check if it's likely a team member
        Swal.fire({
          title: `Delete ${array[index].name}?`,
          text: "This action cannot be undone.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            array.splice(index, 1);
            statusMessage.value = 'Item removed.';
             setTimeout(() => { statusMessage.value = '' }, 2000);
          }
        });
      } else {
         // For other arrays, remove without confirmation (or add specific checks)
        array.splice(index, 1);
      }
    }
    
    const addPhase = () => {
      const newPhaseNumber = jsonData.value.phases.length > 0 
        ? Math.max(...jsonData.value.phases.map(p => p.number)) + 1 
        : 1
        
      jsonData.value.phases.push({
        number: newPhaseNumber,
        name: `New Phase ${newPhaseNumber}`,
        displayName: `New Phase ${newPhaseNumber}`,
        enabled: true,
        core_deliverables: {
          default_enabled: []
        },
        rounds: {
          R1: {
            name: "Pre Production",
            duration_days: 5,
            deliverables: [],
            tasks: [],
            team: [],
            start_date: new Date().toISOString().split('T')[0],
            events: []
          }
        },
        stakeholders: []
      })
    }
    
    const removePhase = (index) => {
      if (confirm('Are you sure you want to delete this phase?')) {
        jsonData.value.phases.splice(index, 1)
      }
    }
    
    const addRound = (phase) => {
      // Find next round number
      const roundKeys = Object.keys(phase.rounds)
      const lastRound = roundKeys[roundKeys.length - 1]
      const nextRoundNumber = parseInt(lastRound.substring(1)) + 1
      
      phase.rounds[`R${nextRoundNumber}`] = {
        name: "New Round",
        duration_days: 5,
        deliverables: [],
        tasks: [],
        team: [],
        start_date: new Date().toISOString().split('T')[0],
        events: []
      }
    }
    
    const addEvent = (round) => {
      round.events.push({
        date: new Date().toISOString().split('T')[0],
        type: "start",
        description: "New Event",
        deliverables: [],
        team_members: []
      })
    }
    
    // Enhanced modal functionality
    const openModal = (type, data = null) => {
      currentModal.value = type
      tempFormData.value = {}
      modalData.value = data
      
      // Reset phase JSON view state
      phaseJsonView.value = false
      phaseJsonError.value = ''
      phaseAiPrompt.value = ''
      phaseAiError.value = ''
      
      if (type === 'team-member') {
          modalTitle.value = modalData.value?.index !== undefined ? 'Edit Team Member' : 'Add Team Member';
          if (modalData.value?.index !== undefined && modalData.value?.section && jsonData.value.creativeTeam[modalData.value.section]) {
               // Editing existing team member
              tempFormData.value = JSON.parse(JSON.stringify(jsonData.value.creativeTeam[modalData.value.section][modalData.value.index]));
          } else {
              // Adding new team member
              tempFormData.value = { name: '', role: '', day_rate: 0, avatarUrl: null }; // Add avatarUrl
          }
          showModal.value = true; // Use the generic modal for team members now
      } else {
         // ... rest of your existing openModal logic for other types ...
           // Reset phase JSON view state
          phaseJsonView.value = false
          phaseJsonError.value = ''
          phaseAiPrompt.value = ''
          phaseAiError.value = ''
          
          if (type === 'phase' && typeof data === 'number') {
              modalId.value = data // Store index for phase editing
              const phase = data !== -1 ? { ...jsonData.value.phases[data] } : {
                  number: jsonData.value.phases.length > 0 
                  ? Math.max(...jsonData.value.phases.map(p => p.number)) + 1 
                  : 1,
                  name: '',
                  displayName: '',
                  enabled: true,
                  // Initialize other phase properties as needed
                  core_deliverables: { default_enabled: [] },
                  rounds: { R1: { name: "Pre Production", duration_days: 5, deliverables: [], tasks: [], team: [], start_date: new Date().toISOString().split('T')[0], events: [] } },
                  stakeholders: []
              };
              currentItem.value = { ...phase, formType: 'phase' };
              modalTitle.value = data !== -1 ? `Edit Phase ${phase.number}` : 'Add New Phase';
              phaseJsonText.value = JSON.stringify(phase, null, 2);
          } 
          // ... (keep other else if blocks for round, deliverable, etc.)
          showModal.value = true;
      }
    }
    
    const closeModal = () => { 
       showModal.value = false
        modalType.value = ''
        modalId.value = null
        modalText.value = ''
        currentItem.value = {}
        currentModal.value = null
        tempFormData.value = {}
        modalData.value = null
        // Reset phase JSON view state
        phaseJsonView.value = false
        phaseJsonText.value = ''
        phaseJsonError.value = ''
        phaseAiPrompt.value = ''
        phaseAiError.value = ''
        phaseAiProcessing.value = false
     }
    const saveModalChanges = () => {
      if (currentItem.value.formType === 'phase' && phaseJsonView.value) {
        try {
          // Parse and validate the JSON
          const updatedPhase = JSON.parse(phaseJsonText.value)
          
          // Check if we're editing an existing phase or adding a new one
          if (modalId.value !== -1) {
            // Update existing phase
            jsonData.value.phases[modalId.value] = updatedPhase
          } else {
            // Add new phase
            jsonData.value.phases.push(updatedPhase)
          }
          
          statusMessage.value = 'Phase JSON updated successfully!'
          setTimeout(() => { statusMessage.value = '' }, 2000)
          
          closeModal()
          return
        } catch (error) {
          phaseJsonError.value = `Error saving: ${error.message}`
          return
        }
      }
      
      // Original form save logic
      // Handle form-based modal saves
      if (modalType.value === 'form') {
        const item = currentItem.value
        
        if (item.formType === 'phase') {
          if (modalId.value !== -1) {
            // Update existing phase
            const phase = jsonData.value.phases[modalId.value]
            phase.number = item.number
            phase.name = item.name
            phase.displayName = item.displayName
            phase.enabled = item.enabled
          } else {
            // Add new phase
            jsonData.value.phases.push({
              number: item.number,
              name: item.name,
              displayName: item.displayName,
              enabled: item.enabled,
              core_deliverables: {
                default_enabled: []
              },
              rounds: {
                R1: {
                  name: "Pre Production",
                  duration_days: 5,
                  deliverables: [],
                  tasks: [],
                  team: [],
                  start_date: new Date().toISOString().split('T')[0],
                  events: []
                }
              },
              stakeholders: []
            })
          }
        }
        else if (item.formType === 'round') {
          if (typeof modalId.value === 'string' && modalId.value.includes('-')) {
            // Update existing round
            const [phaseIndex, roundKey] = modalId.value.split('-')
            const round = jsonData.value.phases[phaseIndex].rounds[roundKey]
            round.name = item.name
            round.duration_days = item.duration_days
            round.start_date = item.start_date
          } else if (item.phaseIndex !== undefined) {
            // Add new round directly
            const phase = jsonData.value.phases[item.phaseIndex]
            // Find next round number
            const roundKeys = Object.keys(phase.rounds)
            const lastRound = roundKeys[roundKeys.length - 1]
            const nextRoundNumber = parseInt(lastRound.substring(1)) + 1
            
            phase.rounds[`R${nextRoundNumber}`] = {
              name: item.name,
              duration_days: item.duration_days,
              start_date: item.start_date,
              deliverables: [],
              tasks: [],
              team: [],
              events: []
            }
          }
        }
        else if (item.formType === 'deliverable') {
          if (item.subIndex !== undefined) {
            // Update existing deliverable
            jsonData.value.phases[item.phaseIndex].core_deliverables.default_enabled[item.subIndex] = item.name
          } else {
            // Add new deliverable
            const phase = jsonData.value.phases[item.phaseIndex]
            if (!phase.core_deliverables) {
              phase.core_deliverables = { default_enabled: [] }
            }
            if (!phase.core_deliverables.default_enabled) {
              phase.core_deliverables.default_enabled = []
            }
            phase.core_deliverables.default_enabled.push(item.name)
          }
        }
        else if (item.formType === 'stakeholder') {
          if (item.index !== undefined) {
            // Update existing stakeholder
            const stakeholder = jsonData.value.creativeTeam.stakeholders[item.index]
            stakeholder.name = item.name
            stakeholder.role = item.role
            stakeholder.company = item.company
          } else {
            // Add new stakeholder
            jsonData.value.creativeTeam.stakeholders.push({
              name: item.name,
              role: item.role,
              company: item.company
            })
          }
        }
        else if (item.formType === 'leadership') {
          if (item.index !== undefined) {
            // Update existing leadership member
            const member = jsonData.value.creativeTeam.leadership[item.index]
            member.name = item.name
            member.role = item.role
            member.email = item.email
            member.day_rate = item.day_rate
          } else {
            // Add new leadership member
            jsonData.value.creativeTeam.leadership.push({
              name: item.name,
              role: item.role,
              email: item.email,
              day_rate: item.day_rate
            })
          }
        }
        else if (item.formType === 'team') {
          if (item.index !== undefined) {
            // Update existing team member
            const member = jsonData.value.creativeTeam[item.section][item.index]
            member.name = item.name
            member.role = item.role
            member.day_rate = item.day_rate
          } else {
            // Add new team member
            jsonData.value.creativeTeam[item.section].push({
              name: item.name,
              role: item.role,
              day_rate: item.day_rate
            })
          }
        }
        else if (item.formType === 'event') {
          if (item.eventIndex !== undefined) {
            // Update existing event
            const event = jsonData.value.phases[item.phaseIndex].rounds[item.roundKey].events[item.eventIndex]
            event.date = item.date
            event.type = item.type
            event.description = item.description
            event.deliverables = item.deliverables
            event.team_members = item.team_members
            event.stakeholders = item.stakeholders
          } else {
            // Add new event
            jsonData.value.phases[item.phaseIndex].rounds[item.roundKey].events.push({
              date: item.date,
              type: item.type,
              description: item.description,
              deliverables: item.deliverables || [],
              team_members: item.team_members || [],
              stakeholders: item.stakeholders || []
            })
          }
        }
      }
      // Handle text-based modal saves (legacy)
      else {
        const lines = modalText.value.split('\n').filter(line => line.trim() !== '')
        
        if (modalType.value === 'phase') {
          const phase = jsonData.value.phases[modalId.value]
          if (lines.length > 0) phase.name = lines[0]
          if (lines.length > 1) phase.displayName = lines[1]
        }
        else if (modalType.value === 'deliverables') {
          const phase = jsonData.value.phases[modalId.value]
          if (!phase.core_deliverables) {
            phase.core_deliverables = { default_enabled: [] }
          }
          if (!phase.core_deliverables.default_enabled) {
            phase.core_deliverables.default_enabled = []
          }
          phase.core_deliverables.default_enabled = lines
        }
        else if (modalType.value === 'rounds') {
          const phase = jsonData.value.phases[modalId.value]
          const newRounds = {}
          
          lines.forEach(line => {
            const match = line.match(/^([^:]+):\s*(.+)$/)
            if (match) {
              const [, key, name] = match
              // Preserve existing round data if possible
              if (phase.rounds[key.trim()]) {
                newRounds[key.trim()] = { ...phase.rounds[key.trim()], name: name.trim() }
              } else {
                newRounds[key.trim()] = {
                  name: name.trim(),
                  duration_days: 5,
                  deliverables: [],
                  tasks: [],
                  team: [],
                  start_date: new Date().toISOString().split('T')[0],
                  events: []
                }
              }
            }
          })
          
          // Only update if we have valid data
          if (Object.keys(newRounds).length > 0) {
            phase.rounds = newRounds
          }
        }
        else if (modalType.value === 'round') {
          // For individual rounds
          const [phaseIndex, roundKey] = modalId.value.split('-')
          if (lines.length > 0) {
            jsonData.value.phases[phaseIndex].rounds[roundKey].name = lines[0]
          }
        }
        else if (modalType.value === 'stakeholders') {
          const phase = jsonData.value.phases[modalId.value]
          phase.stakeholders = lines
        }
        else if (modalType.value === 'leadership' || modalType.value === 'designers' || 
                 modalType.value === 'production' || modalType.value === 'creatives') {
          const team = []
          lines.forEach(line => {
            const parts = line.split(',').map(part => part.trim())
            if (parts.length >= 3) {
              team.push({
                name: parts[0],
                role: parts[1],
                day_rate: parseInt(parts[2]) || 0
              })
            }
          })
          if (team.length > 0) {
            jsonData.value.creativeTeam[modalType.value] = team
          }
        }
        else if (modalType.value === 'teamStakeholders') {
          const stakeholders = []
          lines.forEach(line => {
            const parts = line.split(',').map(part => part.trim())
            if (parts.length >= 2) {
              stakeholders.push({
                name: parts[0],
                role: parts[1]
              })
            }
          })
          if (stakeholders.length > 0) {
            jsonData.value.creativeTeam.stakeholders = stakeholders
          }
        }
      }
      
      closeModal()
    }
    
    const saveFormData = (type) => {
      if (type === 'team-member') {
        const section = modalData.value.section
        if (modalData.value.index !== undefined) {
          // Update existing team member
          jsonData.value.creativeTeam[section][modalData.value.index] = tempFormData.value
        } else {
          // Add new team member
          jsonData.value.creativeTeam[section].push(tempFormData.value)
        }
      }
      // ... existing code ...
      closeModal()
    }
    
    const saveData = async () => {
      try {
        isSaving.value = true
        statusMessage.value = 'Saving data...'
        
        // Try to save using the API
        try {
          const response = await fetch('http://localhost:3001/api/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData.value)
          })
          
          const result = await response.json()
          
          if (result.success) {
            statusMessage.value = 'Data saved successfully!'
            // Update originalData for reset functionality
            originalData.value = JSON.parse(JSON.stringify(jsonData.value))
          } else {
            throw new Error(result.error || 'Failed to save data')
          }
        } catch (apiError) {
          console.warn('API not available for saving:', apiError)
          statusMessage.value = 'Changes saved in memory only. API not available for permanent storage.'
          
          // Update originalData for in-memory reset functionality
          originalData.value = JSON.parse(JSON.stringify(jsonData.value))
        }
      } catch (error) {
        console.error('Error saving data:', error)
        statusMessage.value = 'Error saving data: ' + error.message
      } finally {
        isSaving.value = false
        setTimeout(() => {
          if (statusMessage.value.includes('success') || statusMessage.value.includes('memory only')) {
            statusMessage.value = ''
          }
        }, 3000)
      }
    }
    
    const resetData = () => {
      if (confirm('This will reset all changes. Continue?')) {
        jsonData.value = JSON.parse(JSON.stringify(originalData.value))
        statusMessage.value = 'Data reset to last saved state'
        setTimeout(() => {
          statusMessage.value = ''
        }, 3000)
      }
    }

    // Raw JSON editor functionality

    const formatJson = () => {
      try {
        const formattedJson = JSON.stringify(JSON.parse(rawJsonText.value), null, 2)
        rawJsonText.value = formattedJson
        jsonError.value = ''
      } catch (error) {
        jsonError.value = 'Invalid JSON format'
      }
    }

    const validateJson = () => {
      try {
        JSON.parse(rawJsonText.value)
        jsonError.value = ''
      } catch (error) {
        jsonError.value = 'Invalid JSON format'
      }
    }

    const saveRawJson = () => {
      try {
        const parsedJson = JSON.parse(rawJsonText.value)
        jsonData.value = parsedJson
        statusMessage.value = 'Raw JSON saved successfully!'
        showRawJsonEditor.value = false
      } catch (error) {
        jsonError.value = 'Error saving raw JSON'
      }
    }

    const closeRawJsonEditor = () => {
      showRawJsonEditor.value = false
      rawJsonText.value = ''
      jsonError.value = ''
    }

    const openRawJsonEditor = () => {
      showRawJsonEditor.value = true
      rawJsonText.value = JSON.stringify(jsonData.value, null, 2)
      jsonError.value = ''
    }

    // Field editor functionality
    const formatLabel = (key) => {
      return key.charAt(0).toUpperCase() + key.slice(1)
    }

    const getInputType = (value) => {
      if (typeof value === 'string') return 'text'
      if (typeof value === 'number') return 'number'
      if (typeof value === 'boolean') return 'checkbox'
      if (value instanceof Date) return 'date'
      if (Array.isArray(value)) return 'array'
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) return 'object'
      return 'text'
    }

    const removeItem = (index) => {
      fieldEditor.value.value.splice(index, 1)
      // Also update the JSON text to keep them in sync
      fieldEditor.value.jsonText = JSON.stringify(fieldEditor.value.value, null, 2)
    }

    const addFieldEditorItem = () => {
      const defaultValue = fieldEditor.value.valueType === 'object' ? {} : ''
      fieldEditor.value.value.push(defaultValue)
      // Also update the JSON text to keep them in sync
      fieldEditor.value.jsonText = JSON.stringify(fieldEditor.value.value, null, 2)
    }

    const editNestedObject = (key, value) => {
      // Clone the object to avoid reference issues
      fieldEditor.value.value = JSON.parse(JSON.stringify(value))
      // Update the JSON text to reflect the new focus
      fieldEditor.value.jsonText = JSON.stringify(fieldEditor.value.value, null, 2)
    }

    const editNestedArray = (key, value) => {
      // Clone the array to avoid reference issues
      fieldEditor.value.value = JSON.parse(JSON.stringify(value))
      // Update the JSON text to reflect the new focus
      fieldEditor.value.jsonText = JSON.stringify(fieldEditor.value.value, null, 2)
    }

    const saveFieldEditor = () => {
      try {
        // If in JSON view, parse the JSON text and update the value
        if (fieldEditor.value.jsonView) {
          if (fieldEditor.value.fullJsonView && fieldEditor.value.fullItem) {
            // We're editing the full hierarchical JSON
            const parsedJson = JSON.parse(fieldEditor.value.fullJsonText)
            const { path } = fieldEditor.value
            const { index, section } = path
            
            // Update the appropriate object in the data structure
            if (section === 'phases') {
              // Replace the entire phase object with the edited JSON
              jsonData.value.phases[index] = parsedJson
            } else if (section === 'creativeTeam') {
              if (parent) {
                jsonData.value.creativeTeam[parent] = parsedJson
              } else {
                jsonData.value.creativeTeam = parsedJson
              }
            }
            
            // Success message and close
            statusMessage.value = 'Full JSON updated successfully!'
            setTimeout(() => {
              statusMessage.value = ''
            }, 2000)
            
            closeFieldEditor()
            return // Exit early since we've handled the update
          } else {
            // We're just editing the specific field (original behavior)
            fieldEditor.value.value = JSON.parse(fieldEditor.value.jsonText)
          }
        }
        
        // Only apply the specific field change if we're not in full JSON mode
        const { path, value } = fieldEditor.value
        const { field, index, section, parent } = path
        
        if (parent) {
          // Handle nested fields
          if (section === 'phases') {
            if (parent === 'core_deliverables') {
              jsonData.value.phases[index].core_deliverables[field] = value
            } else if (parent.startsWith('rounds.')) {
              const roundKey = parent.split('.')[1]
              jsonData.value.phases[index].rounds[roundKey][field] = value
            }
          } else if (section === 'creativeTeam') {
            jsonData.value.creativeTeam[parent][index][field] = value
          }
        } else {
          // Handle top-level fields
          if (section === 'phases') {
            jsonData.value.phases[index][field] = value
          } else if (section === 'creativeTeam') {
            jsonData.value.creativeTeam[field] = value
          }
        }
        
        statusMessage.value = 'Field updated successfully!'
        setTimeout(() => {
          statusMessage.value = ''
        }, 2000)
        
        closeFieldEditor()
      } catch (error) {
        fieldEditor.value.jsonError = `Error saving: ${error.message}`
      }
    }

    const closeFieldEditor = () => {
      fieldEditor.value.show = false
      fieldEditor.value.value = ''
    }

    const editField = (field, value, type, label, index, section, parent = null) => {
      const jsonValue = JSON.parse(JSON.stringify(value)) // Deep clone to avoid direct reference
      
      // Get the full item hierarchy for this field
      let fullItem = null
      if (section === 'phases') {
        // Always get the full phase object for any field within phases
        fullItem = JSON.parse(JSON.stringify(jsonData.value.phases[index]))
      } else if (section === 'creativeTeam') {
        if (parent) {
          fullItem = JSON.parse(JSON.stringify(jsonData.value.creativeTeam[parent]))
        } else {
          fullItem = JSON.parse(JSON.stringify(jsonData.value.creativeTeam))
        }
      }
      
      fieldEditor.value = {
        show: true,
        title: `Edit ${label}`,
        label,
        value: jsonValue,
        type,
        path: { field, index, section, parent },
        valueType: Array.isArray(value) ? (value.length > 0 ? typeof value[0] : 'string') : typeof value,
        jsonView: false, // Start with form view by default
        jsonText: JSON.stringify(jsonValue, null, 2),
        jsonError: '',
        aiPrompt: '',
        aiError: '',
        isAiProcessing: false,
        fullJsonView: false,
        fullJsonText: JSON.stringify(fullItem, null, 2),
        fullItem: fullItem
      }
    }

    const toggleFieldEditorView = () => {
      fieldEditor.value.jsonView = !fieldEditor.value.jsonView
    }

    const toggleFullJsonView = () => {
      fieldEditor.value.fullJsonView = !fieldEditor.value.fullJsonView
    }

    const formatFieldJson = () => {
      try {
        if (fieldEditor.value.fullJsonView) {
          const formattedJson = JSON.stringify(JSON.parse(fieldEditor.value.fullJsonText), null, 2)
          fieldEditor.value.fullJsonText = formattedJson
        } else {
          const formattedJson = JSON.stringify(JSON.parse(fieldEditor.value.jsonText), null, 2)
          fieldEditor.value.jsonText = formattedJson
        }
        fieldEditor.value.jsonError = ''
      } catch (error) {
        fieldEditor.value.jsonError = 'Invalid JSON format'
      }
    }

    const validateFieldJson = () => {
      try {
        if (fieldEditor.value.fullJsonView) {
          JSON.parse(fieldEditor.value.fullJsonText)
        } else {
          JSON.parse(fieldEditor.value.jsonText)
        }
        fieldEditor.value.jsonError = ''
      } catch (error) {
        fieldEditor.value.jsonError = 'Invalid JSON format'
      }
    }

    // Function to get OpenAI API key
    const getOpenAiKey = () => {
      if (!openAiKey.value) {
        openAiKey.value = promptForApiKey()
      }
      return openAiKey.value
    }

    // Replace or remove the pollForWebhookResult function since we're now using direct calls
    const pollForWebhookResult = async (onComplete, onError, attemptLimit = 30, interval = 2000) => {
      // This function is no longer needed with direct Langflow calls
      console.log("Warning: pollForWebhookResult called but direct Langflow calls don't need polling");
      
      // Just call the onComplete with an error to prevent hanging UI
      onError("Direct Langflow calls don't need polling. Please refresh and try again.");
    };

    // Replace the applyAiEdit function
    const applyAiEdit = async () => {
      if (!fieldEditor.value.aiPrompt.trim()) {
        fieldEditor.value.aiError = 'Please enter a prompt';
        return;
      }
      
      try {
        fieldEditor.value.isAiProcessing = true;
        fieldEditor.value.aiError = '';
        
        // Get the current JSON data being viewed
        let jsonData;
        if (fieldEditor.value.jsonView) {
          try {
            if (fieldEditor.value.fullJsonView) {
              jsonData = JSON.parse(fieldEditor.value.fullJsonText);
            } else {
              jsonData = JSON.parse(fieldEditor.value.jsonText);
            }
          } catch (e) {
            fieldEditor.value.aiError = 'Invalid JSON format in the editor';
            fieldEditor.value.isAiProcessing = false;
            return;
          }
        } else {
          // If in form view, use the current value
          jsonData = fieldEditor.value.value;
        }
        
        // Update the UI to show processing
        statusMessage.value = "Sending request to AI service...";
        
        // Create payload with proper format for Langflow
        const payload = {
          "user_prompt": fieldEditor.value.aiPrompt,
          "json_snippet": jsonData,
          "full_json": jsonData,
          "session_id": "user_edit_" + Date.now()
        };
        
        // Format options as shown in the example
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };
        
        console.log("Sending AI edit request with payload:", payload);
        const response = await fetch(`${LANGFLOW_URL}/api/v1/webhook/${FLOW_UUID}`, options);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const initialResult = await response.json();
        console.log("Received initial response from Langflow:", initialResult);
        
        // Check if we need to poll for results
        if (initialResult.status === "in progress" || initialResult.message === "Task started in the background") {
          statusMessage.value = "Processing your AI request...";
          
          // Poll for results
          let resultData = null;
          let attempts = 0;
          const maxAttempts = 30;
          const sessionId = payload.session_id;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
            
            try {
              // We need proper headers for Langflow's webhook API
              const pollResponse = await fetch(`${LANGFLOW_URL}/api/v1/webhook/${FLOW_UUID}?session_id=${sessionId}`, {
                method: 'GET',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Session-ID': sessionId
                }
              });
              
              if (pollResponse.ok) {
                const responseText = await pollResponse.text();
                console.log("Raw poll response:", responseText);
                
                // Try to parse the response as JSON
                try {
                  const pollResult = JSON.parse(responseText);
                  console.log("Poll result:", pollResult);
                  
                  // Check if we have a result and it's not still processing
                  if (pollResult && typeof pollResult === 'object' && pollResult.status !== "in_progress") {
                    resultData = pollResult;
                    break;
                  }
                } catch (jsonError) {
                  console.error("Error parsing response as JSON:", jsonError);
                  // Continue polling
                }
              } else {
                console.error(`Poll response not OK: ${pollResponse.status} ${pollResponse.statusText}`);
              }
            } catch (pollError) {
              console.error("Error polling for results:", pollError);
            }
            
            attempts++;
          }
          
          if (!resultData) {
            throw new Error("Timed out waiting for AI results");
          }
          
          // Process the result
          console.log("Final AI result:", resultData);
          processAiResult(resultData);
        } else {
          // We already have our result
          processAiResult(initialResult);
        }
        
        // Show success message
        statusMessage.value = 'AI edits applied successfully!';
        setTimeout(() => { statusMessage.value = ''; }, 3000);
        
        // Clear error and processing state
        fieldEditor.value.isAiProcessing = false;
        fieldEditor.value.aiError = '';
      } catch (error) {
        console.error("AI edit error:", error);
        fieldEditor.value.aiError = `Error: ${error.message}`;
        fieldEditor.value.isAiProcessing = false;
        statusMessage.value = '';
      }
    };
    
    // Helper function to process AI results
    const processAiResult = (result) => {
      // Process the result based on whether it's a string or object
      let processedResult;
      
      console.log("Processing AI result:", result);
      
      // Check if the result contains the data directly or in a result property
      if (result.json_delta) {
        processedResult = result.json_delta;
      } else if (result.result) {
        processedResult = result.result;
      } else if (typeof result === 'string') {
        // If the result is a string, try to parse it as JSON
        try {
          processedResult = JSON.parse(result);
        } catch (e) {
          // If it's not valid JSON, check if it's a text response from the LLM
          // that contains a JSON object within it (common with AI responses)
          try {
            const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
                          result.match(/```\s*([\s\S]*?)\s*```/) ||
                          result.match(/{[\s\S]*?}/);
                          
            if (jsonMatch && jsonMatch[1]) {
              processedResult = JSON.parse(jsonMatch[1]);
            } else {
              throw new Error("Could not extract JSON from response");
            }
          } catch (extractErr) {
            fieldEditor.value.aiError = 'Could not parse AI response as JSON. Please try a different prompt.';
            fieldEditor.value.isAiProcessing = false;
            return;
          }
        }
      } else {
        // Otherwise, use the object as is
        processedResult = result;
      }
      
      console.log("Processed result:", processedResult);
      
      // Update the field editor with the result
      if (fieldEditor.value.jsonView) {
        if (fieldEditor.value.fullJsonView) {
          fieldEditor.value.fullJsonText = JSON.stringify(processedResult, null, 2);
        } else {
          fieldEditor.value.jsonText = JSON.stringify(processedResult, null, 2);
          fieldEditor.value.value = processedResult;
        }
      } else {
        fieldEditor.value.value = processedResult;
        fieldEditor.value.jsonText = JSON.stringify(processedResult, null, 2);
      }
    };

    // Add a function to prompt the user for their OpenAI API key if not found
    const promptForApiKey = () => {
      const storedKey = localStorage.getItem('openai_api_key')
      
      if (!storedKey) {
        const apiKey = prompt('Please enter your OpenAI API key to enable AI editing:')
        if (apiKey) {
          localStorage.setItem('openai_api_key', apiKey)
          return apiKey
        }
      }
      
      return storedKey
    }

    // Add the new functions for phase JSON editing
    const togglePhaseJsonView = () => {
      phaseJsonView.value = !phaseJsonView.value
    }
    
    const formatPhaseJson = () => {
      try {
        const formattedJson = JSON.stringify(JSON.parse(phaseJsonText.value), null, 2)
        phaseJsonText.value = formattedJson
        phaseJsonError.value = ''
      } catch (error) {
        phaseJsonError.value = 'Invalid JSON format'
      }
    }
    
    const validatePhaseJson = () => {
      try {
        JSON.parse(phaseJsonText.value)
        phaseJsonError.value = ''
      } catch (error) {
        phaseJsonError.value = 'Invalid JSON format'
      }
    }
    
    // Replace the applyPhaseAiEdit function
    const applyPhaseAiEdit = async () => {
      if (!phaseAiPrompt.value.trim()) {
        phaseAiError.value = 'Please enter a prompt';
        return;
      }
      
      try {
        phaseAiProcessing.value = true;
        phaseAiError.value = '';
        
        // Parse the phase JSON text to a JSON object
        let phaseData;
        try {
          phaseData = JSON.parse(phaseJsonText.value);
        } catch (e) {
          phaseAiError.value = 'Invalid JSON format in the editor';
          phaseAiProcessing.value = false;
          return;
        }
        
        // Update the UI to show processing
        statusMessage.value = "Sending request to AI service...";
        
        // Create payload with proper format for Langflow
        const payload = {
          "user_prompt": phaseAiPrompt.value,
          "json_snippet": phaseData,
          "full_json": phaseData,
          "session_id": "user_phase_" + Date.now()
        };
        
        // Format options for the request
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };
        
        console.log("Sending phase AI edit request with payload:", payload);
        const response = await fetch(`${LANGFLOW_URL}/api/v1/webhook/${FLOW_UUID}`, options);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const initialResult = await response.json();
        console.log("Received initial response from Langflow:", initialResult);
        
        // Check if we need to poll for results
        if (initialResult.status === "in progress" || initialResult.message === "Task started in the background") {
          statusMessage.value = "Processing your AI request...";
          
          // Poll for results
          let resultData = null;
          let attempts = 0;
          const maxAttempts = 30;
          const sessionId = payload.session_id;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
            
            try {
              // We need proper headers for Langflow's webhook API
              const pollResponse = await fetch(`${LANGFLOW_URL}/api/v1/webhook/${FLOW_UUID}?session_id=${sessionId}`, {
                method: 'GET',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'X-Session-ID': sessionId
                }
              });
              
              if (pollResponse.ok) {
                const responseText = await pollResponse.text();
                console.log("Raw poll response:", responseText);
                
                // Try to parse the response as JSON
                try {
                  const pollResult = JSON.parse(responseText);
                  console.log("Poll result:", pollResult);
                  
                  // Check if we have a result and it's not still processing
                  if (pollResult && typeof pollResult === 'object' && pollResult.status !== "in_progress") {
                    resultData = pollResult;
                    break;
                  }
                } catch (jsonError) {
                  console.error("Error parsing response as JSON:", jsonError);
                  // Continue polling
                }
              } else {
                console.error(`Poll response not OK: ${pollResponse.status} ${pollResponse.statusText}`);
              }
            } catch (pollError) {
              console.error("Error polling for results:", pollError);
            }
            
            attempts++;
          }
          
          if (!resultData) {
            throw new Error("Timed out waiting for AI results");
          }
          
          // Process the result
          processPhaseAiResult(resultData);
        } else {
          // We already have our result
          processPhaseAiResult(initialResult);
        }
        
        // Show success message
        statusMessage.value = 'AI edits applied successfully!';
        setTimeout(() => { statusMessage.value = ''; }, 3000);
        
        // Clear error and processing state
        phaseAiProcessing.value = false;
        phaseAiError.value = '';
      } catch (error) {
        console.error("AI edit error:", error);
        phaseAiError.value = `Error: ${error.message}`;
        phaseAiProcessing.value = false;
        statusMessage.value = '';
      }
    };
    
    // Helper function to process Phase AI results
    const processPhaseAiResult = (result) => {
      // Process the result based on whether it's a string or object
      let processedResult;
      
      console.log("Processing Phase AI result:", result);
      
      // Check if the result contains the data directly or in a result property
      if (result.json_delta) {
        processedResult = result.json_delta;
      } else if (result.result) {
        processedResult = result.result;
      } else if (typeof result === 'string') {
        // If the result is a string, try to parse it as JSON
        try {
          processedResult = JSON.parse(result);
        } catch (e) {
          // If it's not valid JSON, check if it's a text response from the LLM
          // that contains a JSON object within it (common with AI responses)
          try {
            const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
                          result.match(/```\s*([\s\S]*?)\s*```/) ||
                          result.match(/{[\s\S]*?}/);
                          
            if (jsonMatch && jsonMatch[1]) {
              processedResult = JSON.parse(jsonMatch[1]);
            } else {
              throw new Error("Could not extract JSON from response");
            }
          } catch (extractErr) {
            phaseAiError.value = 'Could not parse AI response as JSON. Please try a different prompt.';
            phaseAiProcessing.value = false;
            return;
          }
        }
      } else {
        // Otherwise, use the object as is
        processedResult = result;
      }
      
      console.log("Processed phase result:", processedResult);
      
      // Update the phase JSON text
      phaseJsonText.value = JSON.stringify(processedResult, null, 2);
    };

    // Helper function to get assignment info for team members
    const getAssignmentInfo = (role) => {
      let assignments = []
      let totalDays = 0
      
      // Safety check: Ensure phases exist
      if (!jsonData.value?.phases) {
        return 'Not currently assigned'
      }
      
      // Loop through all phases
      jsonData.value.phases.forEach(phase => {
        if (!phase.enabled || !phase.rounds) return
        
        // Check each round for team members with this role
        Object.values(phase.rounds).forEach(round => {
          if (!round.team) return
          
          const matchingMembers = round.team.filter(member => member.role === role)
          
          if (matchingMembers.length > 0) {
            assignments.push(`${phase.displayName} - ${round.name} (${round.duration_days} days)`)
            totalDays += round.duration_days
          }
        })
      })
      
      if (assignments.length === 0) {
        return 'Not currently assigned'
      }
      
      return `${assignments.join(', ')} - Total: ${totalDays} days`
    }

    // Computed properties for budget settings
    const insuranceRate = computed({
      get() {
        return jsonData.value.budgetSettings?.insurance_rate || 0
      },
      set(val) {
        if (!jsonData.value.budgetSettings) {
          jsonData.value.budgetSettings = {}
        }
        jsonData.value.budgetSettings.insurance_rate = val
      }
    })
    
    const markupRate = computed({
      get() {
        return jsonData.value.budgetSettings?.markup_rate || 0
      },
      set(val) {
        if (!jsonData.value.budgetSettings) {
          jsonData.value.budgetSettings = {}
        }
        jsonData.value.budgetSettings.markup_rate = val
      }
    })
    
    const payrollRate = computed({
      get() {
        return jsonData.value.budgetSettings?.payroll_rate || 0
      },
      set(val) {
        if (!jsonData.value.budgetSettings) {
          jsonData.value.budgetSettings = {}
        }
        jsonData.value.budgetSettings.payroll_rate = val
      }
    })

    // Initialize expandedAssignments to track expanded/collapsed state
    const expandedAssignments = reactive({})
    
    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      } catch (e) {
        return dateString
      }
    }
    
    // Calculate end date based on start date and duration
    const calculateEndDate = (startDate, durationDays) => {
      if (!startDate) return null
      
      try {
        const date = new Date(startDate)
        date.setDate(date.getDate() + durationDays - 1) // -1 because the start day counts as a working day
        return date.toISOString().split('T')[0]
      } catch (e) {
        return null
      }
    }

    // Get Overall Date Range for a Role
    const getOverallDates = (role) => {
      let earliestStart = null;
      let latestEnd = null;

      if (jsonData.value?.phases) {
        jsonData.value.phases.forEach(phase => {
          if (!phase.enabled || !phase.rounds) return;

          Object.values(phase.rounds).forEach(round => {
            if (!round.team) return;

            const isAssigned = round.team.some(member => member.role === role);
            if (isAssigned) {
              const roundStartDate = round.start_date ? new Date(round.start_date) : null;
              const roundEndDate = calculateEndDate(round.start_date, round.duration_days);
              const roundEndDateObj = roundEndDate ? new Date(roundEndDate) : null;

              if (roundStartDate) {
                if (!earliestStart || roundStartDate < new Date(earliestStart)) {
                  earliestStart = round.start_date;
                }
              }
              if (roundEndDateObj) {
                if (!latestEnd || roundEndDateObj > new Date(latestEnd)) {
                  latestEnd = roundEndDate;
                }
              }
            }
          });
        });
      }
      return { earliestStart, latestEnd };
    }

    // Get Booking Status
    const getBookingStatus = (role) => {
      const { earliestStart, latestEnd } = getOverallDates(role);
      if (!earliestStart || !latestEnd) {
        return { text: 'Not Booked', class: 'status-not-booked' };
      }

      const today = new Date();
      const startDate = new Date(earliestStart);
      const endDate = new Date(latestEnd);
      // Adjust end date to be inclusive (end of the day)
      endDate.setHours(23, 59, 59, 999);


      if (today < startDate) {
        return { text: 'Upcoming', class: 'status-upcoming' };
      } else if (today >= startDate && today <= endDate) {
        return { text: 'Active', class: 'status-active' };
      } else {
        return { text: 'Completed', class: 'status-completed' };
      }
    }
    
    // Toggle assignment details expanded/collapsed
    const toggleAssignmentDetails = (role, index) => {
      if (!expandedAssignments[role]) {
        expandedAssignments[role] = {}
      }
      
      expandedAssignments[role][index] = !expandedAssignments[role][index]
    }
    
    // Check if assignment is expanded
    const isAssignmentExpanded = (role, index) => {
      return expandedAssignments[role] && expandedAssignments[role][index]
    }
    
    // Get the total days assigned for a role
    const getTotalDays = (role) => {
      if (!jsonData.value?.phases) {
        return 0
      }
      
      let totalDays = 0
      
      jsonData.value.phases.forEach(phase => {
        if (!phase.enabled || !phase.rounds) return
        
        Object.values(phase.rounds).forEach(round => {
          if (!round.team) return
          
          const matchingMembers = round.team.filter(member => member.role === role)
          
          if (matchingMembers.length > 0) {
            totalDays += round.duration_days
          }
        })
      })
      
      return totalDays
    }
    
    // Check if a role has any assignments
    const hasAssignments = (role) => {
      return getTotalDays(role) > 0
    }
    
    // Get detailed assignment info including phases, rounds, tasks, deliverables and dates
    const getDetailedAssignments = (role) => {
      if (!jsonData.value?.phases) {
        return []
      }
      
      // Create an object to group assignments by phase
      let assignmentsByPhase = {}
      
      jsonData.value.phases.forEach(phase => {
        if (!phase.enabled || !phase.rounds) return
        
        let phaseHasAssignments = false
        let phaseAssignment = {
          phaseId: phase.number,
          phase: phase.displayName,
          totalDays: 0,
          rounds: [],
          earliest: null,
          latest: null
        }
        
        Object.entries(phase.rounds).forEach(([roundKey, round]) => {
          if (!round.team) return
          
          const matchingMembers = round.team.filter(member => member.role === role)
          
          if (matchingMembers.length > 0) {
            phaseHasAssignments = true
            phaseAssignment.totalDays += round.duration_days
            
            const startDate = round.start_date ? new Date(round.start_date) : null
            const endDate = calculateEndDate(round.start_date, round.duration_days)
            const endDateObj = endDate ? new Date(endDate) : null
            
            // Track earliest and latest dates for the *phase*
            if (startDate) {
              if (!phaseAssignment.earliest || startDate < new Date(phaseAssignment.earliest)) {
                phaseAssignment.earliest = round.start_date
              }
            }
            
            if (endDateObj) {
              if (!phaseAssignment.latest || endDateObj > new Date(phaseAssignment.latest)) {
                phaseAssignment.latest = endDate
              }
            }
            
            phaseAssignment.rounds.push({
              key: roundKey,
              name: round.name,
              days: round.duration_days,
              startDate: round.start_date,
              endDate: endDate,
              tasks: round.tasks || [],
              deliverables: round.deliverables || []
            })
          }
        })
        
        if (phaseHasAssignments) {
          // Sort rounds by start date
          phaseAssignment.rounds.sort((a, b) => {
            if (!a.startDate) return 1
            if (!b.startDate) return -1
            return new Date(a.startDate) - new Date(b.startDate)
          })
          
          assignmentsByPhase[phase.number] = phaseAssignment
        }
      })
      
      // Convert to array and sort by phase number
      let detailedAssignments = Object.values(assignmentsByPhase).sort((a, b) => a.phaseId - b.phaseId)
      
      return detailedAssignments
    }

    // --- Start of Photo Upload Logic ---
    const uploadProfilePhoto = async (member, section, index) => {
      const { value: file } = await Swal.fire({
        title: `Update photo for ${member.name}`,
        input: 'file',
        inputAttributes: {
          'accept': 'image/*',
          'aria-label': 'Upload a profile picture'
        },
        showCancelButton: true,
        confirmButtonText: 'Upload & Save',
        showLoaderOnConfirm: true,
        customClass: {
          confirmButton: 'btn btn-primary', // Use existing button styles
          cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false, // Use custom classes
        preConfirm: (file) => {
          return new Promise((resolve) => {
            if (!file) {
              Swal.showValidationMessage('Please select an image file.');
              resolve();
              return;
            }
            if (file.size > 2 * 1024 * 1024) { // Limit size (e.g., 2MB)
                Swal.showValidationMessage('Image size should not exceed 2MB.');
                 resolve();
                 return;
            }
            
            // Read the file as Data URL for preview/immediate update
            const reader = new FileReader();
            reader.onload = (e) => {
              // In a real app, you would typically upload the file *here*
              // and get back the URL from the server.
              // For this example, we'll use the Data URL directly.
              resolve(e.target.result);
            };
             reader.onerror = (e) => {
                console.error("File reading error:", e);
                Swal.showValidationMessage(`Error reading file: ${e}`);
                resolve();
            };
            reader.readAsDataURL(file);
          });
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (file) {
        // Update the jsonData directly
        // This assumes member object is reactive or part of jsonData.value
        if (jsonData.value.creativeTeam[section] && jsonData.value.creativeTeam[section][index]) {
           jsonData.value.creativeTeam[section][index].avatarUrl = file; // file is the Data URL here
        
            // Trigger save immediately after successful upload
            await saveData(); // Assumes saveData handles errors and status messages

            Swal.fire({
                title: 'Photo Updated!',
                text: `Photo for ${member.name} saved successfully.`, // Update message
                icon: 'success',
                timer: 1500, // Auto-close timer
                showConfirmButton: false
            });
        } else {
             console.error("Could not find member to update:", section, index);
             Swal.fire('Error', 'Could not update member data.', 'error');
        }
      } else if (file === null) {
         // Handle case where user removed the photo (optional)
         // Maybe set avatarUrl back to null?
      }
    };
    // --- End of Photo Upload Logic ---

    // Get the stored encryption key from localStorage or generate a new one
    const getStoredEncryptionKey = () => {
      let storedKey = localStorage.getItem('encryptionKey')
      
      if (!storedKey) {
        storedKey = crypto.randomUUID()
        localStorage.setItem('encryptionKey', storedKey)
      }
      
      return storedKey
    }

    // Update the testWebhook function to use the Langflow format
    const testWebhook = async () => {
      try {
        statusMessage.value = 'Testing webhook connection...';
        console.log("Testing webhook at:", `${LANGFLOW_URL}/api/v1/run/${FLOW_UUID}`);
        
        // Show testing modal
        Swal.fire({
          title: 'Testing Webhook',
          html: `<div>Sending request to Langflow endpoint:</div>
                 <div style="font-family:monospace;margin:8px 0;word-break:break-all;font-size:0.8em;">${LANGFLOW_URL}/api/v1/run/${FLOW_UUID}</div>`,
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Create a test JSON object
        const testJson = {
          name: "Test Object",
          type: "webhook_test",
          properties: {
            description: "This is a test JSON object",
            timestamp: new Date().toISOString()
          }
        };
        
        // Create payload with prompt and JSON data as a nested object
        const payload = {
          "input_value": {
            prompt: "This is a test webhook call. Please analyze the attached JSON.",
            json_data: testJson
          },
          "output_type": "chat",
          "input_type": "text",
          "session_id": "test_webhook_" + Date.now()
        };
        
        // Format options as shown in the example
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };
        
        // Send request using fetch as per the example
        console.log("Sending webhook test request with payload:", payload);
        const response = await fetch(`${LANGFLOW_URL}/api/v1/run/${FLOW_UUID}`, options);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        console.log("Received response from Langflow:", result);
        
        // Close loading dialog
        Swal.close();
        
        // Show success message with response data
        Swal.fire({
          title: 'Webhook Test Successful',
          html: `<div>Response received:</div>
                 <pre style="text-align:left;background:#f5f5f5;padding:10px;margin-top:10px;max-height:300px;overflow:auto">${JSON.stringify(result, null, 2)}</pre>`,
          icon: 'success'
        });
        
        statusMessage.value = 'Webhook test successful!';
        setTimeout(() => { statusMessage.value = ''; }, 3000);
        
      } catch (error) {
        console.error("Webhook test error:", error);
        
        // Close any open Swal
        Swal.close();
        
        // More informative error dialog
        Swal.fire({
          title: 'Webhook Test Failed',
          html: `<div style="color:#d32f2f;">${error.message}</div>
                 <div style="margin-top:15px;font-size:0.9em;">
                   <p><strong>Troubleshooting:</strong></p>
                   <ul style="text-align:left;margin-top:5px">
                     <li>Make sure the webhook server is running at: <code>${LANGFLOW_URL}</code></li>
                     <li>Check that the webhook UUID is correct: <code>${FLOW_UUID}</code></li>
                     <li>Verify the webhook endpoint path: <code>/api/v1/run/[UUID]</code></li>
                     <li>Check the server console for any errors</li>
                   </ul>
                 </div>`,
          icon: 'error'
        });
        
        statusMessage.value = `Webhook test failed: ${error.message}`;
      }
    };

    return {
      jsonData,
      activeTab,
      tabs,
      expandedItems,
      isLoading,
      isSaving,
      statusMessage,
      showModal,
      modalType,
      modalText,
      modalTitle,
      modalPlaceholder,
      currentItem,
      currentModal,
      tempFormData,
      modalData,
      toggleAccordion,
      addArrayItem,
      removeArrayItem,
      addPhase,
      removePhase,
      addRound,
      addEvent,
      openModal,
      closeModal,
      saveModalChanges,
      saveData,
      resetData,
      saveFormData,
      showRawJsonEditor,
      rawJsonText,
      jsonError,
      formatJson,
      validateJson,
      saveRawJson,
      closeRawJsonEditor,
      openRawJsonEditor,
      fieldEditor,
      formatLabel,
      getInputType,
      removeItem,
      addFieldEditorItem,
      editNestedObject,
      editNestedArray,
      saveFieldEditor,
      closeFieldEditor,
      editField,
      toggleFieldEditorView,
      toggleFullJsonView,
      formatFieldJson,
      validateFieldJson,
      applyAiEdit,
      processAiResult,
      promptForApiKey,
      phaseJsonView,
      phaseJsonText,
      phaseJsonError,
      phaseAiPrompt,
      phaseAiError,
      phaseAiProcessing,
      togglePhaseJsonView,
      formatPhaseJson,
      validatePhaseJson,
      applyPhaseAiEdit,
      processPhaseAiResult,
      insuranceRate,
      markupRate,
      payrollRate,
      formatDate,
      calculateEndDate,
      toggleAssignmentDetails,
      isAssignmentExpanded,
      getTotalDays,
      hasAssignments,
      getDetailedAssignments,
      expandedAssignments,
      getOverallDates,
      getBookingStatus,
      // Add the new items needed by the template
      PLACEHOLDER_PORTRAIT,
      uploadProfilePhoto,
      getStoredEncryptionKey,
      testWebhook  // Make sure testWebhook is included here
    }
  }
}
</script>

<style>
:root {
  --primary: #4361ee;
  --primary-light: #4895ef;
  --primary-dark: #3f37c9;
  --success: #4cc9f0;
  --danger: #f72585;
  --warning: #f77f00;
  --dark-bg: #0a0a0b;
  --card-bg: #18181b;
  --card-bg-light: #222226; /* Add the missing card-bg-light variable */
  --input-bg: #27272a;
  --border-color: #3f3f46;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --radius: 8px;
  --transition: all 0.2s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.admin-page {
  min-height: 100vh;
  padding: 0;
  color: var(--text-primary);
  background-color: var(--dark-bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.admin-header {
  padding: 1.5rem 2rem;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.admin-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  background-color: var(--card-bg);
  padding: 0 2rem;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: var(--transition);
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary-light);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-light);
}

.content-container {
  max-width: 100%;
}

.tab-content {
  padding: 2rem;
}

.header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-with-actions h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.phase-list {
  display: grid;
  gap: 1.5rem;
}

.phase-card {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.phase-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(to right, var(--primary-dark), var(--primary));
  color: white;
  cursor: pointer;
  transition: var(--transition);
}

.phase-card-header:hover {
  background: linear-gradient(to right, var(--primary), var(--primary-light));
}

.phase-card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.phase-card-content {
  padding: 1.5rem;
}

.phase-info {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background-color: var(--input-bg);
  color: var(--text-primary);
  transition: var(--transition);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.25);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3, .section-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.data-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background-color: var(--input-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.data-card-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-card-actions {
  display: flex;
  gap: 0.5rem;
}

.round-card {
  background-color: var(--input-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: var(--transition);
}

.round-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.round-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(72, 149, 239, 0.1);
  cursor: pointer;
  transition: var(--transition);
}

.round-card-header:hover {
  background-color: rgba(72, 149, 239, 0.15);
}

.round-card-header h5 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.round-card-content {
  padding: 1rem;
}

.tag-section {
  margin-bottom: 1rem;
}

.tag-section h6 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(72, 149, 239, 0.1);
  border-radius: 4px;
  font-size: 0.875rem;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
}

.tag-remove:hover {
  color: var(--danger);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.team-section {
  margin-bottom: 1.5rem;
}

.member-card {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--input-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.member-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.member-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.member-info .rate {
  font-weight: 500;
  color: var(--success);
}

/* Button styles */
.btn {
  padding: 0.625rem 1rem;
  font-size: 0.95rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--input-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--card-bg);
}

.btn-add {
  background-color: var(--success);
  color: white;
}

.btn-add:hover {
  background-color: #3db8dd;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  margin-top: 1rem;
}

.btn-danger:hover {
  background-color: #e1146e;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.btn-icon:hover {
  background-color: var(--primary);
  color: white;
  transform: translateY(-1px);
}

.btn-icon-danger:hover {
  background-color: var(--danger);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-message {
  padding: 0.5rem 1rem;
  background-color: var(--input-bg);
  border-radius: var(--radius);
  font-size: 0.875rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(to right, var(--primary-dark), var(--primary));
  color: white;
}

.modal-header h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .admin-header {
    padding: 1rem;
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .form-row, .card-grid, .team-grid {
    grid-template-columns: 1fr;
  }
}

/* JSON Editor Styles */
.raw-json-editor {
  max-width: 900px;
  width: 90%;
}

.json-editor {
  width: 100%;
  min-height: 400px;
  font-family: monospace;
  padding: 0.75rem;
  background-color: var(--input-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  tab-size: 2;
}

.json-editor:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.25);
}

.json-editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.json-error {
  color: var(--danger);
  font-size: 0.875rem;
}

/* Field Editor Styles */
.array-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-toggle-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.view-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.field-json-editor {
  min-height: 200px;
}

.json-view-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.array-item-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.1);
}

.object-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.flex-grow {
  flex-grow: 1;
  flex-basis: 0;
}

/* Field edit buttons */
.field-edit-btn {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.field-edit-btn:hover {
  background-color: var(--primary);
  color: white;
}

.edit-field-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-field-wrapper .form-control {
  flex: 1;
}

.ai-edit-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ai-edit-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-edit-input .form-control {
  flex: 1;
}

.ai-edit-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.ai-edit-btn:hover {
  background-color: var(--primary-dark);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-error {
  color: var(--danger);
  font-size: 0.875rem;
}

/* Budget section styles */
.budget-member-card {
  align-items: center; /* Vertically align items */
  gap: 1rem;
}

.budget-rate-group {
  margin-bottom: 0; /* Remove bottom margin for inline layout */
  min-width: 120px; /* Give rate input some minimum space */
}

.budget-rate-group .edit-field-wrapper {
  align-items: baseline; /* Align input and text better */
}

.rate-input {
  max-width: 80px; /* Limit width of rate input */
  text-align: right;
  padding-right: 0.25rem; /* Add a little space before '/ day' */
}

.rate-unit {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-right: 0.5rem; /* Space before edit button */
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Budget specific styles */
.budget-section {
  margin-bottom: 2rem;
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.budget-section h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.fee-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.fee-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--card-bg-light);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

.fee-info h4 {
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.fee-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.assignment-info {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 0.75rem;
  width: 100%;
}

.assignment-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-list {
  line-height: 1.3;
}

.no-assignments {
  color: var(--text-secondary);
  font-style: italic;
  padding: 0.5rem 0;
}

.total-days-badge {
  background-color: rgba(67, 97, 238, 0.2);
  color: var(--primary-light);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.assignment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assignment-item {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.85rem;
}

.assignment-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.phase-name {
  font-weight: 500;
  color: var(--text-primary);
}

.assignment-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
}

.round-badge {
  background-color: rgba(255, 120, 0, 0.15);
  color: #ff7800;
}

.rounds-badge {
  background-color: rgba(255, 120, 0, 0.15);
  color: #ff7800;
}

.days-badge {
  background-color: rgba(76, 201, 240, 0.15);
  color: var(--success);
}

.toggle-details {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

.assignment-expanded {
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.8rem;
}

.dates-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.date-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.date-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.date-value {
  color: var(--text-primary);
}

.section-label {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.subsection-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 0.75rem;
}

.tasks-section, .deliverables-section {
  margin-top: 0.75rem;
}

.tasks-list, .deliverables-list {
  list-style-position: inside;
  padding-left: 0.5rem;
}

.tasks-list li, .deliverables-list li {
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.rounds-section {
  margin-top: 0.25rem;
}

.rounds-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.round-item {
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius);
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.round-header {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.round-name {
  font-size: 0.85rem;
}

.round-days {
  font-size: 0.75rem;
  color: var(--success);
}

.round-dates {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.round-details {
  margin-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}

/* Member Card Header */
.member-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.member-rate-status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-day-rate {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--success);
}

.booking-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.status-active {
  background-color: rgba(76, 201, 240, 0.2);
  color: var(--success);
}

.status-upcoming {
  background-color: rgba(255, 120, 0, 0.2);
  color: #ff7800;
}

.status-completed {
  background-color: rgba(148, 163, 184, 0.2);
  color: var(--text-secondary);
}

.status-not-booked {
  background-color: rgba(100, 100, 100, 0.2);
  color: #aaa;
}

.member-dates {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.member-dates .date-item {
  font-size: 0.8rem;
}

.member-dates .date-label {
  font-size: 0.7rem;
}

/* New text-based icon button */
.btn-icon-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 0.9em; /* Slightly smaller than text */
  line-height: 1;
  transition: color 0.2s ease;
  margin-left: 0.25rem;
}

.btn-icon-text:hover {
  color: var(--primary-light);
}

/* Remove old styles */
/*.budget-rate-group { margin-bottom: 0; min-width: 120px; }*/
/*.rate-input { max-width: 80px; text-align: right; padding-right: 0.25rem; }*/
/*.rate-unit { color: var(--text-secondary); font-size: 0.875rem; margin-right: 0.5rem; }*/

</style> 