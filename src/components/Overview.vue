<template>
  <div class="overview-container">
    <div class="intro-section">
      <div class="intro-letter">
        <h3 class="letter-heading">Dear Hybe Corporation - Latin America</h3>
        <div class="letter-content">
          <p>
            We're so glad you reached out!</p>
            
            <p>This project represents to us a culmination of our experience with Hybe, our passion for Latin culture, and our commitment to creating meaningful connections between communities. We think it's a perfect match.
            We propose Israel Riqueros as our lead candidate for Creative Director of the visionary Truvatos project.
          </p>

          <p>
            This proposal provides detailed insights into the scope, creative team, timeline, and budget for creative direction. Beyond creative direction, we've proactively identified additional opportunities inspired by our previous experiences with Dream Academy.
          </p>
          
          <p>
            At Ophelia & Company, we bridge cultures through powerful storytelling and visuals. Our authentic Latin cultural understanding and K-pop expertise uniquely position us to translate Truvatos' creative ambitions into a compelling global brand.
          </p>
          
          <p>
            Israel's distinctive approach—characterized by vivid storytelling, bold colors, and cultural authenticity—will help elevate Truvatos' presence worldwide. And with the support of our partners, we can amplify that message to any region or medium where Truvatos fans may be.

          </p>

          <p>
          </p>
          
          <div class="signature">
            <p>Warm regards,</p>
            <p>Jeffrey Haskell</p>
            <p class="title">Executive Producer</p>
            <p>Ophelia & Company</p>
          </div>
        </div>
      </div>
      
      <div class="mascot-container">
        <img src="../assets/ophelia-mascot.png" alt="Ophelia Mascot" class="ophelia-mascot" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Overview'
}
</script>

<style scoped>
.overview-container {
  width: 100%;
  padding: 2.5rem;
  /* Add background/border for visual debugging if needed */
  /* background-color: rgba(255, 0, 0, 0.1); */ 
}

.intro-section {
  display: flex;
  gap: 2.5rem;
  align-items: center;
  width: 100%;
  padding: 0;
  justify-content: space-between;
}

.intro-letter {
  flex: 1.6;
  background-color: rgba(28, 28, 28, 0.6);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(180, 180, 170, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 60%;
}

.letter-heading {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e6e6dc;
  font-weight: 600;
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.letter-content {
  max-width: 95%;
}

.letter-content p {
  margin-bottom: 0.9rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #f5f5f0;
  max-width: 100%;
}

.letter-content p:last-child {
  margin-bottom: 0;
}

.signature {
  margin-top: 1rem;
  color: #f5f5f0;
}

.signature p {
  margin-bottom: 0.25rem !important;
  line-height: 1.5;
}

.signature .title {
  font-style: italic;
  color: #ccccc2;
}

.mascot-container {
  flex: 1.3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ophelia-mascot {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transform: scale(1.2);
}

@media (max-width: 991px) {
  .overview-container {
    min-height: auto;
  }
  
  .intro-section {
    flex-direction: column-reverse;
    gap: 2rem;
  }
  
  .intro-letter {
    max-width: 100%;
    flex: 1;
  }
  
  .mascot-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .ophelia-mascot {
    transform: scale(1.2);
  }
}

@media (max-width: 1200px) {
  .intro-letter {
    max-width: 70%;
    flex: 1.5;
  }
  
  .mascot-container {
    flex: 1.5;
  }
}

@media (max-width: 767px) {
  .intro-letter {
    padding: 1.5rem;
  }
  
  .letter-content p {
    font-size: 1rem;
  }
  
  .mascot-container {
    width: 80%;
  }
}
</style> 