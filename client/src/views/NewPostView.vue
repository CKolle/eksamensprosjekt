<script>
import apiService from "../services/apiService";
import FormFileInput from "../components/Forms/FormFileInput.vue";
import TextareaField from "../components/Forms/TextareaField.vue";
import validationService from "../services/validationService";

export default {
    name: "NewPostView",
    data() {
        return {
            title: "",
            content: "",
            imageSrc: null,
            image: null,
            titleIsValid: false,
            bodyIsValid: false,

        };
    },
    components: {
        FormFileInput,
        TextareaField,
    },
    methods: {
        async submit() {
            const post = {
                title: this.title,
                content: this.content,
                image: this.image,
            };

            if (!this.titleIsValid) {
                this.$store.dispatch("addToast", {
                    message: "Title is invalid, must be between 1 and 50 characters",
                    type: "error",
                });
                return;
            }

            if (!this.bodyIsValid) {
                this.$store.dispatch("addToast", {
                    message: "Content is invalid, must be between 1 and 200 characters",
                    type: "error",
                });
                return;
            }

            try {
                const response = await apiService.newPost(this.$store.state.uid, post);
                this.$store.dispatch("addToast", {
                    message: "Post uploaded",
                    type: "success",
                });

                this.$router.push(`/post/${response.id}`);


            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        handleTitleChange() {
            this.titleIsValid = validationService.validatePostTitle(this.title);
        },

        handleImageChange(event) {
            const file = event.target.files[0];
            this.imageSrc = URL.createObjectURL(file);
            this.image = file;
        },
        validatePostContent(content) {
            return validationService.validatePostContent(content);
        },
    },
};
</script>

<template>
    <div class="container">
        <div class="inner">
            <h1>New post</h1>

            <form class="form-wrapper" @submit.prevent="submit" enctype="multipart/form-data">
                <label for="title">Title</label>
                <div class="title-wrapper">
                    <input type="text" placeholder="Title" v-model="this.title" name="title" id="title" maxlength="50"
                        @change="handleTitleChange">
                </div>
                <label for="body">Content</label>
                <div class="body-wrapper">
                    <textarea-field placeholder="Write your post here..." name="body" id="body" v-model="this.content"
                        :validateFunc="validatePostContent" @onValidityChange="bodyIsValid = $event" :max-length="200"
                        error-message="Content must be between 1 and 200 characters" />

                </div>
                <div class="image-file-wrapper">
                    <form-file-input placeholderMsg="Click or drag to include an image" name="image"
                        :handler="handleImageChange" allowedFileTypes="image/jpeg, image/png" />
                    <div class="image-preview-wrapper" v-if="imageSrc">
                        <img :src="imageSrc" alt="Image preview">

                    </div>

                </div>

                <div class="button-wrapper">
                    <button type="submit">Upload</button>
                </div>
            </form>
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
    margin-top: 20px;
    background-color: var(--primary-color);
    border-radius: 10px;

}

h1 {
    padding-left: 20px;
    width: 100%;
    box-sizing: border-box;
}

.title-wrapper {
    width: 100%;
    height: 50px;
    margin-bottom: 20px;
}

input {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    padding-left: 20px;
    box-sizing: border-box;
    font-size: 1.2rem;
    font-weight: 500;
    background-color: #f5f5f5;
    border-radius: 10px;

}

.form-wrapper {
    padding: 20px;
    margin-bottom: 20px;
    width: 70%;
    box-sizing: border-box;
}

.body-wrapper {
    width: 100%;
    margin-bottom: 20px;
}



.button-wrapper {
    width: 100%;
    height: 50px;
}

.button-wrapper button {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background-color: var(--secondary-color);
    color: #fff;
    font-weight: bold;
    font-size: 1rem;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 20px;

}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--secondary-color);
}

.image-preview-wrapper {
    width: 80%;
    margin-left: 20px;
    display: inline-block;
}



.button-wrapper button:hover {
    background-color: #2f9be3;
}



@media screen and (max-width: 768px) {
    .inner {
        width: 100vw;
        height: 100vh;
        margin-top: 0;
        background-color: var(--primary-color);
        border-radius: 0;
    }

    .form-wrapper {
        padding: 20px;
        width: 100%;
    }
}
</style>
