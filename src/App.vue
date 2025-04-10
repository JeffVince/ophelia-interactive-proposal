<script>
import { ref, onMounted } from 'vue'
import Overview from './components/Overview.vue'
import ScopeEditor from './components/ScopeEditor.vue'
import CreativeTeam from './components/CreativeTeam.vue'
import ProjectTimeline from './components/ProjectTimeline.vue'
import BudgetDashboard from './components/BudgetDashboard.vue'
import PasswordProtect from './components/PasswordProtect.vue'

export default {
  name: 'App',
  components: {
    Overview,
    ScopeEditor,
    CreativeTeam,
    ProjectTimeline,
    BudgetDashboard,
    PasswordProtect
  },
  setup() {
    const activeSection = ref('overview') // 'overview', 'scope', 'team', 'timeline', or 'budget'
    const isAuthenticated = ref(false)
    
    onMounted(() => {
      // Check if user is already authenticated
      const authStatus = localStorage.getItem('truvatos_authenticated')
      if (authStatus === 'true') {
        isAuthenticated.value = true
      }
    })
    
    const handleAuthentication = (status) => {
      isAuthenticated.value = status
    }
    
    const handleCostUpdate = (costData) => {
      // Handle cost updates if needed
    }
    
    return {
      activeSection,
      isAuthenticated,
      handleAuthentication,
      handleCostUpdate
    }
  }
}
</script>

<template>
  <div class="app">
    <PasswordProtect 
      v-if="!isAuthenticated" 
      @authenticated="handleAuthentication" 
    />
    
    <div v-else>
      <header>
        <div class="header-container">
          <div class="branding">
            <h1>Truvatos</h1>
            <p class="subtitle">Interactive Project Timeline & Scope</p>
          </div>
          
          <nav class="navigation">
            <button 
              :class="['nav-button', { active: activeSection === 'overview' }]"
              @click="activeSection = 'overview'"
            >
              Overview
            </button>
            <button 
              :class="['nav-button', { active: activeSection === 'scope' }]"
              @click="activeSection = 'scope'"
            >
              Scope of Work
            </button>
            <button 
              :class="['nav-button', { active: activeSection === 'team' }]"
              @click="activeSection = 'team'"
            >
              Creative Team
            </button>
            <button 
              :class="['nav-button', { active: activeSection === 'timeline' }]"
              @click="activeSection = 'timeline'"
            >
              Timeline
            </button>
            <button 
              :class="['nav-button', { active: activeSection === 'budget' }]"
              @click="activeSection = 'budget'"
            >
              Budget
            </button>
          </nav>
        </div>
      </header>
      
      <main>
        <div class="container">
          <section v-if="activeSection === 'overview'" class="section">
            <Overview />
          </section>
          
          <section v-if="activeSection === 'scope'" class="section">
            <ScopeEditor @cost-updated="handleCostUpdate" />
          </section>
          
          <section v-if="activeSection === 'team'" class="section">
            <CreativeTeam />
          </section>
          
          <section v-if="activeSection === 'timeline'" class="section">
            <ProjectTimeline />
          </section>
          
          <section v-if="activeSection === 'budget'" class="section">
            <BudgetDashboard />
          </section>
        </div>
      </main>
      
      <footer>
        <p>© 2025 Ophelia & Company. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Space Grotesk', sans-serif;
  background-color: #101010;
  color: #f5f5f0;
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: #101010;
}

header {
  width: 100%;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(180, 180, 170, 0.15);
  background-color: rgba(20, 20, 20, 0.95);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.header-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.branding {
  text-align: center;
  margin-bottom: 1.25rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
  letter-spacing: -0.5px;
  background: none;
  -webkit-text-fill-color: #ffffff;
  border-bottom: 2px solid #f0f0e6;
  display: inline-block;
  padding-bottom: 4px;
}

.subtitle {
  font-size: 1.1rem;
  color: #ccccc2;
  font-weight: 500;
}

main {
  flex: 1 0 auto;
  padding: 0;
  width: 100%;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  width: 100%;
  padding: 0;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(180, 180, 170, 0.2);
  color: #fff;
  letter-spacing: -0.25px;
}

.info-box {
  background-color: #1c1c1c;
  border-left: 4px solid #d6d6ce;
  padding: 1.25rem;
  margin: 1.75rem 0;
  border-radius: 0 8px 8px 0;
}

footer {
  width: 100%;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.95rem;
  color: #a0a096;
  border-top: 1px solid rgba(180, 180, 170, 0.15);
  background-color: rgba(20, 20, 20, 0.95);
}

.navigation {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.nav-button {
  background: rgba(28, 28, 28, 0.6);
  border: 1px solid #333;
  color: #f0f0e6;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-button:hover {
  border-color: #d6d6ce;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.nav-button.active {
  background: #1c1c1c;
  border-color: #f0f0e6;
  color: #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  border-bottom: 3px solid #f0f0e6;
}

/* Media queries for responsiveness */
@media (min-width: 768px) {
  .header-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .branding {
    text-align: left;
    margin-bottom: 0;
  }
  
  .navigation {
    justify-content: flex-end;
    width: auto;
  }
}

@media (max-width: 767px) {
  .section {
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .nav-button {
    min-width: calc(50% - 0.5rem);
    padding: 0.6rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
