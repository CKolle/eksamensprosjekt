<script>
import FormField from "./FormField.vue";
import validationService from "../../services/validationService";
export default {
  data() {
    return {
      username: "",
      password: "",
      email: "",
      repeatPassword: "",
      usernameIsValid: false,
      emailIsValid: false,
      passwordIsValid: false,
      repeatPasswordIsValid: false,
    };
  },
  methods: {
    async submit() {
      const fromValid = this.usernameIsValid && this.passwordIsValid && this.repeatPasswordIsValid && this.emailIsValid;
      if (!fromValid) {
        this.$refs.usernameField.blurHandler();
        this.$refs.passwordField.blurHandler();
        this.$refs.repeatPassword.blurHandler();
        this.$refs.emailField.blurHandler();
        return;
      }
      this.$emit("register", {
        username: this.username,
        password: this.password,
        email: this.email,
      });
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    validateEmail(email) {
      return validationService.validateEmail(email);
    },
    validatePassword(password) {
      return validationService.validatePassword(password);
    },
    validateRepeatPassword(repeatPassword) {
      return repeatPassword === this.password;
    },

  },

  components: { FormField }
};
</script>

<template>
  <form @submit.prevent="submit">

    <FormField type="text" placeholder="Username" v-model="username" :validateFunc="validateUsername"
      errorMessage="Username is of wrong length or contains spaces" @onValidityChange="usernameIsValid = $event"
      ref="usernameField" />

    <FormField type="email" placeholder="Email" v-model="email" :validateFunc="validateEmail"
      errorMessage="That is not a valid email" @onValidityChange="emailIsValid = $event" ref="emailField" />

    <FormField type="password" placeholder="Password" v-model="password" :validateFunc="validatePassword"
      errorMessage="Password is too short or too long" @onValidityChange="passwordIsValid = $event" ref="passwordField" />

    <FormField type="password" placeholder="Repeat Password" v-model="repeatPassword"
      :validateFunc="validateRepeatPassword" errorMessage="Password does not match"
      @onValidityChange="repeatPasswordIsValid = $event" ref="repeatPassword" />

    <button type="submit">REGISTER</button>
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
  background-color: #2fabf0;
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
</style>