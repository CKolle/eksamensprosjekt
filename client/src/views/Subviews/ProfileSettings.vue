<script>
import apiService from "../../services/apiService";
import FormFileInput from "../../components/Forms/FormFileInput.vue";
import TextareaField from "../../components/Forms/TextareaField.vue";
export default {
    name: "ProfileSettings",
    data() {
        return {
            about: this.$store.state.aboutMe,

        };
    },
    components: {
        FormFileInput,
        TextareaField,

    },
    methods: {
        async changeAvatar(event) {
            const file = event.target.files[0];
            try {
                const response = await apiService.updateProfilePicture(this.$store.state.uid, file);
                // Needs to wait a bit for the server to process.
                this.$store.commit("setProfilePicture", response.profile_picture);
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        async changeBanner(event) {
            const file = event.target.files[0];
            try {
                const response = await apiService.updateBannerPicture(this.$store.state.uid, file);
                // Needs to wait a bit for the server to process.
                this.$store.commit("setBannerPicture", response.banner_picture);
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        async updateAboutMe() {
            const userInfo = {
                about_me: this.about
            };
            try {
                const response = await apiService.updateUserInfo(this.$store.state.uid, userInfo);
                this.$store.commit("setAboutMe", response.about_me);
                this.$store.dispatch("addToast", {
                    message: "About me updated",
                    type: "success",
                });
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        validateAboutMe(about) {
            return about.length > 0 && about.length <= 200;
        }
    },
    computed: {
        profilePicture() {
            return `http://localhost:5000/images/users/${this.$store.state.profilePicture}`;
        },
        bannerPicture() {
            return `http://localhost:5000/images/users/${this.$store.state.bannerPicture}`;
        },
        letterCount() {
            return this.about.length;
        },
        aboutHasError() {
            return this.letterCount >= 200;
        },
        aboutIsInvalid() {
            return this.aboutHasError || this.about.length === 0;
        }
    },
};
</script>

<template>
    <h1>Profile settings</h1>
    <div class="container">
        <div class="section">
            <h2>About me</h2>
            <form @submit.prevent="updateAboutMe">
                <textarea-field v-model="about" :max-length="200" :placeholder="'Tell us about yourself'"
                    style="width: 100vw; max-width: 500px;" :validate-func="validateAboutMe" />
                <button type="submit" class="btn btn-primary" :disabled="aboutIsInvalid">Save</button>
            </form>

        </div>
        <div class="section">
            <h2>Avatar</h2>
            <form @submit.prevent="changeAvatar">
                <img :src="profilePicture" alt="profile" class="avtar-img" />
                <FormFileInput type="file" placeholder-msg="Click or drop here to change avatar" :handler="changeAvatar"
                    allowedFileTypes="image/gif, image/jpeg, image/png" />
            </form>
        </div>
        <div class="section">
            <h2>
                Profile banner
            </h2>
            <form @submit.prevent="changeBanner">
                <div class="banner-img" :style="{ backgroundImage: 'url(' + bannerPicture + ')' }"></div>
                <FormFileInput type="file" placeholder-msg="Click or drop here to change banner" :handler="changeBanner"
                    allowedFileTypes="image/jpeg, image/png" />

            </form>
        </div>
    </div>
</template>

<style scoped>
h1 {
    padding: 20px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
}

h2 {
    font-size: 1.25rem;
    font-weight: 400;
    font-family: 'Inter', sans-serif;
    border-bottom: 1px solid;
}

.avtar-img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    display: inline-block;
    border-radius: 20px;
    margin-right: 20px;
}

.banner-img {
    height: 150px;
    width: 100vw;
    max-width: 500px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 20px;
    margin-bottom: 20px;
    box-sizing: border-box;
}

input {
    cursor: pointer;
    opacity: 0;
    position: absolute;
    width: 150px;
    height: 150px;
}

button {
    margin-top: 10px;
    float: right;
    background-color: #2fabf0;
    border: none;
    color: white;
    padding: 7px 20px;
    text-align: center;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    cursor: pointer;
}

button:disabled {
    background-color: #bfbfbf;
    cursor: not-allowed;
}

button:hover:enabled {
    background-color: #2f8ed0;
}


.container {
    display: flex;
    flex-wrap: wrap;
    overflow: auto;



}

form {
    box-sizing: border-box;
}

.section {
    box-sizing: border-box;
    margin-bottom: 50px;
    padding: 20px;


}


@media only screen and (max-width: 600px) {
    .section {
        width: 100%;
    }

    .banner-img {
        width: 100%;
    }


}
</style>