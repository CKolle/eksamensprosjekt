<script>
import authService from "../services/authService";
import { RouterLink } from "vue-router";
import FormCard from "../components/Forms/FormCard.vue";
import RegisterForm from "../components/Forms/RegisterForm.vue";
export default {
  components: {
    FormCard,
    RegisterForm,
    RouterLink,
  },
  name: "RegisterView",
  methods: {
    async register(credentials) {
      try {
        const { username, password, email } = credentials;
        await authService.register(username, password, email);
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
    <h2>Register</h2>
    <RegisterForm @register="register" />
    <p><router-link to="/login">
        Already have an account? <span style="color: #707eff">Login here!</span>
      </router-link></p>
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