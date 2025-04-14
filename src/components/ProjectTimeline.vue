<template>
  <div class="timeline-container">
    <!-- Left side panel with expandable phase summaries -->
    <div class="left-controls">
      <!-- Timeline Legend Panel -->
      <div class="legend-panel">
        <div class="glass-overlay"></div>
        <div class="panel-inner">
          <div class="legend-header">
            <h3>Timeline Legend</h3>
          </div>
          
          <div class="legend-body">
            <div class="legend-section compact">
      </div>
      
            <div class="legend-section">
              <h4 class="legend-section-title">Project Phases</h4>
              
              <div v-for="phase in filteredPhases" :key="phase.number" class="phase-group">
                <div class="phase-title" @click="togglePhaseDetails(phase.number)">
                  <span>{{ phase.displayName }}</span>
                  <span class="toggle-icon">{{ showPhaseDetails[phase.number] ? '−' : '+' }}</span>
                </div>
                
                <div v-if="showPhaseDetails[phase.number]" class="phase-details">
                  <!-- Create legend items for each round in the phase -->
                  <div v-for="(round, roundKey) in phase.rounds" :key="roundKey" class="legend-item">
                    <div :class="`legend-icon phase-${phase.number} round-${roundKey.substring(1)}`"></div>
                    <span>{{ round.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Phase Information Section - TO BE REMOVED -->
            <!-- 
            <div class="legend-section">
              <h4 class="legend-section-title">Phase Information</h4>
              
              <div v-for="phase in filteredPhases" :key="`info-${phase.number}`" class="phase-info" v-show="expandedPhaseInfo === phase.number">
                <div class="info-section">
                  <h5>Stakeholders</h5>
                  <ul>
                    <li v-for="person in phase.stakeholders" :key="person">{{ person }}</li>
                  </ul>
                </div>
                
                <div class="info-section">
                  <h5>Team Members</h5>
                  <ul>
                    <li v-for="role in phase.teamRoles" :key="role">{{ role }}</li>
                  </ul>
                </div>
                
                <div class="info-section">
                  <h5>Stakeholder Meetings</h5>
                  <ul>
                    <li v-for="meeting in phase.meetings" :key="meeting.date">
                      {{ meeting.type }} - {{ formatMeetingDate(meeting.date) }}
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="!expandedPhaseInfo" class="phase-selector">
                <div 
                  v-for="phase in filteredPhases" 
                  :key="`select-${phase.number}`"
                  class="phase-select-btn"
                  :class="{ active: expandedPhaseInfo === phase.number }"
                  @click="expandedPhaseInfo = phase.number"
                >
                  {{ phase.displayName }}
                </div>
              </div>
              
              <div v-if="expandedPhaseInfo" class="phase-info-controls">
                <button class="back-btn" @click="expandedPhaseInfo = null">Back to Phases</button>
              </div>
            </div> 
            -->
            <!-- End of Phase Information Section -->
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
      <div class="glass-overlay"></div>
      <div class="panel-inner">
        <div class="details-header" 
          :class="{ 
            'phase-1-header': selectedEvent.extendedProps.phaseNumber === 1,
            'phase-2-header': selectedEvent.extendedProps.phaseNumber === 2,
            'phase-3-header': selectedEvent.extendedProps.phaseNumber === 3,
            'phase-4-header': selectedEvent.extendedProps.phaseNumber === 4
          }">
        <button class="close-btn" @click="selectedEvent = null">×</button>
      </div>

      <div class="details-body">
          <!-- Event Overview Section -->
          <div class="event-overview"
            :class="{
              'phase-1-overview': selectedEvent.extendedProps.phaseNumber === 1,
              'phase-2-overview': selectedEvent.extendedProps.phaseNumber === 2,
              'phase-3-overview': selectedEvent.extendedProps.phaseNumber === 3,
              'phase-4-overview': selectedEvent.extendedProps.phaseNumber === 4
            }">
            <div class="event-date">
              <div class="date-day">{{ formatDateDay(selectedEvent.start) }}</div>
              <div class="date-month">{{ formatDateMonth(selectedEvent.start) }}</div>
              <div class="date-year">{{ formatDateYear(selectedEvent.start) }}</div>
            </div>
            
            <div class="event-meta">
              <h2 class="event-title">{{ selectedEvent.extendedProps.phaseName }}</h2>
              <h3 class="event-subtitle">{{ selectedEvent.extendedProps.roundName }} - {{ selectedEvent.extendedProps.eventType }}</h3>
              <div class="event-tags">
                <span v-if="selectedEvent.extendedProps.phase">{{ selectedEvent.extendedProps.phase }}</span>
                <span v-if="selectedEvent.extendedProps.round">{{ selectedEvent.extendedProps.round }}</span>
                <span v-if="selectedEvent.extendedProps.meetingType">{{ selectedEvent.extendedProps.meetingType }}</span>
              </div>
            </div>
          </div>
        
        <template v-if="selectedEvent.extendedProps.isMilestone">
            <!-- Meeting Agenda section -->
            <div v-if="selectedEvent.extendedProps.agenda" class="panel-section">
              <h3 class="section-title">Meeting Agenda</h3>
              <div class="agenda-content" v-html="formatAgendaMarkdown(selectedEvent.extendedProps.agenda)"></div>
            </div>
            
            <!-- Ophelia Team section -->
            <div v-if="selectedEvent.extendedProps.opheliaTeam && selectedEvent.extendedProps.opheliaTeam.length" class="panel-section">
              <h3 class="section-title">Ophelia Team</h3>
              <div class="team-grid">
                <div 
                  v-for="member in selectedEvent.extendedProps.opheliaTeam" 
                  :key="member" 
                  class="team-member"
                  :class="getRoleColorClass(member.split(' (')[1]?.replace(')', ''))"
                >
                  <div class="member-info">
                    <div class="member-name">{{ member.split(' (')[0] }}</div>
                    <div class="member-role">{{ member.split(' (')[1]?.replace(')', '') }}</div>
                  </div>
                  <div class="member-accent"></div>
                </div>
              </div>
            </div>
            
            <!-- Stakeholders section -->
            <div v-if="selectedEvent.extendedProps.stakeholders && selectedEvent.extendedProps.stakeholders.length" class="panel-section">
              <h3 class="section-title">Stakeholders</h3>
              <div class="stakeholder-grid">
                <div 
                  v-for="(person, index) in selectedEvent.extendedProps.stakeholders" 
                  :key="person" 
                  class="stakeholder-item"
                  :class="`stakeholder-variant-${index % 3}`"
                >
                  {{ person }}
                </div>
              </div>
            </div>
        </template>
        
        <template v-else>
            <!-- Redesigned Phase event template -->
            <div class="panel-section">
              <h3 class="section-title">Deliverables</h3>
              <div class="deliverables-grid">
                <div 
                  v-for="(item, index) in selectedEvent.extendedProps.deliverables" 
                  :key="item"
                  class="deliverable-item"
                  :class="`deliverable-variant-${index % 4}`"
                >
                  <div class="deliverable-icon">•</div>
                  <div class="deliverable-text">{{ item }}</div>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <h3 class="section-title">Tasks</h3>
              <div class="tasks-content">
                <div 
                  v-for="task in selectedEvent.extendedProps.tasks" 
                  :key="task"
                  class="task-item"
                >
                  <div class="task-bullet">•</div>
                  <div class="task-text">{{ task }}</div>
                </div>
              </div>
            </div>
            
            <!-- Team Roles Section -->
            <div v-if="selectedEvent.extendedProps.team && selectedEvent.extendedProps.team.length" class="panel-section">
              <h3 class="section-title">Team Roles</h3>
              <div class="roles-grid">
                <div 
                  v-for="(role, index) in selectedEvent.extendedProps.team" 
                  :key="role.role"
                  class="role-item"
                  :class="getRoleColorClass(role.role)"
                >
                  <div class="role-name">{{ role.role }}</div>
                  <div class="role-accent"></div>
                </div>
              </div>
            </div>
            
            <!-- Team Members section -->
            <div v-if="selectedEvent.extendedProps.opheliaTeam && selectedEvent.extendedProps.opheliaTeam.length" class="panel-section">
              <h3 class="section-title">Ophelia Team</h3>
              <div class="team-grid">
                <div 
                  v-for="member in selectedEvent.extendedProps.opheliaTeam" 
                  :key="member" 
                  class="team-member"
                  :class="getRoleColorClass(member.split(' (')[1]?.replace(')', ''))"
                >
                  <div class="member-info">
                    <div class="member-name">{{ member.split(' (')[0] }}</div>
                    <div class="member-role">{{ member.split(' (')[1]?.replace(')', '') }}</div>
                  </div>
                  <div class="member-accent"></div>
                </div>
              </div>
            </div>
            
            <!-- Stakeholders section -->
            <div v-if="selectedEvent.extendedProps.stakeholders && selectedEvent.extendedProps.stakeholders.length" class="panel-section">
              <h3 class="section-title">Stakeholders</h3>
              <div class="stakeholder-grid">
                <div 
                  v-for="(person, index) in selectedEvent.extendedProps.stakeholders" 
                  :key="person" 
                  class="stakeholder-item"
                  :class="`stakeholder-variant-${index % 3}`"
                >
                  {{ person }}
                </div>
              </div>
            </div>
        </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import DataService from '../services/DataService';
import axios from 'axios';
import { marked } from 'marked';

export default {
  name: 'ProjectTimeline',
  components: { FullCalendar },
  data() {
    // Create reactive state tracking for each phase
    const states = {};
    
    // Create reactive expandedPhases object for tracking collapse/expand state
    const expandedPhases = {};
    
    // Create initial showPhaseDetails object
    const showPhaseDetails = {};
    
    return {
      phases: [],
      timelineData: null, // Start with null, will be populated in mounted
      selectedEvent: null,
      showDetailsPanel: false,
      detailsPanelData: {},
      hoverEvent: null,
      phaseStates: states,
      expandedPhases,
      showPhaseDetails,
      defaultStartDate: new Date('2025-04-21'),
      isScrolling: false, // Used to throttle scroll events
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin, multiMonthPlugin],
        initialView: 'timelineView',
        initialDate: new Date('2025-04-21'),
        editable: false,
        selectable: false,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timelineView'
        },
        nowIndicator: true,
        buttonIcons: true,
        buttonText: {
          today: 'Today',
          month: 'Month',
          timeline: 'Timeline'
        },
        titleFormat: { 
          month: 'long',
          year: 'numeric'
        },
        businessHours: true,
        height: 'calc(100vh - 170px)',
        firstDay: 0,
        dayMaxEvents: 3,
        dayMaxEventRows: 4,
        moreLinkClick: 'popover',
        eventTimeFormat: {
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        },
        moreLinkClick: 'popover',
        views: {
          dayGridMonth: {
            type: 'dayGridMonth',
            buttonText: 'Month',
            dayMaxEventRows: false, // Allow as many events as needed
            fixedWeekCount: false, // Don't force 6 weeks
            showNonCurrentDates: true, // Show days from other months
            // Add a classname specifically for styling the month view to match timeline
            viewDidMount: function(view) {
              // Add a class to the view element to help style it
              const viewEl = view.el;
              console.log("Month view detected - fixing header height");
              
              // Force all cells to have the same height
              setTimeout(() => {
                // FOCUS ON FIXING THE HEADER
                // Get header and set exact height of 32px
                const headerTable = viewEl.querySelector('.fc-col-header');
                if (headerTable) {
                  // Force header height to match timeline view but don't set background
                  headerTable.style.cssText = 'height: 32px !important; min-height: 32px !important; max-height: 32px !important; overflow: hidden !important;';
                }
                
                // Remove padding from header section
                const headerSection = viewEl.querySelector('.fc-scrollgrid-section-header');
                if (headerSection) {
                  headerSection.style.cssText = 'height: 32px !important; min-height: 32px !important; max-height: 32px !important; padding: 0 !important; margin: 0 !important;';
                }
                
                // Fix header table
                const headerTableElement = viewEl.querySelector('.fc-scrollgrid-section-header table');
                if (headerTableElement) {
                  headerTableElement.style.cssText = 'height: 32px !important; margin: 0 !important; border-spacing: 0 !important;';
                }
                
                // Fix header rows
                const headerRows = viewEl.querySelectorAll('.fc-scrollgrid-section-header tr');
                headerRows.forEach(row => {
                  row.style.cssText = 'height: 32px !important; max-height: 32px !important;';
                });
                
                // Fix header cells, but DON'T set background color
                const headerCells = viewEl.querySelectorAll('.fc-col-header-cell');
                headerCells.forEach(cell => {
                  cell.style.cssText = 'height: 32px !important; line-height: 32px !important; padding: 0 !important; vertical-align: middle !important;';
                });
                
                // Fix header text
                const headerTexts = viewEl.querySelectorAll('.fc-col-header-cell-cushion');
                headerTexts.forEach(text => {
                  text.style.cssText = 'padding: 4px !important; font-size: 0.75rem !important; font-weight: 600 !important; line-height: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important;';
                });
                
                // Regular cell styling continues...
                const cells = viewEl.querySelectorAll('.fc-daygrid-day');
                cells.forEach(cell => {
                  cell.style.height = '110px';
                  cell.style.minHeight = '110px';
                });
                
                // Make weekend and other month days match timeline view
                const weekendCells = viewEl.querySelectorAll('.fc-day-sat, .fc-day-sun');
                weekendCells.forEach(cell => {
                  cell.style.backgroundColor = '#131313';
                });
                
                const otherMonthCells = viewEl.querySelectorAll('.fc-day-other');
                otherMonthCells.forEach(cell => {
                  cell.style.backgroundColor = '#111111';
                });
              }, 100); // Use a longer timeout to ensure DOM is ready
            }
          },
          timelineView: {
            type: 'dayGrid',
            duration: { months: 12 },
            buttonText: 'Timeline',
            dayCount: 84,
            visibleRange: function(currentDate) {
              // Start from the beginning of the current week
              const startDate = new Date(currentDate);
              const day = startDate.getDay();
              startDate.setDate(startDate.getDate() - day); // Go to Sunday
              
              // End date is approximately 12 weeks later
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + 84);
              
              return { start: startDate, end: endDate };
            },
            // Cell styling to match the month view
            dayCellClassNames: 'timeline-day-cell',
            dayHeaderClassNames: 'timeline-day-header',
            // Force the same cell height
            dayCellDidMount: function(arg) {
              arg.el.style.height = '110px';
              arg.el.style.minHeight = '110px';
              arg.el.style.backgroundColor = '#141414';
              
              // Make weekend cells slightly darker
              const date = arg.date;
              const day = date.getDay();
              if (day === 0 || day === 6) { // 0 = Sunday, 6 = Saturday
                arg.el.style.backgroundColor = '#131313';
              }
            },
            titleFormat: function(dateInfo) {
              return 'April 2025';
            }
          }
        },
        dayCellDidMount: function(arg) {
          arg.el.style.height = '110px';
          arg.el.style.minHeight = '110px';
          arg.el.style.backgroundColor = '#141414';
          
          // Make weekend cells slightly darker
          const date = arg.date;
          const day = date.getDay();
          if (day === 0 || day === 6) { // 0 = Sunday, 6 = Saturday
            arg.el.style.backgroundColor = '#131313';
          }
          
          // Style "other month" days
          if (arg.isPast || arg.isFuture) {
            arg.el.style.backgroundColor = '#111111';
          }
        },
        eventContent: function(arg) {
          // Get event data
          const eventType = arg.event.extendedProps.type;
          const phaseNumber = arg.event.extendedProps.phaseNumber;
          const phaseName = arg.event.extendedProps.phaseName;
          const roundName = arg.event.extendedProps.roundName;
          const roundKey = arg.event.extendedProps.round;
          
          // Create container for all events
          const container = document.createElement('div');
          container.className = 'custom-event-container';
          
          const titleElement = document.createElement('div');
          titleElement.className = 'event-title';
          
          // If this is a round event (weeklong)
          if (eventType === 'round') {
            // Create two separate span elements for phase name and round name
            const phaseNameElement = document.createElement('span');
            phaseNameElement.className = 'event-phase-name';
            phaseNameElement.style.fontWeight = 'bold';
            phaseNameElement.innerText = `${phaseName}`;
            
            const separator = document.createElement('span');
            separator.innerText = ' : ';
            
            const roundNameElement = document.createElement('span');
            roundNameElement.className = 'event-round-name';
            roundNameElement.style.fontWeight = 'normal';
            roundNameElement.innerText = `${roundName}`;
            
            titleElement.appendChild(phaseNameElement);
            titleElement.appendChild(separator);
            titleElement.appendChild(roundNameElement);
            container.appendChild(titleElement);
            return { domNodes: [container] };
          }
          
          // Otherwise, this is a meeting event (check-in or review)
          let badgeText = arg.event.extendedProps.eventType || '';
          
          const titleText = document.createElement('span');
          titleText.className = 'event-title-text';
          titleText.innerText = roundKey;
          
          const badge = document.createElement('span');
          badge.className = 'event-badge';
          badge.innerText = badgeText;
          
          titleElement.appendChild(titleText);
          titleElement.appendChild(badge);
          container.appendChild(titleElement);
          
          return { domNodes: [container] };
        },
        eventClick: (info) => {
          console.log('Event clicked:', info.event);
          const event = info.event;
          this.selectedEvent = event;
          
          // Gather details for the panel
          this.detailsPanelData = {
            title: this.getDetailPanelTitle(event),
            date: event.start,
            description: event.extendedProps.description || '',
            agenda: event.extendedProps.agenda || '',
            deliverables: event.extendedProps.deliverables || [],
            stakeholders: event.extendedProps.stakeholders || [],
            opheliaTeam: event.extendedProps.opheliaTeam || this.generateTeamMembers(event.extendedProps.team_members || [])
          };
          
          // Show the details panel
          this.showDetailsPanel = true;
        },
        events: this.generatedEvents
      },
    }
  },
  computed: {
    // Computed property for generated calendar events
    generatedEvents() {
      console.log('[ProjectTimeline] Generating events for all phases');
      let events = [];
      
      if (!this.phases || this.phases.length === 0) {
        console.log('[ProjectTimeline] No phases loaded yet');
        return [];
      }
      
      // Log all phases and their enabled status
      console.log('[ProjectTimeline] All phases status:');
      this.phases.forEach(phase => {
        console.log(`Phase #${phase.number} (${phase.name}): enabled=${phase.enabled}`);
      });
      
      // Iterate through each phase in the data
      this.phases.forEach((phase) => {
        // Skip phases that are not enabled
        if (!phase.enabled) {
          console.log(`[ProjectTimeline] Skipping disabled Phase ${phase.number}: ${phase.name}`);
          return;
        }
        
        console.log(`[ProjectTimeline] Processing enabled Phase ${phase.number}: ${phase.name}`);
        
        // Process each round in the phase
        if (phase.rounds) {
          // Handle rounds as object with keys like R1, R2, etc.
          Object.keys(phase.rounds).forEach(roundKey => {
            const round = phase.rounds[roundKey];
            console.log(`Processing Round ${roundKey} in Phase ${phase.number}`);
            
            // Find the first and last event dates to determine the round span
            if (round.events && round.events.length > 0) {
              // Sort events by date
              const sortedEvents = [...round.events].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              
              // Get the first event date (usually Monday)
              const firstEvent = sortedEvents[0];
              const firstEventDate = new Date(firstEvent.date);
              
              // Get the last event date (usually Friday)
              const lastEvent = sortedEvents[sortedEvents.length - 1];
              const lastEventDate = new Date(lastEvent.date);
              
              // Ensure the week spans Monday to Friday
              let startDate, endDate;
              
              // If start_date is provided, use it
              if (round.start_date) {
                startDate = new Date(round.start_date);
                
                // Ensure it's a Monday
                const day = startDate.getDay();
                if (day !== 1) { // 1 = Monday
                  console.log(`Fixing start date to be Monday instead of day ${day}`);
                  // Adjust to next Monday if not Monday
                  startDate = new Date(round.start_date);
                  startDate.setDate(startDate.getDate() + (1 + 7 - day) % 7);
                }
              } else {
                // Otherwise use the first event date
                startDate = new Date(firstEventDate);
                
                // Find the Monday of this week
                const day = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
                if (day !== 1) { // If not Monday (1)
                  // If Sunday (0), add 1 day to get to Monday
                  // If Tuesday-Saturday (2-6), subtract to get to previous Monday
                  const daysToAdjust = day === 0 ? 1 : -(day - 1);
                  startDate.setDate(startDate.getDate() + daysToAdjust);
                }
              }
              
              // Set end date to be Friday of the same week (4 days after Monday)
              endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + 4); // Monday + 4 days = Friday
              
              // Add one day to the end date because FullCalendar treats end dates as exclusive
              const displayEndDate = new Date(endDate);
              displayEndDate.setDate(endDate.getDate() + 1);
              
              console.log(`Round ${roundKey} span: ${startDate.toDateString()} (Mon) to ${endDate.toDateString()} (Fri) (display end: ${displayEndDate.toDateString()})`);
              
              // Create week-long round event (Monday to Friday)
              events.push({
                title: `${phase.displayName || phase.name} : ${round.name}`,
                start: startDate,
                end: displayEndDate, // Use displayEndDate which is Saturday (to include all of Friday)
                allDay: true,
                className: `event-round phase-${phase.number}`,
                display: 'block', // normal display, not background
                extendedProps: {
                  phase: phase.number - 1,
                  phaseNumber: phase.number,
                  phaseName: phase.displayName || phase.name,
                  round: roundKey,
                  roundName: round.name,
                  type: 'round',
                  description: `${phase.displayName || phase.name} - ${round.name}`,
                  deliverables: round.deliverables,
                  tasks: round.tasks,
                  team: round.team,
                  isMilestone: false
                }
              });
              
              // Add individual meeting events for check-ins and reviews
              round.events.forEach(event => {
                const eventDate = new Date(event.date);
                const eventType = event.type;
                let badgeText = '';
                
                // Determine event badge text
                if (eventType === 'start') {
                  badgeText = 'Start';
                } else if (eventType === 'check_in') {
                  badgeText = 'Check-In';
                } else if (eventType === 'review') {
                  badgeText = 'Review';
                }
                
                // Create meeting event
                if (eventType === 'check_in' || eventType === 'review') {
                  // Generate a better agenda based on meeting type and round tasks/deliverables
                  let generatedAgenda = '';
                  
                  if (eventType === 'review') {
                    // For review meetings, create a simple paragraph instead of formatted content
                    generatedAgenda = `We'll be presenting the completed ${round.name} deliverables for stakeholder review and approval. `;
                    
                    if (round.deliverables && round.deliverables.length) {
                      generatedAgenda += `This includes `;
                      
                      // Convert the deliverables to a simple text list
                      const detailedDeliverables = round.deliverables.map(item => {
                        // Make deliverable descriptions more specific
                        if (item.includes("Moodboard")) {
                          return `visual direction moodboards with color palettes, typography, and imagery samples`;
                        } else if (item.includes("Name exploration")) {
                          return `brand name options with rationale and preliminary trademark research`;
                        } else if (item.includes("Logo")) {
                          return `logo concepts with applications in different contexts and sizes`;
                        } else if (item.includes("Brand Book")) {
                          return `complete brand guide including logo usage, typography, color system, and application examples`;
                        }
                        return item.toLowerCase();
                      });
                      
                      // Format as comma-separated list with "and" before the last item
                      if (detailedDeliverables.length === 1) {
                        generatedAgenda += detailedDeliverables[0];
                      } else if (detailedDeliverables.length === 2) {
                        generatedAgenda += `${detailedDeliverables[0]} and ${detailedDeliverables[1]}`;
                      } else {
                        const lastItem = detailedDeliverables.pop();
                        generatedAgenda += `${detailedDeliverables.join(', ')}, and ${lastItem}`;
                      }
                      
                      generatedAgenda += `. `;
                    }
                    
                    generatedAgenda += `We'll present the work, gather feedback, discuss any needed revisions, and confirm next steps for the project timeline.`;
                  } else if (eventType === 'check_in') {
                    // For check-in meetings, create a simple paragraph
                    generatedAgenda = `This is a mid-phase check-in to review progress on the ${round.name} work and ensure alignment before finalizing deliverables. `;
                    
                    if (round.tasks && round.tasks.length) {
                      generatedAgenda += `We'll discuss progress on `;
                      
                      // Convert the tasks to a simple text list
                      const detailedTasks = round.tasks.map(task => {
                        // Make task descriptions more specific
                        if (task.includes("research")) {
                          return `research findings and insights that will inform our creative direction`;
                        } else if (task.includes("concept")) {
                          return `initial concept explorations with multiple creative approaches`;
                        } else if (task.includes("design")) {
                          return `design progress including preliminary layouts and visual elements`;
                        } else if (task.includes("development")) {
                          return `development progress and technical implementation status`;
                        }
                        return task.toLowerCase();
                      });
                      
                      // Format as comma-separated list with "and" before the last item
                      if (detailedTasks.length === 1) {
                        generatedAgenda += detailedTasks[0];
                      } else if (detailedTasks.length === 2) {
                        generatedAgenda += `${detailedTasks[0]} and ${detailedTasks[1]}`;
                      } else {
                        const lastItem = detailedTasks.pop();
                        generatedAgenda += `${detailedTasks.join(', ')}, and ${lastItem}`;
                      }
                      
                      generatedAgenda += `. `;
                    }
                    
                    generatedAgenda += `We'll address any questions or blockers, gather early feedback on direction, and ensure everyone is aligned on deliverable scope and expectations.`;
                  }
                  
                  events.push({
                    title: `${roundKey} ${badgeText}`,
                    start: eventDate,
                    end: eventDate,
                    allDay: true,
                    className: `event-${eventType} phase-${phase.number} meeting-event`,
                    extendedProps: {
                      phase: phase.number - 1,
                      phaseNumber: phase.number,
                      phaseName: phase.displayName || phase.name,
                      round: roundKey,
                      roundName: round.name,
                      type: eventType,
                      description: event.description,
                      agenda: generatedAgenda || event.description || '',
                      deliverables: event.deliverables || round.deliverables || [],
                      team_members: event.team_members || [],
                      opheliaTeam: this.generateTeamMembers(event.team_members || (round.team ? round.team.map(t => t.role) : [])),
                      stakeholders: event.stakeholders || phase.stakeholders,
                      eventType: badgeText,
                      isMilestone: true,
                      meetingType: badgeText
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      console.log(`Total events generated: ${events.length}`);
      return events;
    },
    
    // Computed property for filtered phases (only enabled ones)
    filteredPhases() {
      if (!this.phases) return [];
      return this.phases.filter(phase => phase.enabled);
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
    },
    
    // Add a watch to initialize showPhaseDetails when phases change
    phases: {
      handler(newPhases) {
        // Initialize showPhaseDetails for all phases
        const showDetails = {};
        newPhases.forEach(phase => {
          showDetails[phase.number] = phase.number === 1; // Only first phase is expanded by default
        });
        this.showPhaseDetails = showDetails;
      },
      immediate: true
    }
  },
  mounted() {
    // Load data using DataService instead of direct fetch
    DataService.getData()
      .then(data => {
        console.log('[ProjectTimeline] Loaded data from DataService:', data);
        console.log('[ProjectTimeline] Phases count:', data.phases?.length || 0);
        
        if (!data.phases || data.phases.length === 0) {
          console.error('[ProjectTimeline] No phases found in loaded data!');
          return;
        }
        
        this.timelineData = data; // Set the timelineData property
        this.phases = data.phases;
        console.log('[ProjectTimeline] Phases assigned to component:', this.phases.length);
        
        // Log enabled phases
        const enabledPhases = this.phases.filter(phase => phase.enabled);
        console.log('[ProjectTimeline] Enabled phases count:', enabledPhases.length);
        console.log('[ProjectTimeline] Enabled phases:', enabledPhases.map(p => p.name).join(', '));
        
        // Force refresh calendar events after data is loaded
        this.$nextTick(() => {
          console.log('[ProjectTimeline] Forcing calendar refresh with new data');
          this.calendarOptions.events = [];
          setTimeout(() => {
            console.log('[ProjectTimeline] Setting calendar events');
            this.calendarOptions.events = this.generatedEvents;
            console.log('[ProjectTimeline] Calendar events set:', this.generatedEvents.length);
          }, 100);
        });
        
        // Subscribe to phase update events from other components
        DataService.onUpdate('phase-update', this.handlePhaseUpdate);
        // Subscribe to data refresh events
        DataService.onUpdate('data-refresh', this.handleDataRefresh);
        console.log('[ProjectTimeline] Component initialization complete');
      })
      .catch(error => {
        console.error('[ProjectTimeline] Error loading data from DataService:', error);
        console.error('[ProjectTimeline] Error details:', error.message);
      });

    // Force a refresh of the calendar when the component is mounted
    console.log("Component mounted, refreshing events");
    // Clear existing events and regenerate
    this.calendarOptions.events = [];
    this.$nextTick(() => {
      this.calendarOptions.events = this.generatedEvents;
      
      // Add scroll listener for infinite scrolling after calendar is rendered
      setTimeout(() => {
        this.addScrollListeners();
      }, 1000);
    });
  },
  beforeUnmount() {
    // Remove scroll listener when component is unmounted
    this.removeScrollListeners();
    
    // Unsubscribe from events
    DataService.offUpdate('phase-update', this.handlePhaseUpdate);
    DataService.offUpdate('data-refresh', this.handleDataRefresh);
  },
  methods: {
    // Handle complete data refresh
    handleDataRefresh() {
      console.log('[ProjectTimeline] Handling data refresh event');
      
      // Reload data completely
      DataService.getData()
        .then(data => {
          this.timelineData = data;
          this.phases = data.phases;
          
          // Force a refresh of the calendar events
          this.$nextTick(() => {
            this.calendarOptions.events = [];
            setTimeout(() => {
              this.calendarOptions.events = this.generatedEvents;
              console.log('[ProjectTimeline] Calendar events refreshed:', this.generatedEvents.length);
            }, 100);
          });
        })
        .catch(error => {
          console.error('[ProjectTimeline] Error reloading data:', error);
        });
    },

    // Handle phase update events from other components
    handlePhaseUpdate({ phaseName, enabled }) {
      console.log(`[ProjectTimeline] Received phase update for '${phaseName}': ${enabled}`);
      
      // Find the phase in our array and update its enabled status
      const phase = this.phases.find(p => p.name === phaseName);
      if (phase) {
        console.log(`[ProjectTimeline] Found phase: ${phase.name} (#${phase.number}), current enabled: ${phase.enabled}`);
        
        // Only update if the value actually changed
        if (phase.enabled !== enabled) {
          console.log(`[ProjectTimeline] Updating phase '${phaseName}' enabled status from ${phase.enabled} to ${enabled}`);
          phase.enabled = enabled;
          
          console.log(`[ProjectTimeline] Regenerating calendar events after phase update`);
          // Force a complete refresh of the calendar events
          this.$nextTick(() => {
            console.log(`[ProjectTimeline] Clearing events array`);
            this.calendarOptions.events = [];
            
            setTimeout(() => {
              console.log(`[ProjectTimeline] Regenerating events array`);
              // For debugging, log all enabled phases before regenerating events
              const enabledPhases = this.phases.filter(p => p.enabled);
              console.log(`[ProjectTimeline] Enabled phases for event generation (${enabledPhases.length}):`, 
                enabledPhases.map(p => `${p.name} (#${p.number})`).join(', '));
              
              this.calendarOptions.events = this.generatedEvents;
              console.log(`[ProjectTimeline] Calendar events refreshed: ${this.generatedEvents.length} events generated`);
            }, 100);
          });
        } else {
          console.log(`[ProjectTimeline] Phase '${phaseName}' already has enabled=${enabled}, no update needed`);
        }
      } else {
        console.error(`[ProjectTimeline] Could not find phase '${phaseName}' in this.phases`);
        console.log(`[ProjectTimeline] Available phases:`, this.phases.map(p => `${p.name} (#${p.number})`));
      }
    },
    
    // Add this new method to centralize scroll listener attachment
    addScrollListeners() {
      console.log('Attempting to add scroll listeners');
      
      // Try different selectors for the scrollable area
      const selectors = [
        '.fc-view-harness',
        '.fc-scroller',
        '.fc-view-harness .fc-scroller',
        '.fc-scrollgrid-section-body',
        '.fc-scrollgrid'
      ];
      
      let listenerAdded = false;
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.addEventListener('scroll', this.handleCalendarScroll);
          console.log(`Added scroll listener to ${selector}`);
          listenerAdded = true;
        });
      });
      
      if (!listenerAdded) {
        console.warn('Could not find any scrollable elements to attach listeners');
      }
    },
    
    // Add this new method to centralize scroll listener removal
    removeScrollListeners() {
      console.log('Removing scroll listeners');
      
      const selectors = [
        '.fc-view-harness',
        '.fc-scroller',
        '.fc-view-harness .fc-scroller',
        '.fc-scrollgrid-section-body',
        '.fc-scrollgrid'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.removeEventListener('scroll', this.handleCalendarScroll);
        });
      });
    },

    // Toggle expanded state of a phase
    togglePhaseDetails(phaseNum) {
      this.showPhaseDetails[phaseNum] = !this.showPhaseDetails[phaseNum];
    },
    
    // Handle calendar event click
    handleEventClick(info) {
      // Check if we already have this event selected to avoid duplicates
      if (this.selectedEvent && 
          this.selectedEvent.id === info.event.id) {
        return;
      }
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
    },
    
    // Add new date format methods
    formatDateDay(date) {
      const d = new Date(date);
      return d.getDate();
    },
    
    formatDateMonth(date) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'long' });
    },
    
    formatDateYear(date) {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { year: 'numeric' });
    },
    
    // Add this method to determine role-based color classes
    getRoleColorClass(role) {
      if (!role) return '';
      
      if (role.includes('Creative Director')) {
        return 'role-creative-director';
      } else if (role.includes('Art Director')) {
        return 'role-art-director';
      } else if (role.includes('Executive Producer') || role.includes('Line Producer')) {
        return 'role-producer';
      } else if (role.includes('Motion Designer')) {
        return 'role-motion';
      } else if (role.includes('Graphic Designer')) {
        return 'role-graphic';
      } else if (role.includes('Director / Photographer')) {
        return 'role-director';
      } else if (role.includes('Merch Designer')) {
        return 'role-merch';
      } else {
        return 'role-other';
      }
    },
    
    formatMeetingDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    },
    
    // Format agenda markdown into HTML
    formatAgendaMarkdown(markdown) {
      // Since we're now using plain text paragraphs instead of markdown, just return the text
      return markdown || '';
    },
    
    // Helper to generate a week key (year-weeknum) for grouping events
    getWeekKey(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      // Thursday in current week decides the year.
      d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
      // January 4 is always in week 1.
      const week1 = new Date(d.getFullYear(), 0, 4);
      // Adjust to Thursday in week 1 and count number of weeks from date to week1.
      const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      return `${d.getFullYear()}-${weekNum}`;
    },
    
    // Helper to generate team members list
    generateTeamMembers(teamMemberRoles) {
      if (!teamMemberRoles || !teamMemberRoles.length) return [];
      
      const opheliaTeam = [];
      
      // Get all team members from creative team data, with null checks
      const allTeamMembers = [];
      
      // Safely add team members if they exist
      if (this.timelineData && this.timelineData.creativeTeam) {
        if (this.timelineData.creativeTeam.leadership) {
          allTeamMembers.push(...this.timelineData.creativeTeam.leadership);
        }
        if (this.timelineData.creativeTeam.designers) {
          allTeamMembers.push(...this.timelineData.creativeTeam.designers);
        }
        if (this.timelineData.creativeTeam.production) {
          allTeamMembers.push(...this.timelineData.creativeTeam.production);
        }
        if (this.timelineData.creativeTeam.creatives) {
          allTeamMembers.push(...this.timelineData.creativeTeam.creatives);
        }
      }
      
      // For each team member listed in the event
      teamMemberRoles.forEach(teamMemberRole => {
        // Handle the specific case of "Creative Directors" -> "Creative Director"
        const normalizedRole = teamMemberRole === "Creative Directors" ? "Creative Director" : teamMemberRole;
        
        // Find the exact team member in the creative team data
        const foundMember = allTeamMembers.find(member => 
          member && member.role === normalizedRole
        );
        
        if (foundMember) {
          opheliaTeam.push(`${foundMember.name} (${foundMember.role})`);
        } else {
          // Fallback if just the role is provided without a specific person
          // Use the normalized role to ensure "Creative Director" is displayed correctly
          opheliaTeam.push(normalizedRole);
        }
      });
      
      return opheliaTeam;
    },
    
    // Get the appropriate title for the details panel
    getDetailPanelTitle(event) {
      if (event.extendedProps.isMilestone) {
        return `${event.extendedProps.phaseName}\n${event.extendedProps.roundName} - ${event.extendedProps.eventType}`;
      }
      
      // For non-meeting events, just use the event title
      return event.title;
    },
    
    // Format team members for display
    formatTeamMembers(teamMembers) {
      if (!teamMembers || !Array.isArray(teamMembers)) {
        return [];
      }
      
      return teamMembers.map(member => {
        return {
          name: member,
          role: member // Since we only have names in the team_members array
        };
      });
    },

    // Get the Monday of the week containing the given date
    getWeekStart(date) {
      const d = new Date(date);
      const day = d.getDay(); // 0 is Sunday, 1 is Monday
      
      // Calculate days to subtract to get to Monday
      const daysToSubtract = day === 0 ? 6 : day - 1;
      
      // Create a new date that is the Monday of this week
      const monday = new Date(d);
      monday.setDate(d.getDate() - daysToSubtract);
      monday.setHours(0, 0, 0, 0);
      
      return monday;
    },

    // Helper to get the Monday of the week for a given date
    getMondayOfWeek(date) {
      const day = date.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(date);
      monday.setDate(date.getDate() - diff);
      monday.setHours(0, 0, 0, 0);
      return monday;
    },

    // Scroll to current week after initial render
    scrollToCurrentWeek() {
      setTimeout(() => {
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10); // YYYY-MM-DD format
        const currentDayCell = document.querySelector(`.fc-day[data-date="${formattedDate}"]`);
        
        if (currentDayCell) {
          // Find the row containing this day
          const row = currentDayCell.closest('.fc-scrollgrid-section-body');
          if (row) {
            // Scroll to position this row at the top of the viewport
            row.scrollIntoView({ block: 'start', behavior: 'auto' });
            console.log('Scrolled to current week');
          } else {
            console.log('Could not find row for current day');
          }
        } else {
          console.log('Could not find current day cell');
        }
      }, 500); // Short delay to ensure calendar is fully rendered
    },

    // Handle calendar scroll
    handleCalendarScroll(event) {
      // Throttle scroll events to avoid excessive calls
      if (!this.isScrolling) {
        this.isScrolling = true;
        setTimeout(() => {
          const scroller = event.target;
          if (scroller) {
            const scrollTop = scroller.scrollTop;
            const scrollHeight = scroller.scrollHeight;
            const clientHeight = scroller.clientHeight;
            
            console.log(`Scroll position: ${scrollTop}/${scrollHeight}, client height: ${clientHeight}`);
            
            // Check if we're near the bottom (within 200px)
            if (scrollTop + clientHeight > scrollHeight - 200) {
              console.log('Near bottom, loading more events');
              this.loadMoreEvents('bottom');
            }
            
            // Check if we're near the top (within 200px)
            if (scrollTop < 200) {
              console.log('Near top, loading more events');
              this.loadMoreEvents('top');
            }
          }
          this.isScrolling = false;
        }, 100);
      }
    },
    
    // Load more events in either direction
    loadMoreEvents(direction) {
      // Get the calendar API
      const calendarEl = this.$el.querySelector('.fc');
      if (!calendarEl || !calendarEl.__vue__) {
        console.error('Could not find calendar element or Vue instance');
        return;
      }
      
      const calendarApi = calendarEl.__vue__.getApi();
      if (!calendarApi) {
        console.error('Could not access calendar API');
        return;
      }
      
      // Only apply infinite scrolling to the timeline view
      const currentViewType = calendarApi.view.type;
      if (currentViewType !== 'dayGrid' && !currentViewType.includes('timeline')) {
        console.log(`Current view is ${currentViewType}, not applying infinite scroll`);
        return;
      }
      
      console.log(`Loading more events in direction: ${direction}`);
      
      const currentRange = calendarApi.view.currentRange;
      const currentStart = currentRange.start;
      const currentEnd = currentRange.end;
      
      if (direction === 'bottom') {
        // Add more days to the bottom
        const newEnd = new Date(currentEnd);
        newEnd.setDate(newEnd.getDate() + 28); // Add 4 more weeks
        
        console.log(`Extending view to: ${newEnd.toISOString()}`);
        
        // Change view with new date range
        calendarApi.changeView('timelineView', {
          start: currentStart,
          end: newEnd
        });
        
        console.log('Loaded more weeks at bottom');
      } else if (direction === 'top') {
        // Add more days to the top
        const newStart = new Date(currentStart);
        newStart.setDate(newStart.getDate() - 28); // Add 4 more weeks at top
        
        console.log(`Extending view to: ${newStart.toISOString()}`);
        
        // Preserve scroll position
        const scrollPosition = this.$el.querySelector('.fc-view-harness')?.scrollTop || 0;
        
        // Change view with new date range
        calendarApi.changeView('timelineView', {
          start: newStart,
          end: currentEnd
        });
        
        // Restore scroll position after a short delay
        setTimeout(() => {
          const viewHarness = this.$el.querySelector('.fc-view-harness');
          if (viewHarness) {
            viewHarness.scrollTop = scrollPosition + 500; // Add offset to account for new content
            console.log(`Restored scroll position to ${viewHarness.scrollTop}`);
          }
        }, 100);
        
        console.log('Loaded more weeks at top');
      }
    },
  }
}
</script>

<style scoped>
/* Main Layout Styles */
.timeline-container {
  position: relative;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  min-height: calc(100vh - 170px); /* Adjust to leave more space for header/footer */
  height: calc(100vh - 170px); /* Fixed height to contain everything */
  width: 100%;
  max-width: 100%;
  background-color: #0a0a0a;
  overflow: hidden;
}

.left-controls {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-container {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%; /* Take full height of parent */
  max-height: 100%; /* Never exceed parent height */
  max-width: 100%;
  background-color: #0a0a0a;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.calendar-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(40, 40, 40, 0.2), rgba(0, 0, 0, 0.05));
  pointer-events: none;
  z-index: 1;
}

/* Premium Legend Panel Styles */
.legend-panel {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #0a0a0a;
  color: #ffffff;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 10;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.legend-panel .glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 40%, rgba(40, 40, 40, 0.2), rgba(0, 0, 0, 0.05));
  pointer-events: none;
  z-index: 0;
}

.legend-panel .panel-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #333 #111;
}

.legend-panel .panel-inner::-webkit-scrollbar {
  width: 6px;
}

.legend-panel .panel-inner::-webkit-scrollbar-track {
  background-color: #111;
}

.legend-panel .panel-inner::-webkit-scrollbar-thumb {
  background-color: #333;
  border-radius: 3px;
}

.legend-header {
  padding: 12px 16px;
  background-color: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.legend-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #ffffff;
}

.legend-body {
  padding: 12px 0;
  flex: 1;
  overflow-y: auto;
}

.legend-section {
  margin-bottom: 16px;
  padding: 0 16px;
}

.legend-section.compact {
  margin-bottom: 12px;
}

.legend-section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.phase-group {
  margin-bottom: 8px;
}

.phase-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  padding: 6px 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.phase-title:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.toggle-icon {
  font-weight: 600;
  font-size: 1rem;
  opacity: 0.8;
}

.phase-details {
  padding: 4px 0 4px 12px;
  margin-top: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 3px 0;
}

.legend-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 8px;
  flex-shrink: 0;
}

/* Phase icons */
.legend-icon.phase-1.round-1 { background-color: #4c78b0; }
.legend-icon.phase-1.round-2 { background-color: #3a5d8c; }
.legend-icon.phase-1.round-3 { background-color: #294369; }
.legend-icon.phase-1.round-4 { background-color: #1a2c46; }

.legend-icon.phase-2.round-1 { background-color: #41a58e; }
.legend-icon.phase-2.round-2 { background-color: #328370; }
.legend-icon.phase-2.round-3 { background-color: #246152; }

.legend-icon.phase-3.round-1 { background-color: #c5678d; }
.legend-icon.phase-3.round-2 { background-color: #a84e70; }
.legend-icon.phase-3.round-3 { background-color: #8c3755; }
.legend-icon.phase-3.round-4 { background-color: #6e243f; }

.legend-icon.phase-4.round-1 { background-color: #d8c478; }
.legend-icon.phase-4.round-2 { background-color: #bba55e; }
.legend-icon.phase-4.round-3 { background-color: #9e8845; }

/* Phase Information Section */
.phase-info {
  margin-top: 8px;
}

.phase-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.phase-select-btn {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.phase-select-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.phase-select-btn.active {
  background-color: rgba(157, 134, 255, 0.2);
  color: #ffffff;
}

.phase-info-controls {
  margin-top: 12px;
  text-align: center;
}

.back-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.info-section {
  margin-bottom: 12px;
}

.info-section h5 {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-section ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  position: relative;
  padding: 3px 0 3px 16px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.info-section li::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

/* Detail panel */
.details-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100%;
  background-color: #111111;
  overflow: hidden;
  z-index: 1000;
  color: #ffffff;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.details-panel .glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(40, 40, 40, 0.2), rgba(0, 0, 0, 0.05));
  pointer-events: none;
  z-index: 0;
}

.details-panel .panel-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.details-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #0a0a0a;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.phase-1-header::after,
.phase-2-header::after,
.phase-3-header::after,
.phase-4-header::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3px;
  z-index: 2;
}

.phase-1-header::after { background-color: #4c78b0; }
.phase-2-header::after { background-color: #41a58e; }
.phase-3-header::after { background-color: #c5678d; }
.phase-4-header::after { background-color: #d8c478; }

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  line-height: 1;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.details-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: #333 #111;
}

.details-body::-webkit-scrollbar {
  width: 6px;
}

.details-body::-webkit-scrollbar-track {
  background-color: #111;
}

.details-body::-webkit-scrollbar-thumb {
  background-color: #333;
  border-radius: 3px;
}

/* Event Overview Section */
.event-overview {
  display: flex;
  padding: 24px 20px;
  position: relative;
  background: linear-gradient(to bottom, #141414, #0c0c0c);
  overflow: hidden;
}

.event-overview::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.phase-1-overview { border-left: 3px solid #4c78b0; }
.phase-2-overview { border-left: 3px solid #41a58e; }
.phase-3-overview { border-left: 3px solid #c5678d; }
.phase-4-overview { border-left: 3px solid #d8c478; }

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  min-width: 70px;
}

.date-day {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  background: linear-gradient(to bottom, #ffffff, #aaaaaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.date-month {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
}

.date-year {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.event-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #ffffff;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.event-subtitle {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.2;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-tags span {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
  display: inline-flex;
  align-items: center;
}

/* Panel Sections */
.panel-section {
  padding: 24px 20px;
  position: relative;
}

.panel-section:not(:last-child)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent);
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 16px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Agenda Section */
.agenda-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.agenda-content .agenda-h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffffff;
}

.agenda-content .agenda-h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: rgba(255, 255, 255, 0.9);
}

.agenda-content .agenda-ul {
  list-style-type: none;
  padding: 0 0 0 6px;
  margin: 8px 0 16px 0;
}

.agenda-content .agenda-li {
  position: relative;
  padding: 4px 0 4px 16px;
  margin-bottom: 6px;
}

.agenda-content .agenda-li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 4px;
  color: rgba(255, 255, 255, 0.5);
}

.agenda-content::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 8px;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.05);
  font-family: Georgia, serif;
}

/* Team Members Grid */
.team-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.team-member {
  position: relative;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  display: flex;
}

.team-member:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.member-info {
  padding: 14px;
  flex: 1;
  z-index: 1;
}

.member-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #fff;
  margin-bottom: 4px;
}

.member-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.member-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background-color: currentColor;
  opacity: 0.2;
  transform-origin: right center;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

/* Role Colors */
.role-creative-director {
  color: #8667f0;
}

.role-art-director {
  color: #3c9fff;
}

.role-producer {
  color: #20bcbd;
}

.role-motion {
  color: #ff66cc;
}

.role-graphic {
  color: #10b894;
}

.role-director {
  color: #ff9f43;
}

.role-merch {
  color: #ff7675;
}

.role-other {
  color: #a3a1bf;
}

/* Stakeholders Grid */
.stakeholder-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stakeholder-item {
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
}

.stakeholder-variant-0 {
  border-left: 2px solid rgba(255, 212, 59, 0.7);
}

.stakeholder-variant-1 {
  border-left: 2px solid rgba(229, 194, 40, 0.7);
}

.stakeholder-variant-2 {
  border-left: 2px solid rgba(202, 170, 20, 0.7);
}

/* Styled Lists */
.styled-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.styled-list li {
  position: relative;
  padding: 6px 0 6px 20px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
}

.styled-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

/* Calendar theme adjustments */
:deep(.fc) {
  background-color: transparent;
  border-radius: 8px;
  overflow: hidden;
  border: none !important;
  height: 100% !important;
  min-height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

:deep(.fc-theme-standard td), 
:deep(.fc-theme-standard th) {
  border-color: #0c0c0c !important;
}

:deep(.fc-theme-standard .fc-scrollgrid) {
  border: none !important;
}

:deep(.fc-view) {
  width: 100% !important;
}

:deep(.fc-view-harness) {
  width: 100% !important;
  background-color: transparent;
  overflow: auto;
  flex: 1;
}

:deep(.fc th) {
  background-color: #0a0a0a;
  color: rgba(255, 255, 255, 0.8);
  border-color: #0c0c0c !important;
  padding: 10px 0;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

:deep(.fc td) {
  border-color: #0c0c0c !important;
  height: 65px !important;
  vertical-align: top !important;
}

:deep(.fc-day) {
  background-color: #141414 !important;
}

:deep(.fc-day-today) {
  background-color: rgba(157, 134, 255, 0.08) !important;
}

:deep(.fc-day-other) {
  background-color: #111111 !important;
  opacity: 1 !important;
}

/* Make weekend background more subtle */
:deep(.fc-day-sat), :deep(.fc-day-sun) {
  background-color: #131313 !important;
}

:deep(.fc-col-header-cell) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.fc-header-toolbar) {
  background-color: #0a0a0a;
  padding: 12px 16px;
  border-bottom: 1px solid #0c0c0c !important;
}

:deep(.fc-daygrid-day-number) {
  color: rgba(255, 255, 255, 0.9);
  padding: 8px;
  font-size: 0.85rem;
}

:deep(.fc-daygrid-day-top) {
  justify-content: flex-start;
  padding-top: 4px;
  padding-left: 4px;
}

/* Clear layout for 2-row event display */
:deep(.fc-daygrid-day-events) {
  display: grid !important;
  grid-template-rows: 25px 25px !important;
  grid-gap: 3px !important;
  min-height: 55px !important;
  padding-top: 2px !important;
}

/* Fix multi-day events to always show in row 1 */
:deep(.fc-event.phase-event) {
  background-color: #0a0a0a !important;
  height: 23px !important;
  margin: 0 !important;
  grid-row: 1 !important;
  border-width: 0 !important;
  border-left-width: 3px !important;
  z-index: 1 !important;
}

/* Fix meeting events to always show in row 2 */
:deep(.fc-event.meeting-event) {
  background-color: #0a0a0a !important;
  height: 23px !important;
  margin: 0 !important;
  grid-row: 2 !important;
  border-width: 0 !important;
  border-left-width: 3px !important;
  z-index: 2 !important;
}

/* Custom event title for the grid layout */
:deep(.custom-event-title) {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: normal;
  overflow: visible;
  text-overflow: ellipsis;
  flex: 1;
}

:deep(.custom-event-badge) {
  font-size: 0.7rem;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 400;
  margin-left: 2px;
  background-color: rgba(255, 255, 255, 0.15);
  white-space: nowrap;
}

:deep(.custom-event-wrapper) {
  width: 100%;
  height: 100%;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

:deep(.custom-event-inner) {
  padding: 3px 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 20px;
  height: 100%;
}

/* Phase color styling */
:deep(.fc-event.phase-1) {
  border-left-color: #4c78b0 !important;
  color: #fff !important;
}

:deep(.fc-event.phase-2) {
  border-left-color: #41a58e !important;
  color: #fff !important;
}

:deep(.fc-event.phase-3) {
  border-left-color: #c5678d !important;
  color: #fff !important;
}

:deep(.fc-event.phase-4) {
  border-left-color: #d8c478 !important;
  color: #fff !important;
}

:deep(.fc-event.phase-1-meeting) { border-left-color: #4c78b0 !important; }
:deep(.fc-event.phase-2-meeting) { border-left-color: #41a58e !important; }
:deep(.fc-event.phase-3-meeting) { border-left-color: #c5678d !important; }
:deep(.fc-event.phase-4-meeting) { border-left-color: #d8c478 !important; }

/* Remove overflow hidden to prevent multi-day event clipping */
:deep(.fc-daygrid-event-harness) {
  margin: 0 !important;
}

:deep(.fc-daygrid-block-event .fc-event-time), 
:deep(.fc-daygrid-block-event .fc-event-title) {
  padding: 0 !important;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 65px !important;
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

@media (max-width: 520px) {
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .event-overview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .event-date {
    margin-right: 0;
    margin-bottom: 16px;
  }
}

/* Make sure all CSS classes are correctly defined */
:deep(.fc-event.phase-3), 
:deep(.fc-event.phase-4) {
  /* Ensure these have the same styles as phase-1 and phase-2 */
  background-color: #0a0a0a !important;
  height: 23px !important;
  margin: 0 !important;
  grid-row: 1 !important;
  border-width: 0 !important; 
  border-left-width: 3px !important;
  z-index: 1 !important;
}

:deep(.fc-event.phase-3-meeting),
:deep(.fc-event.phase-4-meeting) {
  /* Ensure meeting events for phase 3 and 4 have correct styles */
  background-color: #0a0a0a !important;
  height: 23px !important;
  margin: 0 !important;
  grid-row: 2 !important;
  border-width: 0 !important;
  border-left-width: 3px !important;
  z-index: 2 !important;
}

.fc-daygrid-day {
  min-height: 110px !important;
}

.custom-event-container {
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.event-title {
  font-weight: 500;
  white-space: normal;
  overflow: visible;
  text-overflow: ellipsis;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.event-title-text {
  flex: 1;
  min-width: 0;
}

.event-badge {
  display: inline-block;
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.event-kickoff .event-badge {
  background-color: #4a00e0;
  color: white;
}

.event-checkin .event-badge {
  background-color: #00a8cc;
  color: white;
}

.event-review .event-badge {
  background-color: #f50057;
  color: white;
}

.fc .fc-daygrid-event {
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  margin-bottom: 3px;
  margin-top: 2px;
}

.fc .fc-daygrid-day-events {
  padding: 0 4px;
}

.fc .fc-event-kickoff {
  background-color: rgba(74, 0, 224, 0.1);
  border-color: #4a00e0;
  border-left: 3px solid #4a00e0;
}

.fc .fc-event-checkin {
  background-color: rgba(0, 168, 204, 0.1);
  border-color: #00a8cc;
  border-left: 3px solid #00a8cc;
}

.fc .fc-event-review {
  background-color: rgba(245, 0, 87, 0.1);
  border-color: #f50057;
  border-left: 3px solid #f50057;
}

.fc-more-link {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  color: #a9b4f6 !important;
}

/* Calendar Event Styles */
:deep(.fc-daygrid-event) {
  background-color: transparent;
  border: none;
  padding: 2px 0;
  margin-bottom: 2px;
  overflow: visible;
}

:deep(.custom-event-container) {
  width: 100%;
  border-radius: 4px;
  padding: 3px 5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  background-color: #2a2a2a;
  border-left: 3px solid #8257ff;
  margin-bottom: 3px;
}

:deep(.event-title) {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 0;
  gap: 6px;
}

:deep(.event-title-text) {
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
}

:deep(.event-badge) {
  font-size: 0.7rem;
  background-color: #8257ff;
  color: white;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 500;
}

:deep(.fc-daygrid-day-frame) {
  height: 100%;
  min-height: 110px;
}

:deep(.fc-more-link) {
  background-color: rgba(130, 87, 255, 0.1);
  color: #8257ff;
  border-radius: 3px;
  padding: 2px 5px;
  margin-top: 2px;
  font-size: 0.75rem;
  font-weight: 500;
}

:deep(.fc-popover) {
  background-color: #1a1a1a;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.fc-popover-header) {
  background-color: #2a2a2a;
  color: white;
}

:deep(.fc-popover-close) {
  color: #8257ff;
}

/* Update badge colors by event type */
:deep(.event-start) .event-badge {
  background-color: #41a58e;
}

:deep(.event-check_in) .event-badge {
  background-color: #8257ff;
}

:deep(.event-review) .event-badge {
  background-color: #f05d5e;
}

/* Add phase-specific coloring */
:deep(.event-start)[class*="phase-1"] .custom-event-container,
:deep(.event-check_in)[class*="phase-1"] .custom-event-container,
:deep(.event-review)[class*="phase-1"] .custom-event-container {
  border-left-color: #4c78b0;
}

:deep(.event-start)[class*="phase-2"] .custom-event-container,
:deep(.event-check_in)[class*="phase-2"] .custom-event-container,
:deep(.event-review)[class*="phase-2"] .custom-event-container {
  border-left-color: #41a58e;
}

:deep(.event-start)[class*="phase-3"] .custom-event-container,
:deep(.event-check_in)[class*="phase-3"] .custom-event-container,
:deep(.event-review)[class*="phase-3"] .custom-event-container {
  border-left-color: #c5678d;
}

:deep(.event-start)[class*="phase-4"] .custom-event-container,
:deep(.event-check_in)[class*="phase-4"] .custom-event-container,
:deep(.event-review)[class*="phase-4"] .custom-event-container {
  border-left-color: #d8c478;
}

/* Update CSS for round events (Monday-Friday background) */
:deep(.round-event) {
  background-color: rgba(25, 25, 25, 0.9) !important;
  border-radius: 4px !important;
  margin: 1px 1px !important;
  padding: 0 !important;
  border-left: 3px solid #8257ff !important;
  z-index: 0 !important;
  height: auto !important;
}

/* Phase-specific colors for round events */
:deep(.round-event.phase-1) {
  background-color: rgba(76, 120, 176, 0.1) !important;
  border-left-color: #4c78b0 !important;
}

:deep(.round-event.phase-2) {
  background-color: rgba(65, 165, 142, 0.1) !important;
  border-left-color: #41a58e !important;
}

:deep(.round-event.phase-3) {
  background-color: rgba(197, 103, 141, 0.1) !important;
  border-left-color: #c5678d !important;
}

:deep(.round-event.phase-4) {
  background-color: rgba(216, 196, 120, 0.1) !important;
  border-left-color: #d8c478 !important;
}

/* Round event title styling */
:deep(.round-event-container) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  pointer-events: all;
}

:deep(.round-title) {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  padding: 2px 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Meeting events styling */
:deep(.meeting-event) {
  margin-top: 24px !important; /* Push down to second row */
  position: relative;
  z-index: 2 !important;
}

:deep(.meeting-event .custom-event-container) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Make sure events show properly on top of background events */
:deep(.fc-daygrid-event-harness) {
  z-index: 3 !important;
}

/* Add styling for round events */
:deep(.event-round) .custom-event-container {
  background-color: #2a2a2a;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-bottom: 3px;
}

/* Phase-specific colors for round events */
:deep(.event-round.phase-1) .custom-event-container {
  border-left-color: #4c78b0;
}

:deep(.event-round.phase-2) .custom-event-container {
  border-left-color: #41a58e;
}

:deep(.event-round.phase-3) .custom-event-container {
  border-left-color: #c5678d;
}

:deep(.event-round.phase-4) .custom-event-container {
  border-left-color: #d8c478;
}

/* Revision event name styling */
:deep(.event-phase-name) {
  font-weight: 700;
  color: white;
}

:deep(.event-round-name) {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
}

/* Meeting events title should have badge on right */
:deep(.meeting-event) .event-title {
  justify-content: space-between;
}

/* Support for infinite scroll */
:deep(.fc-view-harness) {
  height: calc(100vh - 280px) !important;
  min-height: 400px;
  overflow-y: auto !important;
  scroll-behavior: smooth;
}

:deep(.fc-scroller) {
  overflow: visible !important;
  height: auto !important;
}

:deep(.fc-scrollgrid) {
  overflow: visible !important;
  height: auto !important;
}

:deep(.fc-scrollgrid-section) {
  height: auto !important;
}

:deep(.fc-scroller-liquid-absolute) {
  position: relative !important;
  overflow: visible !important;
}

/* Additional styles for the timeline view */
:deep(.fc-timelineView-view) {
  min-height: calc(100vh - 280px) !important;
  overflow-y: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid) {
  border-bottom: 1px solid #0c0c0c !important;
  border-right: 1px solid #0c0c0c !important;
}

/* Ensure Month view shows a full month grid */
:deep(.fc-dayGridMonth-view) {
  min-height: 600px !important;
}

/* Highlight the current week for better visibility */
:deep(.fc-day-today) {
  background-color: rgba(157, 134, 255, 0.15) !important;
}

/* Fix month view display */
:deep(.fc-dayGridMonth-view) {
  height: 100% !important;
  overflow: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid) {
  height: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-body) {
  height: auto !important;
  width: 100% !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid-sync-table) {
  height: auto !important;
  width: 100% !important;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day) {
  min-height: 110px !important;
  height: 110px !important;
}

/* Ensure consistent day cell sizing */
:deep(.fc-dayGridMonth-view table) {
  height: auto !important;
}

:deep(.fc-dayGridMonth-view tr) {
  height: 110px !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid-sync-inner) {
  min-height: 110px !important;
}

:deep(.fc-dayGridMonth-view .fc-view-harness) {
  height: auto !important;
  min-height: 700px !important; /* Increased from 500px to give more space */
}

:deep(.fc-view-harness-active) {
  height: auto !important;
}

/* Explicitly style active button state */
:deep(.fc-button-active) {
  background-color: #8257ff !important;
  color: white !important;
  border-color: #8257ff !important;
  box-shadow: 0 0 0 0.2rem rgba(130, 87, 255, 0.25) !important;
}

/* Harmonize month view with timeline styling */
:deep(.fc-dayGridMonth-view) {
  background-color: #0a0a0a !important;
}


:deep(.fc-dayGridMonth-view .fc-daygrid-day) {
  background-color: #141414 !important;
  height: 110px !important; /* Match the height from timeline view */
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day-frame) {
  height: 100% !important;
  min-height: 110px !important; /* Ensure consistent height */
}

:deep(.fc-dayGridMonth-view td) {
  height: 110px !important; /* Force consistent cell height */
}

:deep(.fc-dayGridMonth-view .fc-day-other) {
  background-color: #111111 !important;
}

:deep(.fc-dayGridMonth-view .fc-day-today) {
  background-color: rgba(157, 134, 255, 0.08) !important;
}

:deep(.fc-dayGridMonth-view .fc-day-sat),
:deep(.fc-dayGridMonth-view .fc-day-sun) {
  background-color: #131313 !important;
}

:deep(.fc-dayGridMonth-view .fc-daygrid-day-events) {
  display: grid !important;
  grid-template-rows: 25px 25px !important;
  grid-gap: 3px !important;
  min-height: 55px !important;
  padding-top: 2px !important;
}

/* Ensure events are styled consistently in month view */
:deep(.fc-dayGridMonth-view .event-round) {
  grid-row: 1 !important;
}

:deep(.fc-dayGridMonth-view .meeting-event) {
  grid-row: 2 !important;
}

/* Override any default month view-specific styling */
:deep(.fc-dayGridMonth-view .fc-daygrid-event) {
  margin: 0 !important;
  padding: 0 !important;
}

/* Match button active state */
:deep(.fc-dayGridMonth-button.fc-button-active),
:deep(.fc-timelineView-button.fc-button-active) {
  background-color: #7073b8 !important;
  color: white !important;
  border-color: #7073b8 !important;
}

/* Fix month view header to match timeline view */
:deep(.fc-dayGridMonth-view .fc-col-header) {
  height: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-col-header-cell) {
  height: 32px !important;
  padding: 0 !important;
  line-height: 32px !important;
  vertical-align: middle !important;
}

:deep(.fc-dayGridMonth-view .fc-col-header-cell-cushion) {
  padding: 4px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  height: auto !important;
}

:deep(.fc-col-header) {
  height: auto !important;
}

/* Fix for the header row to be exactly the same height as text */
:deep(.fc-dayGridMonth-view .fc-scrollgrid-section-header) {
  height: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid-section-header table) {
  height: auto !important;
}

:deep(.fc-dayGridMonth-view .fc-scrollgrid-section-header tr) {
  height: auto !important;
}

/* Unified styling for all views */
:deep(.fc-daygrid-day) {
  height: 110px !important;
  min-height: 110px !important;
  background-color: #141414 !important;
}

:deep(.fc-day-other) {
  background-color: #111111 !important;
}

:deep(.fc-day-today) {
  background-color: rgba(157, 134, 255, 0.08) !important;
}

:deep(.fc-day-sat),
:deep(.fc-day-sun) {
  background-color: #131313 !important;
}

:deep(.fc-daygrid-day-frame) {
  height: 100% !important;
  min-height: 110px !important;
}

:deep(.fc-daygrid-day-events) {
  display: grid !important;
  grid-template-rows: 25px 25px !important;
  grid-gap: 3px !important;
  min-height: 55px !important;
  padding-top: 2px !important;
}

:deep(.fc-view-harness) {
  height: auto !important;
  min-height: 700px !important;
}

:deep(.fc-view-harness-active) {
  height: auto !important;
}

/* Button styling */
:deep(.fc-button-active) {
  background-color: #8257ff !important;
  color: white !important;
  border-color: #8257ff !important;
  box-shadow: 0 0 0 0.2rem rgba(130, 87, 255, 0.25) !important;
}

/* Specific styling for the month view to match timeline view */
:deep(.timeline-styled-view) {
  background-color: #0a0a0a !important;
}

:deep(.timeline-styled-view .fc-col-header) {
  height: 32px !important; 
}

:deep(.timeline-styled-view .fc-col-header-cell) {
  height: 32px !important;
  background-color: #0a0a0a !important;
}

:deep(.timeline-styled-view .fc-col-header-cell-cushion) {
  padding: 4px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
}

:deep(.timeline-styled-view .fc-daygrid-day-events) {
  display: grid !important;
  grid-template-rows: 25px 25px !important;
  grid-gap: 3px !important;
  min-height: 55px !important;
  padding-top: 2px !important;
}

/* Fix month view header spacing */
:deep(.timeline-styled-view .fc-scrollgrid-section-header) {
  height: 32px !important;
  max-height: 32px !important;
  overflow: hidden !important;
}

:deep(.timeline-styled-view .fc-scrollgrid-section-header table) {
  height: 32px !important;
  margin: 0 !important;
}

:deep(.timeline-styled-view .fc-scrollgrid-section-header tr) {
  height: 32px !important;
}

:deep(.timeline-styled-view .fc-scrollgrid-section-header th) {
  height: 32px !important;
  vertical-align: middle !important;
}

:deep(.timeline-styled-view .fc-scrollgrid-section-header .fc-scrollgrid-sync-inner) {
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Remove any gap between header and body */
:deep(.timeline-styled-view .fc-scrollgrid-section) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.timeline-styled-view .fc-scrollgrid-section > td) {
  padding: 0 !important;
  border-top: 0 !important;
}

/* Very specific month view header styling */
:deep(.month-view) .fc-col-header,
body.month-view-active :deep(.fc-col-header) {
  height: 32px !important;
  max-height: 32px !important;
  overflow: hidden !important;
  border-bottom: 1px solid #222 !important;
}

:deep(.month-view) .fc-col-header *,
body.month-view-active :deep(.fc-col-header) * {
  height: 32px !important;
  max-height: 32px !important;
}

:deep(.month-view) .fc-col-header-cell,
body.month-view-active :deep(.fc-col-header-cell) {
  background-color: #0a0a0a !important;
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 !important;
  vertical-align: middle !important;
}

:deep(.month-view) .fc-scrollgrid-sync-inner,
body.month-view-active :deep(.fc-scrollgrid-sync-inner) {
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.month-view) .fc-col-header-cell-cushion,
body.month-view-active :deep(.fc-col-header-cell-cushion) {
  padding: 4px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  height: auto !important;
}

/* Remove any gap between header and body in month view */
:deep(.month-view) .fc-scrollgrid-section,
body.month-view-active :deep(.fc-scrollgrid-section) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.month-view) .fc-scrollgrid-section > td,
body.month-view-active :deep(.fc-scrollgrid-section > td) {
  padding: 0 !important;
  border-top: 0 !important;
}

:deep(.month-view) .fc-scroller,
body.month-view-active :deep(.fc-scroller) {
  overflow: hidden !important;
}

.fc-dayGridMonth-view .fc-col-header {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  overflow: hidden !important;
}

.fc-dayGridMonth-view .fc-scrollgrid-section-header {
  height: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  overflow: hidden !important;
}

.fc-dayGridMonth-view .fc-scrollgrid-section-header table {
  height: 32px !important;
  margin: 0 !important;
}

.fc-dayGridMonth-view .fc-scrollgrid-section-header tr {
  height: 32px !important;
}

.fc-dayGridMonth-view .fc-col-header-cell {
  height: 32px !important;
  padding: 0 !important;
  line-height: 32px !important;
  vertical-align: middle !important;
}

.fc-dayGridMonth-view .fc-col-header-cell-cushion {
  padding: 4px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  height: auto !important;
}

.fc-dayGridMonth-view .fc-scrollgrid-section-header .fc-scrollgrid-sync-inner {
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.month-view) .fc-col-header-cell,
body.month-view-active :deep(.fc-col-header-cell) {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 !important;
  vertical-align: middle !important;
}

.deliverables-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.deliverable-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 8px;
  flex: 1 0 calc(50% - 16px);
  min-width: 180px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.deliverable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.deliverable-variant-0 {
  border-left-color: #4c78b0;
}

.deliverable-variant-1 {
  border-left-color: #41a58e;
}

.deliverable-variant-2 {
  border-left-color: #c5678d;
}

.deliverable-variant-3 {
  border-left-color: #d8c478;
}

.deliverable-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
}

.deliverable-text {
  line-height: 1.4;
}

.tasks-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  border-left: 3px solid rgba(130, 87, 255, 0.6);
  margin-bottom: 2px;
  width: 100%;
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.task-bullet {
  margin-right: 8px;
  font-size: 1.2rem;
  color: rgba(130, 87, 255, 0.6);
  line-height: 1;
  flex-shrink: 0;
}

.task-text {
  line-height: 1.5;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.role-item {
  position: relative;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.role-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.role-name {
  position: relative;
  z-index: 1;
}

.role-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background-color: currentColor;
  opacity: 0.2;
  transform-origin: right center;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}
</style> 
