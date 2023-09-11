<script>
import { RouterLink } from "vue-router";
export default {
  name: "PromotionalPage",
  component: { RouterLink },
  mounted() {
    document.documentElement.style.setProperty("--contrast-color", "black");
  },
  beforeUnmount() {
    document.documentElement.style.setProperty("--contrast-color", "#dedede");

  }
};
</script>

<template>
  <div class="promo-grid">
    <div class="promo-cell">
      <h2 class="header">Looking for a new social media platform?</h2>
      <span class="word">Socialise</span>
      <br />
      <span class="word">Connect</span>
      <br />
      <span class="word">Share</span>
      <br />
      <br />
      <div class="register-wrapper">
        <img src="http://localhost:5000/images/icons/logo-text-pixian.png" alt="Shreddit Brand" width="42" height="42">

        <router-link to="/register" class="register-btn"> Register</router-link>


      </div>

    </div>


  </div>
</template>

<style scoped>
img {
  width: 200px;
  height: auto;

}

.register-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;

  flex-wrap: wrap;
}

.promo-grid {
  padding: 50px 0 0 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
  height: 100%;
  margin-top: -80px;
  margin-bottom: 60px;
}

.promo-cell {
  margin: 50px;
}

.promo-background {
  position: relative;
  top: 15%;
  background-image: url("http://localhost:5000/images/backgrounds/promo.png");
  background-repeat: no-repeat;
  background-size: 100%;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}

h2 {
  font-size: 60px;
  margin-bottom: 5rem;
  margin-top: 3rem;
  font-weight: bold;
  font-family: "Inter", sans-serif;
  color: white;
}

span {
  font-size: 40px;
  font-weight: bold;
  font-family: "Inter", sans-serif;
  text-decoration: none;
  background-color: #4158d0;
  background-image: linear-gradient(43deg,
      #4158d0 0%,
      #c850c0 46%,
      #ffcc70 100%);
  background-clip: border-box;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.word {
  position: relative;
  left: -100%;
  /* Start offscreen */
  animation: slide-in 0.5s forwards;
}

.register-btn {
  font-size: 20px;
  background-color: #2fabf0;
  border: none;
  color: #fff;
  margin-top: 4rem;
  margin-left: 1rem;
  padding: 1rem 3rem 1rem 3rem;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.register-btn:hover {
  cursor: pointer;
  background-color: #2f9be3;
}

@keyframes slide-in {
  0% {
    left: -50%;
    /* Start offscreen */
  }

  100% {
    left: 0%;
    /* Slide into view */
  }
}

@media screen and (max-width: 600px) {}
</style>
