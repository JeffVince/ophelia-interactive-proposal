<template>
  <div class="timeline-container">
    <!-- Left side panel with expandable phase summaries -->
    <div class="left-controls">
      <!-- Simple legend for milestone events -->
      <h4 class="controls-title">Timeline Legend</h4>
      <div class="legend-item">
        <div class="legend-color milestone"></div>
        <span>Client Meeting</span>
      </div>
      
      <!-- Always visible phase color legend -->
      <div class="phase-color-legend">
        <h5 class="legend-subtitle">Phases</h5>
        
        <!-- Dynamically generate phase color legends -->
        <div v-for="phase in timelineData.phases" :key="`legend-phase-${phase.number}`" class="legend-section">
          <div class="legend-phase-header">
            <span>Phase {{ phase.number }} - {{ phase.displayName }}</span>
          </div>
          <div class="legend-colors">
            <div 
              v-for="(round, roundKey) in phase.rounds" 
              :key="`legend-phase-${phase.number}-${roundKey}`" 
              class="legend-item round-legend-item"
            >
              <div class="legend-color" :class="`phase-${phase.number}-${roundKey.toLowerCase()}`"></div>
              <span>{{ round.name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Phase details sections (toggleable) -->
      <h5 class="legend-subtitle">Phase Details</h5>
      <div class="phases-list">
        <div v-for="phase in timelineData.phases" :key="`phase-${phase.number}`" class="phase-item">
          <!-- Clickable phase header -->
          <div class="phase-header" @click="togglePhaseDetails(phase.number)">
            <div class="phase-name">
              <span>Phase {{ phase.number }} - {{ phase.displayName }}</span>
              <span class="expand-icon">{{ expandedPhases[phase.number] ? '−' : '+' }}</span>
            </div>
          </div>
          
          <!-- Expandable phase details -->
          <div v-if="expandedPhases[phase.number]" class="phase-details">
            <!-- Phase Summary -->
            <div class="phase-summary">
              <!-- Stakeholders from phase data -->
              <div class="summary-section">
                <h6>Stakeholders:</h6>
                <ul class="clean-list">
                  <li v-for="stakeholder in phase.stakeholders" :key="stakeholder">{{ stakeholder }}</li>
                </ul>
              </div>
              
              <!-- Team Members collected from all rounds -->
              <div class="summary-section">
                <h6>Team Members:</h6>
                <ul class="clean-list">
                  <li v-for="member in getUniqueTeamMembers(phase)" :key="member">{{ member }}</li>
                </ul>
              </div>
              
              <!-- Stakeholder Meetings -->
              <div class="summary-section">
                <h6>Stakeholder Meetings:</h6>
                <ul class="clean-list">
                  <li v-for="(meeting, idx) in getPhaseMeetings(phase)" :key="idx">
                    {{ meeting.type }} - {{ formatDate(meeting.date) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar container with adjusted width -->
    <div class="calendar-container">
      <!-- FullCalendar Component -->
      <FullCalendar :options="calendarOptions" />
    </div>

    <!-- Detail Side Panel / Modal for Event Drilldown -->
    <div v-if="selectedEvent" class="details-panel">
      <div class="details-header">
        <h3>{{ selectedEvent.title }}</h3>
        <button class="close-btn" @click="selectedEvent = null">×</button>
      </div>
      <div class="details-body">
        <p><strong>Date:</strong> {{ formatDate(selectedEvent.start) }}</p>
        
        <template v-if="selectedEvent.extendedProps.isMilestone">
          <p><strong>Meeting Type:</strong> {{ selectedEvent.extendedProps.meetingType }}</p>
          <p><strong>Stakeholders:</strong></p>
          <ul>
            <li v-for="person in selectedEvent.extendedProps.stakeholders" :key="person">{{ person }}</li>
          </ul>
        </template>
        
        <template v-else>
          <p><strong>Deliverables:</strong></p>
          <ul>
            <li v-for="item in selectedEvent.extendedProps.deliverables" :key="item">{{ item }}</li>
          </ul>
          <p><strong>Tasks:</strong></p>
          <ul>
            <li v-for="task in selectedEvent.extendedProps.tasks" :key="task">{{ task }}</li>
          </ul>
          <p><strong>Team Members:</strong></p>
          <ul>
            <li v-for="member in selectedEvent.extendedProps.team" :key="member.role">
              {{ member.role }}
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import timelineData from '../data/data.json'

export default {
  name: 'ProjectTimeline',
  components: { FullCalendar },
  data() {
    // Initialize phase states and expanded states
    const states = {}
    const expandedPhases = {}
    
    // Default start date for first phase
    const defaultStartDate = '2025-04-21'
    
    timelineData.phases.forEach(ph => {
      states[ph.number] = 'ON' // All phases visible by default
      expandedPhases[ph.number] = false // All phases collapsed by default
    })
    
    return {
      timelineData,
      phaseStates: states,
      expandedPhases,
      selectedEvent: null,
      defaultStartDate,
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin, multiMonthPlugin],
        initialView: 'multiMonthFiveMonths',
        multiMonthMaxColumns: 2,
        views: {
          multiMonthFiveMonths: {
            type: 'multiMonth',
            duration: { months: 5 }
          }
        },
        initialDate: defaultStartDate,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'multiMonthFiveMonths,dayGridMonth,dayGridWeek,dayGridDay'
        },
        editable: false,
        eventClick: this.handleEventClick,
        firstDay: 1,
        events: []
      }
    }
  },
  computed: {
    // Compute events from timelineData + phaseStates
    generatedEvents() {
      const events = [];
      
      // Sort phases by number
      const sortedPhases = [...this.timelineData.phases].sort((a, b) => a.number - b.number);
      
      // Process each phase
      for (const phase of sortedPhases) {
        // Skip if phase is turned off
        if (this.phaseStates[phase.number] === 'OFF') continue;
        
        // Process each round in the phase
        for (const [roundKey, round] of Object.entries(phase.rounds)) {
          // Skip if round doesn't have events
          if (!round.events || !round.events.length) continue;
          
          // Process each event in the round
          for (const event of round.events) {
            // Skip if no date
            if (!event.date) continue;
            
            // Determine event type and create appropriate calendar event
            if (event.type === 'start' || event.type === 'check_in' || event.type === 'review') {
              const isReview = event.type === 'review';
              const title = isReview ? 'Review' : 
                           (event.type === 'check_in' ? 'Check-In' : 
                           `Phase ${phase.number} – ${roundKey}: ${event.description}`);
              
              events.push({
                title: title,
                start: event.date,
                allDay: true,
                classNames: isReview || event.type === 'check_in' 
                  ? ['milestone-event', `phase-${phase.number}-meeting`]
                  : [`phase-${phase.number}`, `round-${roundKey.toLowerCase()}`],
                extendedProps: {
                  isMilestone: isReview || event.type === 'check_in',
                  phase: phase.name,
                  phaseNumber: phase.number,
                  round: roundKey,
                  meetingType: isReview ? "Major Review" : 
                              (event.type === 'check_in' ? "Status Update" : "Work Session"),
                  deliverables: event.deliverables || [],
                  tasks: [event.description],
                  team: event.team_members ? event.team_members.map(member => ({ role: member })) : [],
                  stakeholders: event.stakeholders || []
                }
              });
            }
          }
        }
      }
      
      return events;
    }
  },
  watch: {
    // Update calendar events when generated events change
    generatedEvents: {
      handler(newEvents) {
        this.calendarOptions.events = newEvents;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // Toggle expanded state of a phase
    togglePhaseDetails(phaseNumber) {
      this.expandedPhases[phaseNumber] = !this.expandedPhases[phaseNumber];
    },
    
    // Handle calendar event click
    handleEventClick(info) {
      this.selectedEvent = info.event;
    },
    
    // Format date for display
    formatDate(date) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    
    // Get all meetings (reviews, check-ins) for a phase
    getPhaseMeetings(phase) {
      const meetings = [];
      
      // Collect all meetings from all rounds
      Object.values(phase.rounds || {}).forEach(round => {
        if (round.events && round.events.length) {
          const roundMeetings = round.events.filter(event => 
            event.type === 'review' || event.type === 'check_in'
          );
          
          roundMeetings.forEach(meeting => {
            meetings.push({
              type: meeting.type === 'review' ? 'Review' : 'Check-In',
              date: meeting.date,
              stakeholders: meeting.stakeholders || []
            });
          });
        }
      });
      
      // Sort meetings by date
      return meetings.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    // Get unique team members across all rounds in a phase
    getUniqueTeamMembers(phase) {
      const members = new Set();
      
      // Collect team members from all rounds
      Object.values(phase.rounds || {}).forEach(round => {
        if (round.team && round.team.length) {
          round.team.forEach(member => {
            members.add(member.role);
          });
        }
      });
      
      return Array.from(members);
    }
  }
}
</script>

<style scoped>
/* Layout Styles */
.timeline-container {
  position: relative;
  padding: 1rem 1rem;
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  min-height: auto;
  height: auto;
  width: 100%;
  max-width: 100%;
}

.left-controls {
  width: 280px;
  flex-shrink: 0;
  padding: 1rem;
  background-color: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #333;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.calendar-container {
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  background-color: #1e1e1e;
  border-radius: 8px;
  border: 1px solid #333;
  padding: 0;
  overflow: hidden;
  max-height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.controls-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333;
}

.legend-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem;
  color: #e6e6dc;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.milestone {
  background-color: #f0f0e6;
  border: 2px solid #d6d6ce;
}

/* Phase color legend */
.phase-color-legend {
  margin-top: 1rem;
}

.legend-section {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.legend-section:last-child {
  border-bottom: none;
}

.legend-phase-header {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
}

.legend-colors {
  padding-left: 0.5rem;
}

.round-legend-item {
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  color: #ccc;
}

/* Phases List */
.phases-list {
  margin-top: 0.5rem;
}

.phase-item {
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.5rem;
}

.phase-header {
  cursor: pointer;
  user-select: none;
}

.phase-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #e8e8e8;
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expand-icon {
  font-size: 1.2rem;
  font-weight: bold;
  color: #a0a096;
}

.phase-details {
  padding: 0.5rem 0 0.5rem 0.75rem;
  margin: 0.5rem 0;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.phase-summary {
  background-color: rgba(255, 255, 255, 0.03);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-section {
  margin-bottom: 1rem;
}

.summary-section:last-child {
  margin-bottom: 0;
}

.summary-section h6 {
  font-size: 0.85rem;
  margin: 0 0 0.5rem;
  color: #d8d8d0;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.25rem;
}

.clean-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.8rem;
  color: #cccccc;
}

.clean-list li {
  margin-bottom: 0.3rem;
}

/* Detail panel */
.details-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: #1c1c1c;
  border-left: 2px solid rgba(180, 180, 170, 0.2);
  overflow-y: auto;
  padding: 1rem;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  z-index: 1000;
  color: #f5f5f0;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  font-size: 1.1em;
  margin: 0;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  line-height: 1;
  cursor: pointer;
  color: #f5f5f0;
}

.details-body {
  margin-top: 1rem;
}

.details-body ul {
  margin: 0.3rem 0 1rem 1.2rem;
}

.details-body p {
  margin-bottom: 0.75rem;
}

/* Color Palette for Phases with tint variations for rounds */
:deep(.fc-event.phase-1) {
  background-color: #74b9ff !important;
  border-color: #0984e3 !important;
  color: #fff !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.fc-event.phase-1.round-r1) {
  background-color: #4c78b0 !important;
  border-color: #294369 !important;
}

:deep(.fc-event.phase-1.round-r2) {
  background-color: #3a5d8c !important;
  border-color: #294369 !important;
}

:deep(.fc-event.phase-1.round-r3) {
  background-color: #294369 !important;
  border-color: #1c2e48 !important;
}

:deep(.fc-event.phase-1.round-r4) {
  background-color: #1a2c46 !important;
  border-color: #0f1e33 !important;
}

:deep(.fc-event.phase-2) {
  background-color: #55efc4 !important;
  border-color: #00b894 !important;
  color: #2d3436 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.fc-event.phase-2.round-r1) {
  background-color: #41a58e !important;
  border-color: #246152 !important;
}

:deep(.fc-event.phase-2.round-r2) {
  background-color: #328370 !important;
  border-color: #246152 !important;
}

:deep(.fc-event.phase-2.round-r3) {
  background-color: #246152 !important;
  border-color: #184237 !important;
}

:deep(.fc-event.phase-2.round-r4) {
  background-color: #174035 !important;
  border-color: #0d2a22 !important;
}

:deep(.fc-event.phase-3) {
  background-color: #fd79a8 !important;
  border-color: #e84393 !important;
  color: #fff !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.fc-event.phase-3.round-r1) {
  background-color: #c5678d !important;
  border-color: #8c3755 !important;
}

:deep(.fc-event.phase-3.round-r2) {
  background-color: #a84e70 !important;
  border-color: #8c3755 !important;
}

:deep(.fc-event.phase-3.round-r3) {
  background-color: #8c3755 !important;
  border-color: #6a2a41 !important;
}

:deep(.fc-event.phase-3.round-r4) {
  background-color: #6e243f !important;
  border-color: #521b2f !important;
}

:deep(.fc-event.phase-4) {
  background-color: #ffeaa7 !important;
  border-color: #fdcb6e !important;
  color: #2d3436 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.fc-event.phase-4.round-r1) {
  background-color: #d8c478 !important;
  border-color: #9e8845 !important;
}

:deep(.fc-event.phase-4.round-r2) {
  background-color: #bba55e !important;
  border-color: #9e8845 !important;
}

:deep(.fc-event.phase-4.round-r3) {
  background-color: #9e8845 !important;
  border-color: #7a6a35 !important;
}

:deep(.fc-event.phase-4.round-r4) {
  background-color: #816c2e !important;
  border-color: #5f4f21 !important;
}

/* Connect milestone events to their phase colors - with stronger selectors */
:deep(.fc-event.milestone-event.phase-1-meeting),
:deep(.fc-event.milestone-event.phase-1-meeting .fc-event-title),
:deep(.fc-event.milestone-event.phase-1-meeting .fc-event-main) {
  background-color: #f0f0e6 !important;
  border-left: 5px solid #4c78b0 !important;
  color: #000 !important;
}

:deep(.fc-event.milestone-event.phase-2-meeting),
:deep(.fc-event.milestone-event.phase-2-meeting .fc-event-title),
:deep(.fc-event.milestone-event.phase-2-meeting .fc-event-main) {
  background-color: #f0f0e6 !important;
  border-left: 5px solid #41a58e !important;
  color: #000 !important;
}

:deep(.fc-event.milestone-event.phase-3-meeting),
:deep(.fc-event.milestone-event.phase-3-meeting .fc-event-title),
:deep(.fc-event.milestone-event.phase-3-meeting .fc-event-main) {
  background-color: #f0f0e6 !important;
  border-left: 5px solid #c5678d !important;
  color: #000 !important;
}

:deep(.fc-event.milestone-event.phase-4-meeting),
:deep(.fc-event.milestone-event.phase-4-meeting .fc-event-title),
:deep(.fc-event.milestone-event.phase-4-meeting .fc-event-main) {
  background-color: #f0f0e6 !important;
  border-left: 5px solid #d8c478 !important;
  color: #000 !important;
}

/* Update basic milestone styling with stronger selectors */
:deep(.fc-event.milestone-event),
:deep(.fc-event.milestone-event .fc-event-title),
:deep(.fc-event.milestone-event .fc-event-main) {
  background-color: #f0f0e6 !important;
  border-color: #d6d6ce !important;
  border-radius: 12px !important;
  color: #000 !important;
  padding: 2px 4px !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 6px rgba(214, 214, 206, 0.3) !important;
}

/* Calendar theme adjustments */
:deep(.fc) {
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  border: none;
  height: 100% !important;
  min-height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.fc-view) {
  width: 100% !important;
}

:deep(.fc-view-harness) {
  width: 100% !important;
  background-color: #1e1e1e;
  overflow: auto;
  flex: 1;
}

:deep(.fc th) {
  background-color: #1e1e1e;
  color: #e8e8e8;
  border-color: #333;
  padding: 8px 0;
}

:deep(.fc td) {
  border-color: #333;
}

:deep(.fc-day) {
  background-color: #222;
}

:deep(.fc-day-today) {
  background-color: #2a2a2a !important;
}

:deep(.fc-button) {
  background-color: #333 !important;
  border-color: #444 !important;
}

:deep(.fc-button:hover) {
  background-color: #444 !important;
}

:deep(.fc-button-active) {
  background-color: #9d86ff !important;
  border-color: #9d86ff !important;
}

:deep(.fc-col-header-cell) {
  color: #fff;
}

:deep(.fc-header-toolbar) {
  background-color: #1e1e1e;
  padding: 8px;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 5;
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .timeline-container {
    flex-direction: column;
  }
  
  .left-controls {
    width: 100%;
  }
}

/* Legend color boxes */
.phase-1-r1 {
  background-color: #4c78b0;
}

.phase-1-r2 {
  background-color: #3a5d8c;
}

.phase-1-r3 {
  background-color: #294369;
}

.phase-1-r4 {
  background-color: #1a2c46;
}

.phase-2-r1 {
  background-color: #41a58e;
}

.phase-2-r2 {
  background-color: #328370;
}

.phase-2-r3 {
  background-color: #246152;
}

.phase-2-r4 {
  background-color: #174035;
}

.phase-3-r1 {
  background-color: #c5678d;
}

.phase-3-r2 {
  background-color: #a84e70;
}

.phase-3-r3 {
  background-color: #8c3755;
}

.phase-3-r4 {
  background-color: #6e243f;
}

.phase-4-r1 {
  background-color: #d8c478;
}

.phase-4-r2 {
  background-color: #bba55e;
}

.phase-4-r3 {
  background-color: #9e8845;
}

.phase-4-r4 {
  background-color: #816c2e;
}
</style> 