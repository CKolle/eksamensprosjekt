<script>
import PostCompact from "../../components/PostCompact.vue";
import apiService from "../../services/apiService";
export default {
    name: "UserProfileMedia",
    data() {
        return {
            posts: [],
            loading: true,
            loadMoreTimeout: null,
        };
    },
    components: {
        PostCompact,
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
    },
    methods: {
        async fetchPosts() {
            try {
                const response = await apiService.fetchUserPosts(this.uid, 10, null, true);
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
                const response = await apiService.fetchUserPosts(this.uid, 10, this.lastPostId, true);
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
            const loadAhead = 100; // The amount of pixels before the bottom of the page to start loading more posts.
            const pageHeight = document.documentElement.offsetHeight - window.innerHeight;
            const crntScroll = window.scrollY + loadAhead;

            if (crntScroll < pageHeight) {
                return;
            }

            this.loadMoreTimeout = setTimeout(() => {
                this.loadMore();
            }, 500);


        }
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
    <div class="result" v-for="post in posts" :key="post.id">
        <post-compact :post="post"></post-compact>
    </div>
</template>