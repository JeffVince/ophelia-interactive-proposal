<template>
  <div class="overview-container">
    <div class="intro-section">
      <div class="intro-letter">
        <h3 class="letter-heading">Dear Hybe Corporation - Latin America</h3>
        <div class="letter-content">
          <p>
            We're so glad you reached out!</p>
            
            <p>
              The Truvatos project represents to us at Ophelia & Company an exciting opportunity to venture into a creative frontier, to honor and give back to the Latin cultures that have shaped our identity, and to forge meaningful connections between diverse communities and cultures. It is clear from our past experience with Katseye that Hybe Corporation's methodologies result in profound cultural impact globally. And so we would be delighted to join you all in committing to this new adventure.           </p>
            <p>
              We propose Israel Riqueros as our lead candidate for Creative Director due to his deep cultural insight, industry expertise, and artistic relevance to the project. His innovative approach—characterized by vivid storytelling, bold visual expressions, and cultural authenticity—aligns seamlessly with Truvatos' creative ambitions. With Israel at the helm and art director DJ Jung contributing valuable K-pop experience, we believe this combination offers a powerful and globally resonant foundation for success.
            </p>

          <p>
            Enclosed, you will find a proposal detailing the project's scope, our creative team, timeline, and budget. Beyond creative direction, we have proactively identified additional opportunities inspired by our previous collaboration on Hybe's Dream Academy.          </p>
          
          <p>
            At Ophelia & Company, we specialize in bridging cultures through compelling storytelling and striking visuals. With our combined experience in Latin culture and K-pop, we are confident in our ability to help shape Truvatos into a vibrant, globally recognized brand. We look forward to the possibility of collaborating with you to bring this vision to life.
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
  font-size: 0.95rem;
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