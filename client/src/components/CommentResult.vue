<script>
import apiService from "../services/apiService";
export default {
    name: "CommentResult",
    data() {
        return {
            userProfilePicture: "",
            username: "",
            loading: true,
        };
    },
    props: {
        comment: {
            type: Object,
            required: true,
        },
    },
    computed: {
        profilePictureSrc() {
            return `http://localhost:5000/images/users/${this.userProfilePicture}`;
        },
    },
    methods: {
        async fetchUserInfo() {
            try {
                const response = await apiService.fetchUserInfo(this.comment.uid);
                this.userProfilePicture = response.profile_picture;
                this.username = response.username;
            } catch (error) {

                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
    },
    async mounted() {
        this.fetchUserInfo();
        this.loading = false;
    },
};

</script>

<template>
    <div class="comment-result" v-if="!loading">
        <div class="header">
            <router-link :to="'/user/' + comment.uid" :style="{ backgroundImage: `url(${profilePictureSrc})` }"
                class="avatar" />
            <router-link :to="'/user/' + comment.uid" class="name">{{ username }}</router-link>
        </div>

        <div class="comment-content">
            <p>{{ comment.content }}</p>
        </div>
    </div>
</template>

<style scoped>
.comment-result {
    margin-bottom: 10px;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 10px;
}

.avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 10px;
    display: inline-block;
    background-size: cover;
}

.name {
    color: #788197;
    font-weight: bold;
    text-decoration: none;

}

.header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
</style>
