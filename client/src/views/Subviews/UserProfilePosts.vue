<script>
import PostCompact from "../../components/PostCompact.vue";
import apiService from "../../services/apiService.js";
export default {
    name: "UserProfilePosts",
    components: {
        PostCompact,
    },
    data() {
        return {
            posts: [],
            loading: true,
            loadMoreTimeout: null,
            dropDownOpen: false,
            sorting: localStorage.getItem("userProfilePostsSort") || "new",
        };
    },
    computed: {
        uid() {
            return this.$route.params.uid;
        },
        lastPostId() {
            if (this.posts.length === 0) {
                return null;
            }
            return this.posts[this.posts.length - 1].id;
        },
        isDescending() {
            return this.sorting === "new";
        },
    },
    methods: {
        async fetchPosts() {
            try {
                const response = await apiService.fetchUserPosts(this.uid, 10, null, null, this.isDescending);
                this.posts = response;
                this.loading = false;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });

            }
        },

        async loadMore() {

            try {
                const response = await apiService.fetchUserPosts(this.uid, 10, this.lastPostId, null, this.isDescending);
                this.posts.push(...response);

            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }

        },

        handleScroll() {
            clearTimeout(this.loadMoreTimeout);
            const loadAhead = 20; // The amount of pixels before the bottom of the page to start loading more posts.
            const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
            const crntScroll = window.scrollY + loadAhead;

            if (crntScroll < pageHeight) {
                return;
            }

            this.loadMoreTimeout = setTimeout(() => {
                this.loadMore();
            }, 500);

        },

    },
    watch: {
        sorting(newVal) {
            this.loading = true;
            localStorage.setItem("userProfilePostsSort", newVal);
            this.dropDownOpen = false;
            this.posts = [];
            this.fetchPosts();
        },
    },
    mounted() {
        this.fetchPosts();
        this.loading = false;
        window.addEventListener("scroll", this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
        clearTimeout(this.loadMoreTimeout);
    },
};
</script>

<template>
    <div class="drop-down sorting">
        <div class="header" @click="dropDownOpen = !dropDownOpen">
            <h3>Sort by {{ sorting }} <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                    :class="{ active: dropDownOpen }"> <!-- Bootstrap chevron down-->
                    <path
                        d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
                        fill="currentColor" />
                </svg>


            </h3>

        </div>
        <div class="body" v-if="dropDownOpen">
            <div class="item">
                <input type="radio" name="sort" id="sort-new" value="new" v-model="sorting">
                <label for="sort-new">New</label>
            </div>
            <div class="item">
                <input type="radio" name="sort" id="sort-old" value="old" v-model="sorting">
                <label for="sort-old">Old</label>
            </div>

        </div>

    </div>


    <div class="result" v-for="post in posts" :key="post.id">
        <post-compact :post="post"></post-compact>
    </div>
</template>

<style scoped>
.header {
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0.5rem 1rem;

}

.header h3 {
    font-size: 1rem;
    font-weight: 500;
    background-color: var(--secondary-color);
    color: #fff;
    padding: 5px 10px 5px 10px;
    margin: 0;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

}

.body {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 1rem;
}

.item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    margin-left: 0.5rem;
    text-indent: 0.5rem;
}

.active {
    transform: rotate(180deg);
    color: #dfdfdf;
}
</style>