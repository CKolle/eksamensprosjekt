<script>
import apiService from "../../services/apiService.js";
export default {
    name: "UserProfileAbout",
    data() {
        return {
            about: "",
            loading: true,
        };
    },
    computed: {
        uid() {
            return this.$route.params.uid;
        },
    },
    methods: {
        async fetchAbout() {
            try {
                const response = await apiService.fetchUserInfo(this.uid);
                this.about = response.about_me;
                this.loading = false;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
    },
    mounted() {
        this.fetchAbout();
        this.loading = false;
    },

};

</script>

<template>
    <h2>About me</h2>
    <div class="about">
        <p>{{ about }}</p>
    </div>
</template>

<style scoped>
.about {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 5px;
    background-color: var(--primary-color);
}
</style>
