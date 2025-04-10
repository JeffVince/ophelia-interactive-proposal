<script>
import { ref } from 'vue';

export default {
  name: 'PasswordProtect',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const password = ref('');
    const error = ref(false);
    
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
    
    return {
      password,
      error,
      validatePassword,
      handleKeyPress
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
</style> 