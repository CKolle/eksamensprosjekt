<script>
import authService from "../../services/authService";
export default {
    name: "NavigationBar",
    data() {
        return {
            profileDropdownOpen: false,
            scrollTimer: null,
            isNavbarHidden: false,
            prevPos: 0,
            isScrolled: false,
        };
    },
    methods: {
        logout() {
            authService.logout();
        },
        handleScroll() {
            clearTimeout(this.scrollTimer);

            this.isScrolled = window.scrollY !== 0;

            const crntPos = window.scrollY;
            const isScrollingDown = crntPos > this.prevPos;

            if (isScrollingDown && this.isScrolled) {
                this.isNavbarHidden = true;
            } else {
                this.isNavbarHidden = false;
            }

            this.prevPos = crntPos;


            this.scrollTimer = setTimeout(() => {

            }, 50);
        }

    },
    computed: {
        isLoggedIn() {
            return this.$store.state.isLoggedIn;
        },
        profilePicture() {
            return `http://localhost:5000/images/users/${this.$store.state.profilePicture}`;
        },
        isTransparent() {
            let path = this.$route.path;
            path = path.split("/")[1];
            if (path === "user" && !this.isScrolled) {
                return true;
            }
            return false;
        }

    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }
};

</script>

<template>
    <div id="navbar" :class="{
        hidden: isNavbarHidden,
        transparent: isTransparent
    }" @mouseleave="profileDropdownOpen = false">
        <div class="logo-wrapper">
            <img src="http://localhost:5000/images/icons/logo-pixian.png" alt="logo" />
        </div>
        <nav class="quick-access">
            <div class="links">
                <router-link to="/" v-if="isLoggedIn">Home</router-link>
                <router-link to="/search" v-if="isLoggedIn">Search</router-link>
                <router-link to="/new-post" v-if="isLoggedIn">New post</router-link>
            </div>
            <div class="auth" v-if="!isLoggedIn">
                <router-link to="/login" class="login">Login</router-link>
                <router-link to="/register" class="register">Register</router-link>
            </div>
            <div class="auth" v-if="isLoggedIn">
                <div>
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                        @mouseover="profileDropdownOpen = true" fill="currentColor"
                        :class="{ active: profileDropdownOpen }">
                        <!-- Bootstrap chevron down-->
                        <path
                            d="M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z"
                            fill="currentColor" />
                    </svg>

                </div>
                <img :src="profilePicture" alt="profile" @mouseover="profileDropdownOpen = true" />
                <div v-if="profileDropdownOpen" class="profile-dropdown" @mouseleave="profileDropdownOpen = false">
                    <router-link :to="'/user/' + $store.state.uid">Profile</router-link>
                    <router-link to="/settings">Settings</router-link>
                </div>


                <button @click="logout">Logout</button>
            </div>
        </nav>

    </div>
</template>

<style scoped>
.hidden {
    transform: translateY(-100%);
}

#navbar {
    width: 100%;
    height: 80px;
    background-color: #474b6d;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.4s ease-in-out;
}

#navbar.transparent {
    background: rgba(71, 75, 109, 0.5);
    transition: background-color 0.4s ease-in-out;
}

.quick-access {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 70%;
}

.links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 80%;
}

.auth {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 20%;
}

.auth img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.auth button {
    background-color: var(--secondary-color);
    color: #fff;
    padding: 10px 20px;
    border: none;
    outline: none;
    cursor: pointer;
    border-radius: 5px;
}

.auth button:hover {
    background-color: #2f9be3;
}

.auth .login {
    background-color: var(--secondary-color);
    color: #fff;
    text-decoration: none;
    padding: 10px 20px;
    border: none;
    outline: none;
    cursor: pointer;
    border-radius: 5px;
}

.auth .login:hover {
    background-color: #2f9be3;
}

.auth .register {
    color: #dadada;
    text-decoration: none;
    padding: 10px 20px;
    border: none;
    outline: none;
    cursor: pointer;
    border-radius: 5px;
}

.auth .register:hover {
    color: #fff;
}

.profile-dropdown {
    position: absolute;
    width: 200px;
    height: 100px;
    background-color: #fff;
    top: 80px;
    border: 3px solid #dedede;
    border-radius: 5px;
    filter: drop-shadow(0px 0.25px 1px rgba(0, 0, 0, 0.039)) drop-shadow(0px 0.85px 3px rgba(0, 0, 0, 0.19));
    box-sizing: border-box;

}

.links a {
    color: #dadada;
    text-decoration: none;
    font-size: 1.0rem;
    font-weight: 500;
    margin-left: 10px;

}

.links a:hover {
    color: #fff;
}

.profile-dropdown a {
    display: block;
    padding: 10px 20px;
    color: #788197;
    font-size: 1.0rem;
    font-weight: 600;
    text-decoration: none;
}

.active {
    transform: rotate(180deg);
    color: #fff;
}

.profile-dropdown a:hover {
    background-color: #f5f5f5;
}

img {
    cursor: pointer;
}

.logo-wrapper img{
    width: auto;
    height: 3em;     
}

.logo-wrapper{
    padding: 3px;   
}
</style>