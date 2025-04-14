<script>
import { ref } from 'vue';

export default {
  name: 'PasswordProtect',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const password = ref('');
    const error = ref(false);
    const showTerms = ref(false);
    
    const validatePassword = () => {
      if (password.value === 'TRUVATOS2025') {
        // Save to localStorage for persistence
        localStorage.setItem('truvatos_authenticated', 'true');
        emit('authenticated', true);
        error.value = false;
      } else {
        error.value = true;
      }
    };
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        validatePassword();
      }
    };
    
    const toggleTerms = () => {
      showTerms.value = !showTerms.value;
    };
    
    return {
      password,
      error,
      showTerms,
      validatePassword,
      handleKeyPress,
      toggleTerms
    };
  }
};
</script>

<template>
  <div class="password-protect">
    <video class="background-video" autoplay loop muted playsinline>
      <source src="../assets/walk_anim.mp4" type="video/mp4">
    </video>
    <div class="password-container">
      <img src="../assets/Logo.png" alt="Ophelia & Company Logo" class="logo" />
      <p class="subtitle">Proposal Portal</p>
      
      <div class="input-group">
        <label for="password">Please enter your project code:</label>
        <input 
          id="password" 
          type="password" 
          v-model="password" 
          @keyup="handleKeyPress"
          placeholder="Enter project code"
          :class="{ 'error': error }"
        />
        <p v-if="error" class="error-message">Invalid project code. Please try again.</p>
        <button @click="validatePassword" class="submit-btn">Continue</button>
        <p class="terms-link">By continuing, you agree to our<br><a href="#" @click.prevent="toggleTerms">Terms & Privacy Policy</a></p>
      </div>
    </div>
    
    <!-- Terms Modal -->
    <div v-if="showTerms" class="terms-modal">
      <div class="terms-content">
        <div class="terms-header">
          <h3>Ophelia and Company Terms of Use and Privacy Policy</h3>
          <button @click="toggleTerms" class="close-btn">&times;</button>
        </div>
        <div class="terms-body">
          <p class="terms-date">Effective Date: April 10, 2025</p>
          
          <h4>1. Scope and Acceptance</h4>
          <p>This website and proposal portal is exclusively operated by Ophelia and Company ("Ophelia", "We", "Us"). When accessing any content, proposals, or materials ("Materials") made available within the Portal, you accept the following conditions in full, without limitation.</p>
          
          <h4>2. Confidentiality and Privacy</h4>
          <p>You acknowledge that Materials within the Portal are confidential. You agree to treat all provided information as strictly confidential and not disclose or reproduce the Materials to any third party without express written consent from Ophelia.</p>
          
          <p>Ophelia collects limited personal data (name, contact details, company information) solely for the purposes of accessing the Portal, tracking user access, and maintaining proposal security. We respect your privacy and will not sell, share, or distribute your personal information outside Ophelia or its directly affiliated partners without your explicit consent.</p>
          
          <h4>3. Ownership of Ideas and Intellectual Property</h4>
          <p>All creative concepts, designs, ideas, services, plans, methodologies, contractors, subcontractors, and partners presented within this Portal are exclusively developed and owned by Ophelia unless otherwise explicitly stated. Upon entering the Portal:</p>
          <ul>
            <li>You expressly agree that Ophelia retains exclusive intellectual property rights over all ideas, strategies, services, individuals, and partner contractors presented.</li>
            <li>You explicitly waive any and all claims of prior or concurrent creation, conception, or ownership of any ideas or services presented within the Portal.</li>
            <li>By virtue of entering this Portal, you acknowledge and irrevocably accept that any similarity between your prior or concurrent ideas and those presented within the Portal shall be conclusively presumed in favor of Ophelia, and thus deemed property of Ophelia.</li>
          </ul>
          
          <h4>4. Restriction on Use and Obligations of Payment</h4>
          <p>Upon entering the Portal, you agree not to utilize, directly or indirectly, any of the following without explicit prior written consent from Ophelia:</p>
          <ul>
            <li>Ideas, designs, proposals, concepts, strategic plans, methodologies, or any form of intellectual property outlined or presented in the Materials.</li>
            <li>Contractors, subcontractors, or trusted partners introduced or identified within the Portal or proposal.</li>
          </ul>
          
          <p>Should you proceed to use or engage any concept, idea, contractor, subcontractor, or partner introduced or displayed within the Portal without our explicit prior written consent, the following conditions shall automatically apply:</p>
          <ul>
            <li>You immediately and explicitly agree to pay Ophelia the associated fees for each utilized concept, idea, or service as specified in the original proposal viewed within the Portal.</li>
            <li>If you independently contract any of Ophelia's identified contractors, subcontractors, or partners, you explicitly agree to pay Ophelia the associated fees for each deliverable or service associated with said contractor, subcontractor, or partner engaged without Ophelia's prior written consent.</li>
            <li>You understand and accept that payments owed to Ophelia become immediately due upon commencement of utilization of the ideas, services, or contractors, irrespective of any separate agreements you may independently form.</li>
            <li>Ophelia reserves the right to pursue all legal remedies to collect such payments.</li>
          </ul>
          
          <h4>5. Enforcement and Remedies</h4>
          <p>You acknowledge that any unauthorized use or disclosure of Materials presented in the Portal may result in irreparable harm to Ophelia, for which monetary damages alone may not provide sufficient remedy. Ophelia shall be entitled, without waiving any other rights or remedies, to injunctive relief or other equitable remedies, in addition to all legal remedies available.</p>
          
          <h4>6. Governing Law and Jurisdiction</h4>
          <p>These terms shall be governed by and construed according to the laws of the State of California, USA. Any dispute arising from these Terms and Conditions shall be resolved in the courts located within Los Angeles County, California.</p>
          
          <h4>7. Modifications to Terms</h4>
          <p>Ophelia reserves the right to modify these Terms and Conditions at any time without prior notice. Any amendments will be effective immediately upon posting. Continued access to the Portal constitutes your ongoing agreement to these revised terms.</p>
          
          <p class="terms-footer">By entering the access code and viewing any content within the Portal, you agree that you have fully read, understand, and accept these Terms and Conditions in their entirety.</p>
          
          <p>For questions or to request explicit written permission to utilize any information or partner presented within the Portal, please contact Ophelia and Company at:</p>
          
          <p class="company-info">
            Ophelia and Company<br>
            Email: hello@ophelia.company<br>
            Phone: (714) 473-0540
          </p>
          
          <p class="terms-update">Last Updated: April 10, 2025</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-protect {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  position: relative;
  overflow: hidden;
  padding-bottom: 10vh;
}

.background-video {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
  z-index: 1;
  object-fit: cover;
}

.password-container {
  background-color: #1c1c1c;
  border-radius: 6px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 320px;
  text-align: center;
  position: relative;
  z-index: 2;
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
  font-size: 0.9rem;
  color: #ccccc2;
  font-weight: 500;
  margin-bottom: 1.4rem;
}

.input-group {
  margin-top: 1rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  color: #f0f0e6;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #333;
  background-color: #252525;
  color: #f0f0e6;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  font-family: 'Space Grotesk', sans-serif;
}

input:focus {
  outline: none;
  border-color: #f0f0e6;
}

input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
}

.submit-btn {
  background: #1c1c1c;
  border: 1px solid #f0f0e6;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 0.4rem;
}

.submit-btn:hover {
  background-color: #252525;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.logo {
  max-width: 120px;
  margin-bottom: 0.7rem;
}

/* Terms link styling */
.terms-link {
  margin-top: 1rem;
  font-size: 0.7rem;
  color: #8a8a8a;
  text-align: center;
  line-height: 1.4;
}

.terms-link a {
  color: #a5a5a5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.terms-link a:hover {
  color: #f0f0e6;
  text-decoration: underline;
}

/* Terms Modal */
.terms-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.terms-content {
  background-color: #1c1c1c;
  border-radius: 6px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.terms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  background-color: #1c1c1c;
  z-index: 1;
}

.terms-header h3 {
  margin: 0;
  color: #f0f0e6;
  font-size: 1.2rem;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #f0f0e6;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.terms-body {
  padding: 1.5rem;
  color: #e0e0dc;
  font-size: 0.9rem;
  line-height: 1.5;
}

.terms-body h4 {
  margin: 1.5rem 0 0.5rem;
  color: #f0f0e6;
  font-size: 1rem;
}

.terms-body p {
  margin: 0.5rem 0 1rem;
}

.terms-body ul {
  margin: 0.5rem 0 1rem;
  padding-left: 1.5rem;
}

.terms-body li {
  margin-bottom: 0.5rem;
}

.terms-date, .terms-update {
  font-style: italic;
  color: #a5a5a5;
  font-size: 0.8rem;
}

.terms-footer {
  font-weight: 500;
  border-top: 1px solid #333;
  padding-top: 1rem;
  margin-top: 1.5rem;
}

.company-info {
  background-color: #252525;
  padding: 0.8rem;
  border-radius: 4px;
  margin: 1rem 0;
}
</style> 