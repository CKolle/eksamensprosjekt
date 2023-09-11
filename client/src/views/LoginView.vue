<script>
import authService from "../services/authService";
import { RouterLink } from "vue-router";
import FormCard from "../components/Forms/FormCard.vue";
import LoginForm from "../components/Forms/LoginForm.vue";
export default {
  components: {
    FormCard,
    LoginForm,
    RouterLink,
  },
  name: "LoginView",
  methods: {
    async login(credentials) {
      try {
        const { username, password } = credentials;
        await authService.login(username, password);
        this.$router.push("/");
      } catch (error) {
        this.$store.dispatch("addToast",
          {
            message: error.message,
            type: "error",
          });
      }
    },
  },
  beforeCreate() {
    if (this.$store.state.token) {
      this.$router.push("/");
    }
  },

};


</script>

<template>
  <FormCard>
    <h2>Login</h2>
    <LoginForm @login="login" />
    <p>
      <router-link to="/register">
        Don't have an account? <span style="color: #707eff">Register here!</span>
      </router-link>
    </p>
  </FormCard>
</template>

<style scoped>
h2 {
  margin-bottom: 5rem;
  margin-top: 3rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #756e6e;
}

p {
  margin-top: 5rem;
}

a {
  font-family: 'Inter', sans-serif;
  color: #756e6e;
  text-decoration: none;
}
</style>
```