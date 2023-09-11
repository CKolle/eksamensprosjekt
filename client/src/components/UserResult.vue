<script>
import { RouterLink } from "vue-router";
export default {
    name: "UserResult",
    components: {
        RouterLink,
    },
    props: {
        user: {
            type: Object,
            required: true,
        },
    },
    computed: {
        profilePictureSrc() {
            return `http://localhost:5000/images/users/${this.user.profile_picture}`;
        },
    },
};

</script>

<template>
    <div class="result user-result" @click="$router.push(`/user/${user.id}`)">
        <router-link :to="'/user/' + user.id" :style="{ backgroundImage: `url(${profilePictureSrc})` }" class="avatar" />
        <router-link :to="'/user/' + user.id" class="username">{{ user.username }}</router-link>
    </div>
</template>

<style scoped>
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
</style>