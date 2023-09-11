<script>
import FormField from "./FormField.vue";
import validationService from "../../services/validationService";
export default {
  data() {
    return {
      username: "",
      password: "",
      usernameIsValid: false,
      passwordIsValid: false,
    };
  },
  methods: {
    async submit() {
      const fromValid = this.usernameIsValid && this.passwordIsValid;
      // Handles if the user presses enter on the keyboard to submit the form
      if (!fromValid) {
        this.$refs.usernameField.blurHandler();
        this.$refs.passwordField.blurHandler();
        return;
      }

      this.$emit("login", {
        username: this.username,
        password: this.password,
      });
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    validatePassword(password) {
      return validationService.validatePassword(password);
    },
  },
  components: { FormField }
};
</script>

<template>
  <form @submit.prevent="submit">
    <div class="field-wrapper">
      <FormField type="text" placeholder="Username" v-model="username" :validateFunc="validateUsername"
        errorMessage="Username is of wrong length or contains spaces" @onValidityChange="usernameIsValid = $event"
        ref="usernameField" />
    </div>

    <div class="field-wrapper">
      <FormField type="password" placeholder="Password" v-model="password" :validateFunc="validatePassword"
        errorMessage="Password is too short or too long" @onValidityChange="passwordIsValid = $event"
        ref="passwordField" />
    </div>


    <button type="submit">LOGIN</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

button {
  background-color: var(--secondary-color);
  border: none;
  color: #fff;
  margin-top: 3rem;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 5px;
  font-family: 'Inter', sans-serif;
}

button:hover {
  cursor: pointer;
  background-color: #2f8be0;
}

.field-wrapper {
  margin-bottom: 2rem;
  width: 100%;
  height: 35px;

  box-sizing: border-box;
}
</style>