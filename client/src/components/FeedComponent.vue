<script>
import apiService from "../services/apiService.js";
import PostCompact from "./PostCompact.vue";
export default {
  name: "FeedComponent",
  components: {
    PostCompact,
  },
  data() {
    return {
      posts: [],
      loading: true,
      loadMoreTimeout: null,
    };
  },
  computed: {
    type() {
      if (this.$route.query.filter === undefined) {
        return "recent";
      }
      return this.$route.query.filter;
    },
    lastPostId() {
      if (this.posts.length === 0) {
        return null;
      }
      return this.posts[this.posts.length - 1].id;
    },
  },
  methods: {
    async fetchUserFeedPosts() {
      try {
        const response = await apiService.fetchUserFeedPosts(
          this.$store.state.uid,
          10,
          null
        );
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
    async fetchPosts() {
      try {
        const response = await apiService.fetchPosts(10, null, null, null);
        this.posts = response;
        this.loading = false;
      } catch (error) {
        this.$store.dispatch("addToast", {
          message: error.message,
          type: "error",
        });
      }
    },
    async loadPosts() {
      this.loading = true;
      this.posts = [];
      if (this.type === "recent") {
        await this.fetchPosts();
      } else {
        await this.fetchUserFeedPosts();
      }
    },

    async loadMore() {

      let newPosts = [];

      if (this.type === "recent") {
        newPosts = await apiService.fetchPosts(10, this.lastPostId, null, null);
      } else {
        newPosts = await apiService.fetchUserFeedPosts(
          this.$store.state.uid,
          10,
          this.lastPostId
        );
      }

      this.posts.push(...newPosts);
    },

    handleScroll() {
      if (this.loadMoreTimeout) {
        clearTimeout(this.loadMoreTimeout);
      }

      this.loadMoreTimeout = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight;

        if (scrollPosition >= pageHeight) {
          this.loadMore();
        }
      }, 100);
    },
  },
  watch: {
    $route() {
      this.loadPosts();
    },
  },
  mounted() {
    if (this.$store.state.uid === null) {
      this.$router.push("/login");
      return;
    }
    this.loadPosts();
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    this.$store.dispatch("flushUserCache");
  },
};
</script>

<template>
  <div class="container">
    <div class="inner">
      <div class="filters">
        <router-link to="/new-post" style="padding-left: 0; margin-top: 0">
          <button class="btn btn-primary">New Post</button>
        </router-link>
        <p>Filters</p>

        <router-link to="/" :class="{ active: type === 'recent' }">
          <i v-if="type === 'recent'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check"
              viewBox="0 0 16 16">
              <path
                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
            </svg>
          </i>
          Recent</router-link>

        <router-link to="/?filter=followed" :class="{ active: type === 'followed' }">
          <i v-if="type === 'followed'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check"
              viewBox="0 0 16 16">
              <path
                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
            </svg>
          </i>

          Followed</router-link>
      </div>
      <div class="search-wrapper">
        <h1>Feed</h1>
        <div class="search-results">
          <post-compact v-for="post in this.posts" :key="post.id" :post="post" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}

.inner {
  width: 80%;
  height: 80%;
  margin-top: 20px;
  background-color: var(--primary-color);
  border-radius: 10px;
  display: flex;
}

.search-wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 0 20px;
  margin-top: 20px;
  margin-right: 20px;
}

.search-wrapper input {
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  outline: none;
  background-color: #f5f5f5;
  font-size: 1.2rem;
  font-weight: bold;
  text-indent: 40px;
  border: none;
  border-radius: 10px;
}

.search-input {
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 20px;
}

.search-input svg {
  position: absolute;
  left: 12px;
  bottom: 5px;
}

.search-input span {
  position: relative;
  text-align: center;
  height: 100%;
}

.filters {
  width: 300px;

  padding: 20px;
  box-sizing: border-box;
}

.filters button {
  width: 100%;
  height: 50px;
  background-color: var(--secondary-color);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
}

.filters button:hover {
  cursor: pointer;
  background-color: #2f9be3;
}

.filters a {
  text-decoration: none;
  font-weight: bold;
  display: block;
  color: #788197;
  margin: 10px 0;
  padding-left: 20px;
}

.filters a:hover {
  color: #2f9be3;
}

.filters p {
  color: #788197;
  font-weight: bold;
  margin: 10px 0;
  padding-left: 10px;
}

.filters a.active {
  color: #2f9be3;
}

.search-results {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.result {
  width: 100%;

  box-sizing: border-box;
  padding: 10px;
  background-color: #f5f5f5;
  margin-bottom: 20px;
  border-radius: 10px;
}

.result:hover {
  cursor: pointer;
  background-color: #e5e5e5;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-size: cover;
  margin-right: 10px;
  display: inline-block;
}

.username {
  font-weight: bold;
  font-size: 1.2rem;
  color: #788197;
  text-decoration: none;
}

.user-result {
  display: flex;
  align-items: center;
}

@media only screen and (max-width: 600px) {
  .inner {
    flex-direction: column;
    max-width: 100vw;
    width: 100vw;
    min-height: 100vh;
    margin-top: 0;
  }

  .search-wrapper {
    margin-right: 0;
  }

  .filters {
    width: 100%;
    margin-top: 20px;
  }

  .filters button {
    width: 100%;
  }
}
</style>
