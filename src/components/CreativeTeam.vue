<template>
  <div class="org-chart-container">
    <section id="creative-team" class="team-section">
      <div class="title-container">
        <h2 class="section-title">Creative Team</h2>
      </div>
      
      <div class="team-grid" :class="{'org-chart-active': isOrgChartActive}">
        <!-- SVG container for lines - placed inside the team grid but before team members -->
        <div class="svg-container" v-if="isOrgChartActive">
          <svg 
            ref="svgRef" 
            class="org-chart-lines"
            width="100%" height="100%"
            preserveAspectRatio="xMidYMid meet">
            <!-- Lines and dots will be generated dynamically -->
          </svg>
        </div>
        
        <div 
          v-for="member in isOrgChartActive ? [...teamMembers, ...orgChartOnlyMembers] : teamMembers" 
          :key="member.id" 
          class="team-member" 
          :class="[getOrgChartClass(member.name), {'org-chart-mode': isOrgChartActive}]"
          @click="openPortfolioDirectly(member)"
          :ref="el => { if (el) teamRefs[member.name] = el }"
        >
          <div class="member-image">
            <div v-if="typeof member.avatar === 'string' && member.avatar.includes('<svg')" v-html="member.avatar" class="svg-placeholder"></div>
            <img v-else :src="member.avatar" alt="Portrait" class="member-avatar" :class="{ 'no-outline': member.noOutline }">
          </div>
          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-role">{{ member.role }}</div>
          </div>
        </div>
      </div>
      
      <div class="button-container">
        <div class="button-instruction" v-if="!isOrgChartActive">Click to view organizational chart</div>
        <button class="org-chart-toggle" @click="toggleOrgChart" :title="isOrgChartActive ? 'Return to grid view' : 'View org chart'">
          <img src="@/assets/workflow.png" alt="Org Chart Toggle" class="toggle-icon" />
        </button>
        <div class="button-instruction" v-if="isOrgChartActive">Click to return to grid view</div>
      </div>
    </section>

    <section id="production-partners" class="partners-section">
      <div class="title-container">
        <h2 class="section-title">Trusted Partners</h2>
      </div>
      <div class="partners-grid">
        <div v-for="partner in productionPartners" :key="partner.id" class="partner-card" @click="openPortfolioDirectly(partner)">
          <div class="member-image">
            <div class="logo-container">
              <video v-if="partner.videoLogo" autoplay loop muted playsinline class="video-logo">
                <source :src="partner.videoLogo" type="video/mp4">
              </video>
              <img v-else :src="partner.avatar" :alt="partner.name + ' Logo'" class="member-avatar" :class="{ 'svg-logo': isSvgComponent(partner.avatar) }">
            </div>
          </div>
          <div class="partner-info">
            <div class="partner-name">{{ partner.name }}</div>
            <div class="partner-specialty">{{ partner.specialty }}</div>
            <div class="partner-location">{{ partner.location }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Website Modal -->
    <div class="website-modal-backdrop" v-if="showWebsiteModal" @click="closeWebsiteModal">
      <div class="website-modal-content" @click.stop>
        <button class="close-modal" @click="closeWebsiteModal">×</button>
        <iframe 
          v-if="currentMember?.iframeConfig"
          :src="websiteUrl"
          :width="currentMember.iframeConfig.width"
          :height="currentMember.iframeConfig.height"
          :style="currentMember.iframeConfig.style"
        ></iframe>
        <iframe v-else :src="websiteUrl" frameborder="0"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import projectData from '../data/data.json'

// Import regular images
import PLATANO from '../assets/avatars/PLATANO.png'
import LUCKYBASTARDS from '../assets/avatars/LUCKYBASTARDS.png'
import VOLKEN from '../assets/avatars/VOLKEN.png'
import BIGPICTURE from '../assets/avatars/BIGPICTURE.png'
import SOLOVFX from '../assets/avatars/SOLOVFX.png'
import SOUVENIR from '../assets/avatars/64AFILMS.png'
import AURA from '../assets/avatars/AURA.png'
import JUNG from '../assets/avatars/JUNG.webp'

// Import SVG files as URLs
import HousePostLogo from '../assets/avatars/HOUSEPOST.SVG'
import CabinEditLogo from '../assets/avatars/CABINEDIT.SVG'
import EthosLogo from '../assets/avatars/ETHOS.SVG'

// Import team member avatars
import ISRAELRIQUEROS from '../assets/portraits/ISRAELRIQUEROS.png'
import WESLEY from '../assets/portraits/WESLEY.png'
import ANGELO from '../assets/portraits/ANGELO.png'
import MUHOZI from '../assets/portraits/MUHOZI.png'
import MUHOZI_PDF from '../assets/decks/MUHOZI.pdf'
import YUSSEF from '../assets/portraits/YUSSEF.jpg'
import CLAYTON from '../assets/portraits/CLAYTON.jpg'
import BLAKE from '../assets/portraits/BLAKE.png'
import SHO from '../assets/portraits/SHO.png'
import JUAN from '../assets/portraits/JUAN.png'
import DJUNG from '../assets/portraits/DJUNG.png'
import LENA from '../assets/portraits/LENA.png'
import JOSE from '../assets/portraits/JOSE.jpeg'
import ZUHENG from '../assets/portraits/ZUHENG.jpeg'
import ALEXANDRA from '../assets/portraits/ALEXANDRA.jpeg'
import JOHN from '../assets/portraits/JOHN.jpeg'
import OPHELIA_LOGO from '../assets/Logo.png'

// Import the workflow icon and hybe profile
import WORKFLOW from '../assets/workflow.png'
import HYBE from '../assets/portraits/hybe.jpeg'

// Define reactive variables
const showWebsiteModal = ref(false)
const websiteUrl = ref('')
const isOrgChartActive = ref(false)
const currentMember = ref(null)

// Add refs for team members to track positions
const teamRefs = ref({})
const svgRef = ref(null)

// Watch for changes to activate/deactivate
watch(isOrgChartActive, (newVal) => {
  if (newVal) {
    // First, do an immediate update of the SVG viewBox
    nextTick(() => {
      console.log("Org chart activated, preparing view...");
      updateSvgViewBox();
      
      // Wait for the transitions to complete before drawing connections
      // This is important as team members are moving to their org chart positions
      setTimeout(() => {
        console.log("Starting to draw connections after transitions...");
        updateConnectionPositions();
        
        // Additional safety update after everything has settled
        setTimeout(() => {
          updateConnectionPositions();
        }, 1000);
      }, 1000);
    });
  } else {
    // Clear lines immediately when deactivated
    const svgElement = svgRef.value;
    if (svgElement) {
      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
      }
    }
  }
});

// Define a placeholder for team portraits
const PLACEHOLDER_PORTRAIT = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="60" fill="#333"/>
  <circle cx="60" cy="50" r="22" fill="#555"/>
  <path d="M30 95 C30 75, 90 75, 90 95" stroke="#555" stroke-width="12" fill="none"/>
  <text x="60" y="110" font-family="Arial" font-size="10" fill="#aaa" text-anchor="middle">Photo Coming Soon</text>
</svg>`

// Create a mapping of avatar imports to use for team members
const avatarMap = {
  'Israel Riqueros': ISRAELRIQUEROS,
  'DJ Jung': DJUNG,
  'Ophelia Roster': SHO,
  'Jose Felipe Varón': JOSE,
  'Angelo Rosales': ANGELO,
  'Muhozi Nintunze': MUHOZI,
  'Yussef Haridy': YUSSEF,
  'Clayton McCracken': CLAYTON,
  'Blake Bohls': BLAKE,
  'Wesley So': WESLEY,
  'Lena Huang': LENA,
  'John Burton': JOHN,
  'Juan Felipe Díaz Herrera': JUAN,
  'Alexandra Kern': ALEXANDRA,
  'Sho Schrock Manabe': SHO,
  'Zuheng Yin': ZUHENG
}

// Import team data from data.json and format it for the component
const formatTeamData = () => {
  // Create a flat array of all team members from the creativeTeam in data.json
  const teamData = [
    ...projectData.creativeTeam.leadership,
    ...projectData.creativeTeam.designers,
    ...projectData.creativeTeam.production,
    ...projectData.creativeTeam.creatives
  ]

  // Format the team data and add the missing properties
  return teamData.map((member, index) => ({
    id: index + 1,
    name: member.name,
    role: member.role,
    day_rate: member.day_rate,
    avatar: avatarMap[member.name] || PLACEHOLDER_PORTRAIT,
    portfolioUrl: getPortfolioUrl(member.name),
    noOutline: getNoOutline(member.name),
    iframeConfig: member.name === 'DJ Jung' ? {
      width: '640px',
      height: '480px',
      style: 'border: 0'
    } : undefined
  }))
}

// Helper functions for team member properties
const getPortfolioUrl = (name) => {
  const portfolioUrls = {
    'Israel Riqueros': 'https://www.israelriqueros.com/',
    'DJ Jung': 'studiojung.co?link_target=parent',
    'Juan Felipe Díaz Herrera': 'https://www.ophelia.company',
    'Wesley So': 'https://sosostudio.net/',
    'Muhozi Nintunze': MUHOZI_PDF,
    'Yussef Haridy': 'https://www.yussefharidy.com/motion',
    'Clayton McCracken': 'https://c180n.tv/',
    'Blake Bohls': 'https://www.ophelia.company',
    'Ophelia Roster': 'https://www.ophelia.company',
    'Angelo Rosales': 'https://www.ophelia.company',
    'Lena Huang': 'https://www.lenahuang.com/',
    'John Burton': 'https://www.johnburton.me/',
    'Sho Schrock Manabe': 'https://www.ophelia.company'
  }
  return portfolioUrls[name] || '#'
}

const getNoOutline = (name) => {
  const noOutlineMembers = [
    'Israel Riqueros',
    'Juan Felipe Díaz Herrera',
    'Blake Bohls',
    'Angelo Rosales',
    'Lena Huang',
    'John Burton',
    'Jose Felipe Varón',
    'Sho Schrock Manabe',
    'Ophelia Roster'
  ]
  return noOutlineMembers.includes(name)
}

// Team members data from data.json
const teamMembers = formatTeamData()

// Team members that only appear in org chart view
const orgChartOnlyMembers = [
  {
    id: 14,
    name: 'Santiago Duque',
    role: 'Hybe Corp',
    day_rate: 950,
    avatar: HYBE,
    portfolioUrl: '#',
    noOutline: true,
    orgChartOnly: true
  },
  {
    id: 15,
    name: 'Juan Arenas',
    role: 'Hybe Corp',
    day_rate: 900,
    avatar: HYBE, 
    portfolioUrl: '#',
    noOutline: true,
    orgChartOnly: true
  }
]

// Production partners data
const productionPartners = [
  {
    id: 1,
    name: 'Platano',
    specialty: 'Production Company',
    location: 'US',
    avatar: PLATANO,
    portfolio: 'https://www.platanoprod.com'
  },
  {
    id: 12,
    name: 'Aura Studios',
    specialty: '3D and Experiential Company',
    location: 'Global',
    avatar: AURA,
    portfolio: 'https://www.aurastudios.org/'
  },
  {
    id: 13,
    name: 'Jung Studios',
    specialty: 'Design Studio',
    location: 'Global',
    avatar: JUNG,
    portfolio: 'https://davidjung.studio/'
  },
  {
    id: 7,
    name: 'Cabin Edit',
    specialty: 'Post Production',
    location: 'Global',
    avatar: CabinEditLogo,
    portfolio: 'https://cabinedit.com/'
  },
  {
    id: 2,
    name: 'Lucky Bastards Inc',
    specialty: 'Production Company',
    location: 'US',
    avatar: LUCKYBASTARDS,
    portfolio: 'https://luckybastardsinc.com'
  },
  {
    id: 3,
    name: 'Volken',
    specialty: 'Live Production',
    location: 'Brazil',
    avatar: VOLKEN,
    portfolio: 'https://volken.film/'
  },
  {
    id: 4,
    name: 'Big Picture Lab',
    specialty: 'Live Production',
    location: 'South Korea',
    avatar: BIGPICTURE,
    portfolio: 'https://www.bigpicture-live.com'
  },
  {
    id: 5,
    name: 'Parallel People',
    specialty: 'Sound Studio',
    location: 'Global',
    videoLogo: 'https://www.parallel-people.com//public/assets/gif/pp_logo_video.mp4',
    portfolio: 'https://www.parallel-people.com/home'
  },
  {
    id: 6,
    name: 'House Post',
    specialty: 'Editorial',
    location: 'Global',
    avatar: HousePostLogo,
    portfolio: 'https://house-post.com'
  },
  {
    id: 9,
    name: 'SoloVFX',
    specialty: 'Animation Studio',
    location: 'Global',
    avatar: SOLOVFX,
    portfolio: 'https://solovfx.com/'
  },
  {
    id: 10,
    name: 'Ethos Studio',
    specialty: 'Finishing Studio',
    location: 'US',
    avatar: EthosLogo,
    portfolio: 'https://ethos.studio/'
  },
  {
    id: 11,
    name: '64A Films',
    specialty: 'Production Company',
    location: 'Colombia',
    avatar: SOUVENIR,
    portfolio: 'https://www.64afilms.com/servicios-de-produccion'
  }
]

// Functions
const openPortfolioDirectly = (item) => {
  // Don't open portfolios when in org chart mode
  if (isOrgChartActive.value) {
    return;
  }
  
  // Set the current member
  currentMember.value = item;
  
  // Determine the portfolio URL based on whether it's a team member or partner
  const portfolioUrl = item.portfolioUrl || item.portfolio;
  
  if (portfolioUrl) {
    websiteUrl.value = portfolioUrl;
    showWebsiteModal.value = true;
  }
}

const closeWebsiteModal = () => {
  showWebsiteModal.value = false;
  currentMember.value = null;
}

const isSvgComponent = (avatar) => {
  return avatar === HousePostLogo ||
         avatar === CabinEditLogo ||
         avatar === EthosLogo ||
         (typeof avatar === 'string' && avatar.endsWith('.SVG'))
}

const toggleOrgChart = () => {
  isOrgChartActive.value = !isOrgChartActive.value
  
  // No need to call update functions here, the watcher handles it.
}

const getOrgChartClass = (name) => {
  if (!isOrgChartActive.value) return ''
  
  switch(name) {
    // Extreme Far Left column (new)
    case 'Santiago Duque': return 'position-extreme-left-top'
    case 'Juan Arenas': return 'position-extreme-left-bottom'
    
    // Far Left column
    case 'Israel Riqueros': return 'position-far-left-middle'
    case 'Juan Felipe Díaz Herrera': return 'position-far-left-bottom'
    
    // Middle-left column
    case 'Alexandra Kern': return 'position-left-middle-top-extra'
    case 'Sho Schrock Manabe': return 'position-left-middle-top'
    case 'Zuheng Yin': return 'position-left-middle-bottom'
    
    // Middle column
    case 'John Burton': return 'position-middle-top-extra'
    case 'Ophelia Roster': return 'position-middle-top'
    case 'DJ Jung': return 'position-middle-center'
    case 'Clayton McCracken': return 'position-middle-bottom'
    
    // Middle-right column
    case 'Jose Felipe Varón': return 'position-right-top-extra'
    case 'Yussef Haridy': return 'position-right-top'
    case 'Angelo Rosales': return 'position-right-middle'
    case 'Wesley So': return 'position-right-bottom'
    
    // Far Right column
    case 'Muhozi Nintunze': return 'position-far-right-top'
    case 'Lena Huang': return 'position-far-right-middle'
    case 'Blake Bohls': return 'position-far-right-bottom'
    
    default: return 'position-default'
  }
}

const updateConnectionPositions = () => {
  console.log('updateConnectionPositions called'); // Log function call
  
  if (!isOrgChartActive.value || !svgRef.value) {
    console.warn('updateConnectionPositions: Aborting - chart not active or svgRef is null');
    return
  }
  
  // Remove existing lines and dots
  const svgElement = svgRef.value;
  while (svgElement.firstChild) {
    svgElement.removeChild(svgElement.firstChild);
  }
  
  // References to track member positions
  const positions = {};
  console.log('Calculating positions...');
  
  // Calculate the positions for each team member based on their DOM position
  for (const memberName in teamRefs.value) {
    const memberElement = teamRefs.value[memberName];
    if (!memberElement) {
      console.warn(`No element found for ${memberName}`);
      continue;
    }
    
    // Get element position relative to SVG container
    const rect = memberElement.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();
    
    // Calculate center point of the avatar, adjust for SVG coordinate system
    const avatarElement = memberElement.querySelector('.member-avatar') || memberElement.querySelector('.svg-placeholder');
    if (!avatarElement) {
        console.warn(`No avatar element found for ${memberName}`);
        continue;
    }
    
    const avatarRect = avatarElement.getBoundingClientRect();
    const avatarCenterX = avatarRect.left + avatarRect.width / 2 - svgRect.left;
    const avatarCenterY = avatarRect.top + avatarRect.height / 2 - svgRect.top;
    
    positions[memberName] = { x: avatarCenterX, y: avatarCenterY };
    // Log individual positions
    console.log(`Position for ${memberName}:`, positions[memberName]); 
  }
  
  console.log('Calculated positions object:', JSON.stringify(positions));
  
  // Check if we have all the required positions
  const requiredMembers = [
    'Santiago Duque', 'Juan Arenas', 'Israel Riqueros', 'Juan Felipe Díaz Herrera',
    'Sho Schrock Manabe', 'Ophelia Roster', 'DJ Jung', 
    'Clayton McCracken', 'Yussef Haridy', 'Angelo Rosales', 'Wesley So',
    'Blake Bohls', 'Muhozi Nintunze', 'Lena Huang'
  ];
  
  const missingMembers = requiredMembers.filter(member => !positions[member]);
  if (missingMembers.length > 0) {
    console.warn(`Missing positions for: ${missingMembers.join(', ')}`);
    // Continue anyway - we'll use the positions we have
  }
  
  // Merge node 1: between Santiago/Juan A. and Jeff/Juan D.
  // Use fallback positions if original positions are missing
  const mergeNode1X = positions['Santiago Duque'] && positions['Israel Riqueros'] ? 
    (positions['Santiago Duque'].x + positions['Israel Riqueros'].x) / 2 : 200;
  const mergeNode1Y = positions['Santiago Duque'] && positions['Juan Arenas'] ? 
    (positions['Santiago Duque'].y + positions['Juan Arenas'].y) / 2 : 225;
  
  // Merge node 2: between Israel/Juan and Alexandra/Sho
  const mergeNode2X = positions['Israel Riqueros'] && positions['Sho Schrock Manabe'] ? 
    (positions['Israel Riqueros'].x + positions['Sho Schrock Manabe'].x) / 2 : 300;
  const mergeNode2Y = positions['Israel Riqueros'] && positions['Juan Felipe Díaz Herrera'] ? 
    (positions['Israel Riqueros'].y + positions['Juan Felipe Díaz Herrera'].y) / 2 : 225;
  
  // Merge node 4: between Zuheng and DJ and Clayton
  const mergeNode4X = positions['Zuheng Yin'] && positions['DJ Jung'] ? 
    (positions['Zuheng Yin'].x + positions['DJ Jung'].x) / 2 : 400;
  const mergeNode4Y = positions['DJ Jung'] && positions['Clayton McCracken'] ? 
    (positions['DJ Jung'].y + positions['Clayton McCracken'].y) / 2 : 200;
  
  // Store merge node positions
  const mergeNodes = {
    'mergeNode1': { x: mergeNode1X, y: mergeNode1Y },
    'mergeNode2': { x: mergeNode2X, y: mergeNode2Y },
    'mergeNode4': { x: mergeNode4X, y: mergeNode4Y }
  };
  
  console.log('Calculated merge nodes:', JSON.stringify(mergeNodes));
  
  // Define connections between team members and merge nodes
  const connections = [
    // Connections to merge node 1
    ['Santiago Duque', 'mergeNode1'],
    ['Juan Arenas', 'mergeNode1'],
    
    // Connections from merge node 1 to Israel/Juan
    ['mergeNode1', 'Israel Riqueros'],
    ['mergeNode1', 'Juan Felipe Díaz Herrera'],
    
    // Connections to merge node 2
    ['Israel Riqueros', 'mergeNode2'],
    ['Juan Felipe Díaz Herrera', 'mergeNode2'],
    
    // Connections from merge node 2 to Alexandra/Sho/Zuheng
    ['mergeNode2', 'Alexandra Kern'],
    ['mergeNode2', 'Sho Schrock Manabe'],
    ['mergeNode2', 'Zuheng Yin'],
    
    // Connection between Alexandra and John
    ['Alexandra Kern', 'John Burton'],
    
    // Direct connections from Sho to Ophelia Roster
    ['Sho Schrock Manabe', 'Ophelia Roster'],
    
    // Direct connections from Ophelia Roster to Jose and Yussef
    ['Ophelia Roster', 'Jose Felipe Varón'],
    ['Ophelia Roster', 'Yussef Haridy'],
    
    // Connection from Zuheng to merge node 4
    ['Zuheng Yin', 'mergeNode4'],
    
    // Connections from merge node 4 to DJ and Clayton
    ['mergeNode4', 'DJ Jung'],
    ['mergeNode4', 'Clayton McCracken'],
    
    // Other connections
    ['DJ Jung', 'Angelo Rosales'],
    ['DJ Jung', 'Wesley So'],
    ['Angelo Rosales', 'Muhozi Nintunze'],
    ['Angelo Rosales', 'Lena Huang'],
    ['Wesley So', 'Blake Bohls']
  ];
  
  // Draw connection lines
  connections.forEach((connection, index) => {
    const [from, to] = connection;
    let fromPos, toPos;
    
    // Get position for 'from' point
    if (from.startsWith('mergeNode')) {
      fromPos = mergeNodes[from];
    } else {
      fromPos = positions[from];
    }
    
    // Get position for 'to' point
    if (to.startsWith('mergeNode')) {
      toPos = mergeNodes[to];
    } else {
      toPos = positions[to];
    }
    
    if (!fromPos || !toPos) {
      console.warn(`Skipping connection ${from} -> ${to}: Missing position(s)`);
      return;
    }
    
    // Create the connection line (now all connections are straight lines)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`);
    line.setAttribute('stroke', '#9d86ff');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('fill', 'none');
    line.setAttribute('class', 'connection-line');
    line.setAttribute('opacity', '0.5');
    line.setAttribute('filter', 'drop-shadow(0 0 5px rgba(157, 134, 255, 0.8)) drop-shadow(0 0 8px rgba(157, 134, 255, 0.6))');
    
    // Add line to SVG
    svgElement.appendChild(line);
    
    // Create dots at connection points
    if (!from.startsWith('mergeNode')) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', fromPos.x);
      dot.setAttribute('cy', fromPos.y);
      dot.setAttribute('r', '5');
      dot.setAttribute('fill', '#9d86ff');
      dot.setAttribute('class', 'connection-dot');
      dot.setAttribute('opacity', '0.7');
      dot.setAttribute('filter', 'drop-shadow(0 0 6px rgba(157, 134, 255, 0.9))');
      svgElement.appendChild(dot);
    }
    
    if (!to.startsWith('mergeNode')) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', toPos.x);
      dot.setAttribute('cy', toPos.y);
      dot.setAttribute('r', '5');
      dot.setAttribute('fill', '#9d86ff');
      dot.setAttribute('class', 'connection-dot');
      dot.setAttribute('opacity', '0.7');
      dot.setAttribute('filter', 'drop-shadow(0 0 6px rgba(157, 134, 255, 0.9))');
      svgElement.appendChild(dot);
    }
  });
  
  // Add merge nodes
  Object.entries(mergeNodes).forEach(([key, node]) => {
    const mergeNodeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    mergeNodeCircle.setAttribute('cx', node.x);
    mergeNodeCircle.setAttribute('cy', node.y);
    mergeNodeCircle.setAttribute('r', '7');
    mergeNodeCircle.setAttribute('fill', '#d6d6ce');
    mergeNodeCircle.setAttribute('stroke', '#9d86ff');
    mergeNodeCircle.setAttribute('stroke-width', '2');
    mergeNodeCircle.setAttribute('class', 'merge-node-dot');
    mergeNodeCircle.setAttribute('opacity', '0.7');
    mergeNodeCircle.setAttribute('filter', 'drop-shadow(0 0 7px rgba(214, 214, 206, 0.9))');
    svgElement.appendChild(mergeNodeCircle);
  });
}

// Update SVG viewBox to adapt to the container size
const updateSvgViewBox = () => {
  if (!svgRef.value) return;
  
  const svgElement = svgRef.value;
  const containerRect = svgElement.parentElement.getBoundingClientRect();
  
  // Set the viewBox to match the container dimensions
  svgElement.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);
  svgElement.setAttribute('width', '100%');
  svgElement.setAttribute('height', '100%');
  
  console.log(`SVG viewBox updated to: 0 0 ${containerRect.width} ${containerRect.height}`);
}

// Debounce function to limit how often an event fires
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const onResize = debounce(() => {
  if (isOrgChartActive.value) {
    console.log('Window resized, updating connections...');
    nextTick(() => {
      updateSvgViewBox();
      updateConnectionPositions();
    });
  }
}, 200); // 200ms debounce

// Event handlers for transitions
const onTeamMemberTransitionEnd = (e) => {
  if (e.propertyName === 'transform' && isOrgChartActive.value) {
    console.log('Transform transition ended, updating connections...');
    updateConnectionPositions();
  }
}

// Setup event listeners
onMounted(() => {
  window.addEventListener('resize', onResize);
  
  // Add transition end event listeners to all team members
  const teamMembers = document.querySelectorAll('.team-member');
  teamMembers.forEach(member => {
    member.addEventListener('transitionend', onTeamMemberTransitionEnd);
  });
  
  // Initial check and update
  nextTick(() => {
    if (isOrgChartActive.value) {
      updateSvgViewBox();
      updateConnectionPositions();
    }
  });
})

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  
  // Remove transition end event listeners
  const teamMembers = document.querySelectorAll('.team-member');
  teamMembers.forEach(member => {
    member.removeEventListener('transitionend', onTeamMemberTransitionEnd);
  });
})
</script>

<style scoped>
.org-chart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px;
  color: #fff;
}

.title-container {
  text-align: center;
  margin-bottom: 25px;
}

.section-title {
  font-size: 24px;
  color: #fff;
  font-weight: 600;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 60px;
  height: 3px;
  margin: 0 auto;
  background: #d6d6ce;
  border-radius: 2px;
}

.team-section {
  margin-top: 40px;
  margin-bottom: 60px;
}

.partners-section {
  margin-top: 20px;
  position: relative;
  padding-top: 20px;
}

.partners-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(28, 28, 28, 0), 
    rgba(180, 180, 170, 0.2), 
    rgba(28, 28, 28, 0));
}

.team-content-layout {
  display: none;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  position: relative;
  z-index: 100;
}

.button-instruction {
  color: #ccccc2;
  font-size: 14px;
  margin: 10px 0;
  text-align: center;
  font-weight: 500;
  position: relative;
  z-index: 100;
  pointer-events: none;
}

.org-chart-toggle {
  background: white;
  border: none;
  border-radius: 50%;
  color: #000;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.4);
  animation: pulse 2s infinite;
  position: relative;
  z-index: 100;
  pointer-events: auto;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 25px rgba(255, 255, 255, 0.5);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 255, 255, 0.3);
  }
}

.toggle-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.org-chart-toggle:hover {
  background: #f5f5f5;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.5);
}

.team-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  transition: all 0.5s ease-out;
}

.team-grid.org-chart-active {
  height: 550px;
  min-height: 550px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  overflow: visible;
  margin: 100px 0 0px 50px;
  background-color: rgba(20, 20, 20, 0.5);
  border-radius: 8px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.3);
  transition: all 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 250px 0 0 0;
  pointer-events: none; /* Make the entire org chart unclickable */
}

.team-member {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.team-member.org-chart-mode {
  position: absolute;
  background: transparent;
  box-shadow: none;
  border: none;
  width: 90px;
  transition: all 1.2s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 10;
  pointer-events: none; /* Make team members unclickable in org chart mode */
  animation: pop-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pop-in {
  0% { transform: scale(0.7); opacity: 0; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.team-member, .partner-card {
  background-color: rgba(28, 28, 28, 0.7);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(180, 180, 170, 0.15);
  position: relative;
  max-width: 100%;
}

.team-member:hover, .partner-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(214, 214, 206, 0.3);
}

.member-image {
  position: relative;
  height: 150px;
  overflow: hidden;
  background-color: #1c1c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Remove padding from partner cards' member-image */
.partner-card .member-image {
  padding: 0;
}

.logo-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  box-sizing: border-box;
}

.member-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), filter 0.4s ease;
  padding: 0;
}

/* Team members - circular avatar style */
.team-member .member-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid rgba(214, 214, 206, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  object-position: center top;
}

/* No outline style for specific members */
.team-member .member-avatar.no-outline {
  border: none;
}

/* Remove ivory outline for specific team members */
.team-member:has([alt*="Israel Riqueros"]) .member-avatar,
.team-member:has([alt*="Sho Schrock Manabe"]) .member-avatar,
.team-member:has([alt*="Angelos Rosales"]) .member-avatar,
.team-member:has([alt*="Black Bohls"]) .member-avatar,
.team-member:has([alt*="Juan Felipe Díaz Herrera"]) .member-avatar {
  border: none;
}

.team-member:hover .member-avatar {
  transform: scale(1.08);
  border-color: rgba(214, 214, 206, 0.6);
}

/* Ensure no border appears on hover for no-outline avatars */
.team-member:hover .member-avatar.no-outline {
  border: none;
}

/* SVG specific styles */
.svg-logo {
  width: 65%;
  height: 65%;
  max-height: none;
  object-fit: contain;
  filter: brightness(1.1);
}

/* Partner logo specific styles */
.partner-card .member-avatar {
  object-fit: contain;
  max-width: 75%;
  max-height: 75%;
}

/* Specific logo adjustments */
.partner-card .member-avatar[alt="SoloVFX Logo"] {
  max-width: 60%;
  max-height: 60%;
}

.partner-card .member-avatar[alt="Big Picture Lab Logo"] {
  max-width: 70%;
  max-height: 70%;
}

.member-info, .partner-info {
  max-height: 100px;
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
  background: linear-gradient(180deg, 
    rgba(28, 28, 28, 0.9) 0%, 
    rgba(28, 28, 28, 1) 100%);
}

.member-name, .partner-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 3px;
  color: #fff;
}

.member-role, .partner-specialty, .partner-location {
  font-size: 12px;
  color: #ccccc2;
  margin-bottom: 2px;
}

.partner-specialty {
  color: #e6e6dc;
  font-weight: 500;
}

/* Modal styles */
.website-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Higher than the org chart */
  backdrop-filter: blur(5px);
  animation: fadeIn 0.2s ease;
  pointer-events: auto; /* Ensure modal is interactive */
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.website-modal-content {
  width: 80%;
  height: 80vh;
  max-width: 1000px;
  background: #1c1c1c;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(214, 214, 206, 0.2);
  pointer-events: auto; /* Ensure modal content is interactive */
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(28, 28, 28, 0.7);
  border: none;
  font-size: 22px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.close-modal:hover {
  color: #fff;
  background: #d6d6ce;
  transform: rotate(90deg);
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 1200px) {
  .team-grid,
  .partners-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  /* Adjust org chart positions for medium screens */
  .position-extreme-left-top {
    transform: translate(-500px, -120px) !important;
  }
  
  .position-extreme-left-bottom {
    transform: translate(-500px, 120px) !important;
  }
  
  .position-far-left-top {
    transform: translate(-330px, -120px) !important;
  }
  
  .position-far-left-bottom {
    transform: translate(-330px, 120px) !important;
  }
  
  .position-left-middle-top {
    transform: translate(-160px, -120px) !important;
  }
  
  .position-left-middle-bottom {
    transform: translate(-160px, 120px) !important;
  }
  
  .position-right-top {
    transform: translate(160px, -120px) !important;
  }
  
  .position-right-middle {
    transform: translate(160px, 0px) !important;
  }
  
  .position-right-bottom {
    transform: translate(160px, 120px) !important;
  }
  
  .position-far-right-top {
    transform: translate(330px, -120px) !important;
  }
  
  .position-far-right-bottom {
    transform: translate(330px, 120px) !important;
  }
}

@media (max-width: 991px) {
  .team-grid,
  .partners-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  
  /* Adjust org chart positions for smaller screens */
  .position-extreme-left-top {
    transform: translate(-400px, -100px) !important;
  }
  
  .position-extreme-left-bottom {
    transform: translate(-400px, 100px) !important;
  }
  
  .position-far-left-top {
    transform: translate(-240px, -100px) !important;
  }
  
  .position-far-left-bottom {
    transform: translate(-240px, 100px) !important;
  }
  
  .position-left-middle-top {
    transform: translate(-120px, -100px) !important;
  }
  
  .position-left-middle-bottom {
    transform: translate(-120px, 100px) !important;
  }
  
  .position-middle-top {
    transform: translate(0px, -140px) !important;
  }
  
  .position-middle-bottom {
    transform: translate(0px, 140px) !important;
  }
  
  .position-right-top {
    transform: translate(120px, -100px) !important;
  }
  
  .position-right-middle {
    transform: translate(120px, 0px) !important;
  }
  
  .position-right-bottom {
    transform: translate(120px, 100px) !important;
  }
  
  .position-far-right-top {
    transform: translate(240px, -100px) !important;
  }
  
  .position-far-right-bottom {
    transform: translate(240px, 100px) !important;
  }
  
  .team-grid.org-chart-active {
    height: 500px;
    min-height: 500px;
    padding: 40px 20px;
  }
  
  .team-member.org-chart-mode {
    width: 80px;
  }
  
  .team-member.org-chart-mode .member-image {
    height: 75px;
  }
  
  .team-member.org-chart-mode .member-avatar {
    width: 65px;
    height: 65px;
  }
  
  .member-image {
    height: 140px;
  }
  
  .team-member .member-avatar,
  .team-member .svg-placeholder {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 767px) {
  .team-grid,
  .partners-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  
  .member-image {
    height: 130px;
  }
  
  .team-member .member-avatar,
  .team-member .svg-placeholder {
    width: 90px;
    height: 90px;
  }
  
  .member-name, .partner-name {
    font-size: 15px;
  }
  
  .member-role, .partner-specialty, .partner-location {
    font-size: 11px;
  }
  
  .button-container {
    margin-top: 20px;
  }
  
  .team-section {
    margin-top: 30px;
    margin-bottom: 40px;
  }
}

@media (max-width: 580px) {
  .team-grid,
  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .team-member .member-avatar,
  .team-member .svg-placeholder {
    width: 80px;
    height: 80px;
    border-width: 2px;
  }
}

/* Add SVG placeholder styles */
.svg-placeholder, .svg-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-placeholder-large {
  width: 130px;
  height: 130px;
  border-radius: 65px;
  overflow: hidden;
}

/* Placeholder SVG for team members - make circular */
.team-member .svg-placeholder {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(214, 214, 206, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.team-member:hover .member-avatar,
.partner-card:hover .member-avatar {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Specific hover effect for circular avatars */
.team-member:hover .member-avatar {
  transform: scale(1.08);
  border-color: rgba(214, 214, 206, 0.6);
}

/* Ensure no border appears on hover for no-outline avatars */
.team-member:hover .member-avatar.no-outline {
  border: none;
}

/* Video logo styles */
.video-logo {
  width: 75%;
  height: 75%;
  object-fit: contain;
  background-color: transparent;
}

/* Org chart transitions */
.team-grid {
  position: relative;
  transition: height 0.8s ease;
}

.team-grid.org-chart-active {
  height: 550px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  overflow: visible;
}

.team-member {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.team-member.org-chart-mode {
  position: absolute;
  background: transparent;
  box-shadow: none;
  border: none;
  width: 90px;
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.team-member.org-chart-mode .member-image {
  height: 85px;
  padding: 5px;
}

.team-member.org-chart-mode .member-avatar {
  width: 75px;
  height: 75px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
}

.team-member.org-chart-mode .member-info {
  background: transparent;
  border-top: none;
  padding: 4px;
}

.team-member.org-chart-mode .member-name {
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  font-size: 10px;
}

.team-member.org-chart-mode .member-role {
  color: #9d86ff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  font-size: 8px;
}

/* Add connection lines in org chart mode */
.team-grid.org-chart-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at center, rgba(157, 134, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 0;
  opacity: 0.5;
}

/* Position adjustments for column-based alignment - SPREAD OUT TO FILL SPACE */

/* Column 0 (extreme far left): Santiago, Juan A. */
.position-extreme-left-top {
  transform: translate(-550px, -120px) !important; /* Santiago */
}

.position-extreme-left-bottom {
  transform: translate(-550px, 120px) !important; /* Juan A */
  z-index: 10;
}

/* Column 1 (far left): Israel, Juan */
.position-far-left-top {
  transform: translate(-350px, -170px) !important; /* Israel - moved up by 50px */
}

.position-far-left-middle {
  transform: translate(-350px, -80px) !important; /* Israel - middle position */
}

.position-far-left-bottom {
  transform: translate(-350px, 80px) !important; /* Juan - bottom position */
}

/* Column 2 (middle-left): Alexandra, Sho, Zuheng */
.position-left-middle-top-extra {
  transform: translate(-170px, -130px) !important; /* Alexandra */
}

.position-left-middle-top {
  transform: translate(-170px, 0px) !important; /* Sho */
}

.position-left-middle-bottom {
  transform: translate(-170px, 150px) !important; /* Zuheng */
}

/* Column 3 (middle): John, Ophelia Roster, DJ Jung, Clayton */
.position-middle-top-extra {
  transform: translate(50px, -190px) !important; /* John */
}

.position-middle-top {
  transform: translate(50px, -50px) !important; /* Ophelia Roster */
}

.position-middle-center {
  transform: translate(50px, 100px) !important; /* DJ Jung */
}

.position-middle-bottom {
  transform: translate(50px, 250px) !important; /* Clayton */
}

/* Column 4 (middle-right): Jose, Yussef, Angelo, Wesley */
.position-right-top-extra {
  transform: translate(230px, -140px) !important; /* Jose - new position above Yussef */
}

.position-right-top {
  transform: translate(230px, 10px) !important; /* Yussef */
}

.position-right-middle {
  transform: translate(230px, 140px) !important; /* Angelo */
}

.position-right-bottom {
  transform: translate(230px, 270px) !important; /* Wesley */
}

/* Column 5 (far right): Muhozi, Lena, Blake */
.position-far-right-top {
  transform: translate(400px, 25px) !important; /* Muhozi - moved up */
}

.position-far-right-middle {
  transform: translate(400px, 170px) !important; /* Lena - new middle position */
}

.position-far-right-bottom {
  transform: translate(400px, 320px) !important; /* Blake */
}

/* Remove old position classes */
.position-top-center,
.position-dj-jung,
.position-bottom-center,
.position-middle1-center-right,
.position-sho,
.position-top-right,
.position-juan,
.position-left-top,
.position-angelo,
.position-middle2-left {
  /* These classes are replaced by the new positioning classes */
}

/* SVG Container */
.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none; /* Ensure clicks pass through to elements behind */
  transform: translateX(50px); /* Shift the entire SVG container to the right */
}

/* SVG Connection Lines */
.org-chart-lines {
  width: 100%;
  height: 100%;
  overflow: visible; /* Allow lines to extend beyond SVG boundaries */
  pointer-events: none; /* Ensure SVG elements are not clickable */
}

.connection-line {
  stroke: #9d86ff;
  stroke-width: 3;
  stroke-linecap: round;
  fill: none;
  opacity: 0.5;
  filter: drop-shadow(0 0 5px rgba(157, 134, 255, 0.8)) drop-shadow(0 0 8px rgba(157, 134, 255, 0.6));
  pointer-events: none; /* Ensure lines are not clickable */
}

.connection-dot {
  fill: #9d86ff;
  opacity: 0.7;
  filter: drop-shadow(0 0 6px rgba(157, 134, 255, 0.9));
  r: 5;
  pointer-events: none; /* Ensure dots are not clickable */
}

.merge-node-dot {
  fill: #d6d6ce;
  opacity: 0.7;
  filter: drop-shadow(0 0 7px rgba(214, 214, 206, 0.9));
  r: 7;
  stroke: #9d86ff;
  stroke-width: 2;
  pointer-events: none; /* Ensure merge nodes are not clickable */
}

/* Cascading dot animation delays */
.dot-1 {
  animation: fade-in 0.3s ease-in-out forwards 1.5s;
}

.dot-2 {
  animation: fade-in 0.3s ease-in-out forwards 1.8s;
}

.dot-3 {
  animation: fade-in 0.3s ease-in-out forwards 2.1s;
}

.dot-4 {
  animation: fade-in 0.3s ease-in-out forwards 2.4s;
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fade-in {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 0.8; transform: scale(1.4); }
  100% { opacity: 1; transform: scale(1); }
}

/* Org chart adjustments for line placement */
.team-grid.org-chart-active {
  height: 550px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  overflow: visible;
}

.position-default {
  opacity: 0;
  transform: translate(-1000px, 0) !important;
  pointer-events: none;
}

/* Add new animation for lines */
@keyframes fade-in-line {
  0% { 
    opacity: 0; 
    stroke-dasharray: 100; 
    stroke-dashoffset: 100; 
  }
  70% {
    opacity: 0.8;
    stroke-dasharray: 100; 
    stroke-dashoffset: 20;
  }
  100% { 
    opacity: 1; 
    stroke-dasharray: 100; 
    stroke-dashoffset: 0; 
  }
}

/* Add animation class for connection lines */
.connection-line {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  opacity: 0 !important;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

/* Add a stronger highlight when org chart is active */
.org-chart-active ~ .button-container .org-chart-toggle {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 30px rgba(255, 255, 255, 0.6);
  background: #f0f0e6;
}
</style> 