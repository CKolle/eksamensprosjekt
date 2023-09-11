<script>
import FormField from "../../components/Forms/FormField.vue";
import validationService from "../../services/validationService";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
export default {
  name: "AccountSettings",
  components: {
    FormField,
  },
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      email: "",
      username: this.$store.state.username,
      oldPasswordIsValid: false,
      newPasswordIsValid: false,
      confirmPasswordIsValid: false,
      emailIsValid: false,
      usernameIsValid: false,
    };
  },
  methods: {
    validatePassword(password) {
      return validationService.validatePassword(password);
    },
    validateConfirmPassword(confirmPassword) {
      return confirmPassword === this.newPassword;
    },
    validateEmail(email) {
      return validationService.validateEmail(email);
    },
    validateUsername(username) {
      return validationService.validateUsername(username);
    },
    async submitNewPassword() {
      const formVaild =
        this.oldPasswordIsValid &&
        this.newPasswordIsValid &&
        this.confirmPasswordIsValid;
      if (!formVaild) {
        this.$refs.oldPasswordField.blurHandler();
        this.$refs.newPasswordField.blurHandler();
        this.$refs.confirmPasswordField.blurHandler();
        return;
      }
      try {
        const userInfo = {
          old_password: this.oldPassword,
          new_password: this.newPassword,
        };
        await apiService.updateUserInfo(this.$store.state.uid, userInfo);
        this.$store.dispatch("addToast", {
          message: "Successfully updated password",
          type: "success",
        });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },

    async submitNewEmail() {
      const formVaild = this.emailIsValid;
      if (!formVaild) {
        this.$refs.emailField.blurHandler();
        return;
      }
      try {
        const userInfo = {
          email: this.email,
        };
        await apiService.updateUserInfo(this.$store.state.uid, userInfo);
      } catch (error) {
        this.$store.dispatch("addToast", error.message);
      }
    },

    async submitNewUsername() {
      const formVaild = this.usernameIsValid;
      if (!formVaild) {
        this.$refs.usernameField.blurHandler();
        return;
      }
      if (this.username === this.$store.state.username) {
        this.$store.dispatch("addToast", {
          message: "Username is the same",
          type: "error",
        });
        return;
      }
      try {
        const userInfo = {
          username: this.username,
        };
        const response = await apiService.updateUserInfo(
          this.$store.state.uid,
          userInfo
        );
        this.$store.commit("setUsername", response.username);
        this.$store.dispatch("addToast", {
          message: "Username updated",
          type: "success",
        });
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
    async deleteAccount() {
      try {
        await apiService.deleteAccount(this.$store.state.uid);
        authService.logout();
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
  },
};
</script>

<template>
  <h1>Account settings</h1>
  <div class="container">
    <section>
      <h2>Change password</h2>
      <form @submit.prevent="submitNewPassword">
        <div class="field-wrapper">
          <FormField
            type="password"
            placeholder="Current password"
            :validate-func="validatePassword"
            v-model:model-value="oldPassword"
            error-message="Password is too short or too long"
            @on-validity-change="oldPasswordIsValid = $event"
            ref="oldPasswordField"
          />
        </div>
        <div class="field-wrapper">
          <FormField
            type="password"
            placeholder="New password"
            :validate-func="validatePassword"
            v-model:model-value="newPassword"
            error-message="Password is too short or too long"
            @on-validity-change="newPasswordIsValid = $event"
            ref="newPasswordField"
          />
        </div>
        <div class="field-wrapper">
          <FormField
            type="password"
            placeholder="Confirm new password"
            :validate-func="validateConfirmPassword"
            v-model:model-value="confirmPassword"
            error-message="Password doesn't match"
            @on-validity-change="confirmPasswordIsValid = $event"
            ref="confirmPasswordField"
          />
        </div>
        <br />
        <button type="submit">Save</button>
      </form>
    </section>
    <section>
      <h2>Change email</h2>
      <form @submit.prevent="submitNewEmail">
        <div class="field-wrapper">
          <FormField
            type="email"
            placeholder="New email"
            :validate-func="validateEmail"
            v-model:model-value="email"
            error-message="Invalid email"
            @on-validity-change="emailIsValid = $event"
            ref="emailField"
          />
        </div>

        <br />
        <button type="submit">Save</button>
      </form>
    </section>
    <section>
      <h2>Change username</h2>
      <form @submit.prevent="submitNewUsername">
        <div class="field-wrapper">
          <FormField
            type="text"
            placeholder="New username"
            :validate-func="validateUsername"
            v-model:model-value="username"
            error-message="Username is of wrong length or contains spaces"
            @on-validity-change="usernameIsValid = $event"
            ref="usernameField"
          />
        </div>
        <br />
        <button type="submit">Save</button>
      </form>
    </section>
    <section>
      <h2>Delete account</h2>
      <button @click="deleteAccount" class="delete-btn">Delete account</button>
    </section>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

h1 {
  padding: 20px;
  font-weight: 600;
}

h2 {
  font-size: 1.25rem;
  font-weight: 400;
  border-bottom: 1px solid;
}

section {
  padding: 20px;
  min-width: 300px;
  box-sizing: border-box;
}

button {
  margin-top: 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
}

button:disabled {
  background-color: #bfbfbf;
  cursor: not-allowed;
}

button:hover:enabled {
  background-color: #2f8ed0;
}

form {
  display: flex;
  flex-direction: column;
  min-width: 300px;
}

.field-wrapper {
  margin-bottom: 2rem;
  width: 100%;
  height: 35px;

  box-sizing: border-box;
}

.delete-btn {
  background-color: #ff0000;
  color: white;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  margin-top: 0;
  width: 100%;
}

.delete-btn:hover:enabled {
  background-color: #ff4d4d;
}

@media only screen and (max-width: 600px) {
  .container {
    flex-direction: column;
  }
}
</style>
