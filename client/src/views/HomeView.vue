<script>
import PromotionalPage from "../components/PromotionalPage.vue";
import FeedView from "../components/FeedComponent.vue";
export default {
  name: "HomeView",
  components: {
    FeedView,
    PromotionalPage,
  },
  data() {
    return {};
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    },
  },
};
</script>

<template>
  <feed-view v-if="isLoggedIn" />
  <promotional-page v-if="!isLoggedIn" />
</template>


