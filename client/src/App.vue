<script >
import { RouterView } from "vue-router";
import authService from "./services/authService";
import apiService from "./services/apiService";
import NavigationMenu from "./components/Navigation/NavigationMenu.vue";
import ToastNotifier from "./components/ToastNotifier.vue";

export default {
  components: {
    RouterView,
    NavigationMenu,
    ToastNotifier,
  },
  data() {
    return {
      finishedLoading: false,
    };
  },
  async mounted() {
    try {
      await authService.authenticateByStorage();
    } catch (error) {
      // Not necessarily an error, just means the user is not logged in

    }
    if (this.$store.state.token) {
      try {
        await apiService.fetchUserInfo(this.$store.state.uid);
      } catch (error) {
        this.$store.dispatch("addToast", {
          type: "error",
          message: "Unable to fetch user info",
        });
      }
    }

    this.finishedLoading = true;
  },
};


</script>

<template>
  <NavigationMenu v-if="finishedLoading" />
  <router-view v-if="finishedLoading" />
  <ToastNotifier />
</template>


