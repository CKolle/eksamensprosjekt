<script>
import { RouterView } from "vue-router";

export default {
    name: "SettingsView",
    components: {
        RouterView,
    },

    computed: {
        currentRoute() {
            return this.$route.path;
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="inner">
            <nav>
                <router-link to="/settings" :class="{ active: currentRoute === '/settings' }">Profile</router-link>
                <router-link to="/settings/account"
                    :class="{ active: currentRoute === '/settings/account' }">Account</router-link>
            </nav>
            <router-view />
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
}

nav {
    width: 100%;
    height: 50px;
    background-color: #f5f5f5;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-left: 20px;
    gap: 10px;
    border-bottom: var(--secondary-color) 1px solid;
    border-radius: 10px 10px 0 0;
}

nav a {
    text-decoration: none;
    font-weight: bold;
    padding: 12px 20px 10px 20px;
    height: 100%;
    color: var(--secondary-color);
    box-sizing: border-box;
    margin-bottom: -1px;
    vertical-align: bottom;


}

nav a:hover {
    border-radius: 10px 10px 0 0;
    border: var(--secondary-color) 1px solid;
    border-bottom: #f5f5f5 1px solid;
}

nav a.active {
    border-radius: 10px 10px 0 0;
    border: var(--secondary-color) 1px solid;
    border-bottom: #f5f5f5 1px solid;
    background-color: var(--secondary-color);
    color: #fff;
}



@media only screen and (max-width: 600px) {
    .inner {
        max-width: 100vw;
        width: 100vw;
        min-height: 100vh;
        margin-top: 0;
        overflow-x: hidden;
    }
}
</style>