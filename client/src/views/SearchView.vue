<script>
import apiService from "../services/apiService.js";
import PostCompact from "../components/PostCompact.vue";
import UserResult from "../components/UserResult.vue";
export default {
    name: "SearchView",
    data() {
        return {
            searchQuery: "",
            searchTimeout: null,
            loadMoreTimeout: null,
            posts: [],
            users: [],
        };
    },
    components: {
        PostCompact,
        UserResult,
    },
    computed: {
        type() {
            if (this.$route.query.type === undefined) {
                return "post";
            }
            return this.$route.query.type;
        },
        lastPostId() {
            if (this.posts.length === 0) {
                return null;
            }
            return this.posts[this.posts.length - 1].id;
        },
        lastUserId() {
            if (this.users.length === 0) {
                return null;
            }
            return this.users[this.users.length - 1].id;
        },
    },
    methods: {
        async searchPosts() {
            try {
                const response = await apiService.fetchPosts(10, null, this.searchQuery);
                this.posts = response;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        async searchUsers() {
            try {
                const response = await apiService.fetchUsers(10, null, this.searchQuery);
                this.users = response;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }

        },

        async search() {
            clearTimeout(this.searchTimeout);
            if (this.searchQuery === "") {
                this.posts = [];
                this.users = [];
                return;
            }

            this.searchTimeout = setTimeout(async () => {
                if (this.type === "post") {
                    await this.searchPosts();
                } else {
                    await this.searchUsers();
                }
            }, 500);
        },
        async loadMorePosts() {

            try {
                const response = await apiService.fetchPosts(10, this.lastPostId, this.searchQuery);
                this.posts.push(...response);

            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },


        async loadMoreUsers() {

            try {
                const response = await apiService.fetchUsers(10, this.lastUserId, this.searchQuery);
                this.users.push(...response);

            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }

        },

        handleScroll() {
            clearTimeout(this.loadMoreTimeout);
            const loadAhead = 100; // The amount of pixels before the bottom of the page to start loading more posts.
            const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
            const crntScroll = window.scrollY + loadAhead;

            if (crntScroll < pageHeight) {
                return;
            }

            if (this.type === "post") {
                this.loadMoreTimeout = setTimeout(this.loadMorePosts.bind(this), 1000);
            } else {
                this.loadMoreTimeout = setTimeout(this.loadMoreUsers.bind(this), 1000);
            }
        }

    },
    watch: {
        type(newType, oldType) {
            if (oldType === newType) {
                return;
            }
            clearTimeout(this.searchTimeout);
            clearTimeout(this.loadMoreTimeout);

            if (newType === "post") {
                this.users = [];
                this.searchQuery = "";
            } else {
                this.posts = [];
                this.searchQuery = "";
            }

        }
    },
    mounted() {
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
                <router-link to="/new-post" style="padding-left: 0; margin-top: 0;">
                    <button class="btn btn-primary">New Post</button>
                </router-link>
                <p>Type</p>

                <router-link to="/search" :class="{ active: type === 'post' }">
                    <i v-if="type === 'post'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-check" viewBox="0 0 16 16">
                            <path
                                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                        </svg>
                    </i>
                    Posts</router-link>

                <router-link to="/search?type=user" :class="{ active: type === 'user' }">
                    <i v-if="type === 'user'">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-check" viewBox="0 0 16 16">
                            <path
                                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                        </svg>
                    </i>

                    Users</router-link>

            </div>
            <div class="search-wrapper">

                <div class="search-input">
                    <span>
                        <i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-search" viewBox="0 0 16 16">
                                <path
                                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </i>
                    </span>
                    <input type="text" placeholder="Search..." v-model="searchQuery" @input="search" />

                </div>


                <div class="search-results">
                    <post-compact v-for="post in this.posts" :key="post.id" :post="post" />
                    <user-result v-for="user in this.users" :key="user.id" :user="user" />


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