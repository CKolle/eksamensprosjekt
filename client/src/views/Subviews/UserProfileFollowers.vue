<script>
import UserResult from "../../components/UserResult.vue";
import apiService from "../../services/apiService.js";
export default {
    name: "UserProfileFollowers",
    components: {
        UserResult,
    },
    data() {
        return {
            followers: [],
            loading: true,
        };
    },
    computed: {
        uid() {
            return this.$route.params.uid;
        },
        lastFollowId() {
            if (this.followers.length === 0) {
                return null;
            }
            return this.followers[this.followers.length - 1].id;
        },
    },
    methods: {
        async fetchFollowers() {
            try {
                const response = await apiService.getFollowing(this.uid, null);
                this.followers = response;
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
                const response = await apiService.getFollowing(this.uid, this.lastFollowId);
                this.posts.push(...response);

            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }

        },


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


    },
    mounted() {
        this.fetchFollowers();
        this.loading = false;
        window.addEventListener("scroll", this.handleScroll);
    },
};
</script>

<template>
    <div class="result" v-for="follower in followers" :key="follower.id">
        <user-result :user="follower"></user-result>
    </div>
</template>