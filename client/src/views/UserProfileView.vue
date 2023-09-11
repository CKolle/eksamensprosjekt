<script>
import apiService from "../services/apiService.js";
import { RouterView } from "vue-router";
export default {
  name: "UserProfileView",
  data() {
    return {
      userImage: null,
      username: null,
      profilePicture: null,
      bannerPicture: null,
      loading: true,
      isFollowing: false,
    };
  },
  components: {
    RouterView,
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await apiService.fetchUserInfo(this.uid);
        this.userImage = response.profile_picture;
        this.username = response.username;
        this.profilePicture = response.profile_picture;
        this.bannerPicture = response.banner_picture;
        this.isFollowing = await apiService.checkFollow(
          this.$store.state.uid,
          this.uid
        );
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
    async followUser() {
      try {
        await apiService.followUser(this.$store.state.uid, this.uid);
        this.$store.dispatch("addToast", {
          message: "Successfully followed user",
          type: "success",
        });
        this.isFollowing = true;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },

    async unfollowUser() {
      try {
        await apiService.unfollowUser(this.$store.state.uid, this.uid);
        this.$store.dispatch("addToast", {
          message: "Successfully unfollowed user",
          type: "success",
        });
        this.isFollowing = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
  },
  computed: {
    profilePictureSrc() {
      return `http://localhost:5000/images/users/${this.profilePicture}`;
    },
    bannerPictureSrc() {
      return `http://localhost:5000/images/users/${this.bannerPicture}`;
    },
    uid() {
      return this.$route.params.uid;
    },
    isCurrentUser() {
      return String(this.$store.state.uid) === this.$route.params.uid;
    },
    activeTab() {
      const tab = this.$route.path.split("/")[3];
      if (tab === undefined) {
        return "posts";
      }
      return tab;
    },
  },
  async mounted() {
    if (this.isCurrentUser) {
      this.username = this.$store.state.username;
      this.profilePicture = this.$store.state.profilePicture;
      this.bannerPicture = this.$store.state.bannerPicture;
      this.loading = false;
      return;
    }
    await this.fetchUserInfo();
  },
  beforeUnmount() {
    this.$store.dispatch("flushUserCache");
  },

  watch: {
    async uid() {
      this.loading = true;
      await this.fetchUserInfo();
    },
  },
};
</script>

<template>
  <div class="container" v-if="!loading">
    <div
      class="banner-image"
      :style="{ backgroundImage: `url(${bannerPictureSrc})` }"
    >
      <div class="banner-info">
        <div class="banner-info-wrapper">
          <img :src="profilePictureSrc" class="avatar" />
          <div class="banner-name-wrapper">
            <h1 class="username">{{ username }}</h1>
          </div>
          <button
            v-if="!isCurrentUser && !isFollowing"
            @click="followUser"
            class="follow-button"
          >
            Follow
          </button>
          <button
            v-if="!isCurrentUser && isFollowing"
            @click="unfollowUser"
            class="follow-button"
          >
            Unfollow
          </button>
        </div>
      </div>
    </div>

    <div class="navigation-container">
      <div class="navigation-wrapper">
        <router-link
          :to="'/user/' + uid"
          class="nav-link"
          :class="{ active: activeTab === 'posts' }"
          >Posts</router-link
        >
        <router-link
          :to="'/user/' + uid + '/media'"
          class="nav-link"
          :class="{ active: activeTab === 'media' }"
          >Media</router-link
        >
        <router-link
          :to="'/user/' + uid + '/likes'"
          class="nav-link"
          :class="{ active: activeTab === 'likes' }"
          >Liked posts</router-link
        >
        <router-link
          :to="'/user/' + uid + '/follows'"
          class="nav-link"
          :class="{ active: activeTab === 'follows' }"
          >Follows</router-link
        >
        <router-link
          :to="'/user/' + uid + '/about'"
          class="nav-link"
          :class="{ active: activeTab === 'about' }"
          >About</router-link
        >
      </div>
    </div>

    <div class="content-container">
      <div class="inner">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-image {
  height: 300px;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.inner {
  width: 80%;
  max-width: 1200px;
}

.content-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.container {
  width: 100%;
  margin-top: -80px;
}

.avatar {
  width: 100%;
  max-width: 150px;
  min-width: 100px;
  border-radius: 50%;
  border: 2px solid #fff;

  display: block;
  object-fit: cover;
  box-sizing: border-box;
}

.banner-info {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.banner-info-wrapper {
  position: relative;
  display: flex;
  width: 80%;
  max-width: 1200px;
  align-items: flex-end;
}

.banner-name-wrapper {
  margin-left: 20px;
}

.username {
  font-size: 2rem;
  color: #fff;
  font-weight: 700;
}

.navigation-container {
  height: 50px;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  overflow-x: auto;

  background-color: #fff;
}

.navigation-wrapper {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
  width: 80%;
  max-width: 1200px;
  padding: 0 20px;
}

.nav-link {
  font-size: 1.2rem;
  font-weight: 700;
  color: #788197;
  text-decoration: none;
  margin: 0 10px;
}

.nav-link:hover {
  color: var(--secondary-color);
}

.follow-button {
  margin-left: auto;
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: var(--secondary-color);
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}

.follow-button:hover {
  background-color: #2f9be3;
}

.active {
  color: var(--secondary-color);
}

@media (max-width: 600px) {
  .username {
    font-size: 1.5rem;
  }
}
</style>
