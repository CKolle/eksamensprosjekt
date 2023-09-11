<script>
import apiService from "../services/apiService";
import CommentResult from "../components/CommentResult.vue";
import TextareaField from "../components/Forms/TextareaField.vue";
import validationService from "../services/validationService";
export default {
    name: "PostView",
    data() {
        return {
            post: null,
            loading: true,
            userProfilePicture: "",
            username: "",
            isLiked: false,
            date: "",
            newComment: "",
            newCommentIsValid: false,
            comments: [],
            showOptions: false,
            loadMoreTimeout: null,
        };
    },
    components: {
        CommentResult,
        TextareaField,
    },
    methods: {
        async fetchPost() {
            try {
                const response = await apiService.fetchPost(this.pid);
                this.post = response;
                this.date = new Date(response.created_at).toLocaleString();
                this.loading = false;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        async fetchUserInfo() {
            try {
                const response = await apiService.fetchUserInfo(this.post.uid);
                this.userProfilePicture = response.profile_picture;
                this.username = response.username;

            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        async likePost() {
            try {
                await apiService.likePost(this.$store.state.uid, this.pid);
                this.$store.dispatch("addToast", {
                    message: "Successfully liked post",
                    type: "success",
                });
                this.post.like_count++;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        async unlikePost() {
            try {
                await apiService.unlikePost(this.$store.state.uid, this.pid);
                this.$store.dispatch("addToast", {
                    message: "Successfully unliked post",
                    type: "success",
                });
                this.post.like_count--;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        async handleLike() {
            if (this.isLiked) {
                await this.unlikePost();
            }
            else {
                await this.likePost();
            }
            await this.fetchLikeStatus();
        },
        async handleDelete() {
            try {
                await apiService.deletePost(this.$store.state.uid, this.pid);
                this.$store.dispatch("addToast", {
                    message: "Successfully deleted post",
                    type: "success",
                });
                this.$router.push({ path: "/" });
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },

        handleOptions() {
            this.showOptions = !this.showOptions;
        },

        async fetchLikeStatus() {
            try {
                const response = await apiService.checkLike(this.$store.state.uid, this.pid);
                this.isLiked = response;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        async addComment() {

            if (!this.newCommentIsValid) {
                this.$store.dispatch("addToast", {
                    message: "Comment must be between 1 and 100 characters",
                    type: "error",
                });
                return;
            }
            try {
                const comment = {
                    "content": this.newComment,
                };
                const responseData = await apiService.addComment(this.$store.state.uid, this.pid, comment);
                this.$store.dispatch("addToast", {
                    message: "Successfully added comment",
                    type: "success",
                });
                this.post.comment_count++;
                this.newComment = "";
                this.comments.unshift(responseData);
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        async fetchComments() {
            try {
                const response = await apiService.fetchComments(this.pid);
                this.comments = response;
                this.loading = false;
            } catch (error) {
                this.$store.dispatch("addToast", {
                    message: error.message,
                    type: "error",
                });
            }
        },
        validateNewComment(comment) {
            return validationService.validateCommentContent(comment);
        },

        async loadMoreComments() {

            try {
                const response = await apiService.fetchComments(this.pid, 10, this.lastCommentId);
                this.comments.push(...response);

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
                this.loadMoreComments();
            }, 500);


        }

    },
    computed: {
        hasImage() {
            return this.post.image !== null;
        },
        postImage() {
            return "http://localhost:5000/images/posts/" + this.post.image;
        },
        pid() {
            return this.$route.params.pid;
        },
        profilePictureSrc() {
            return "http://localhost:5000/images/users/" + this.userProfilePicture;
        },
        likeButtonText() {
            if (this.isLiked) {
                return "Unlike";
            }
            else {
                return "Like";
            }
        },
        likeButtonClass() {
            if (this.isLiked) {
                return "liked";
            }
            else {
                return "";
            }
        },
        lastCommentId() {
            if (this.comments.length === 0) {
                return 0;
            }
            return this.comments[this.comments.length - 1].id;
        },


    },
    async mounted() {
        await this.fetchPost();
        await this.fetchUserInfo();
        await this.fetchLikeStatus();
        await this.fetchComments();
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
    <div class="container" v-if="!loading">
        <div class="inner">

            <div class="post">
                <div class="header">
                    <router-link :to="'/user/' + post.uid" :style="{ backgroundImage: `url(${profilePictureSrc})` }"
                        class="avatar" />
                    <router-link :to="'/user/' + post.uid" class="name">{{ username }}</router-link>
                    <div class="date">{{ this.date }}</div>
                    <div class="options">
                        <button class="more-options" @click="handleOptions" v-if="post.uid === $store.state.uid">
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-three-dots" viewBox="0 0 16 16">
                                    <path
                                        d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                </svg>
                            </i>
                        </button>

                        <div class="options-actions" v-if="showOptions">
                            <button class="delete" @click="handleDelete">Delete</button>
                        </div>
                    </div>

                </div>
                <h1 class="title"> {{ post.title }}</h1>
                <div class="body">

                    <p>{{ post.content }}</p>
                    <div class="preview-image-wrapper">

                        <img :src="postImage" class="preview-image" v-if="hasImage" />
                    </div>

                </div>

                <div class="footer">

                    <button class="like-button" :class="likeButtonClass" @click="handleLike">
                        {{ post.like_count }}<i>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                                <path
                                    d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a9.84 9.84 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733.058.119.103.242.138.363.077.27.113.567.113.856 0 .289-.036.586-.113.856-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.163 3.163 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.82 4.82 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
                            </svg>
                        </i>{{ likeButtonText }}</button>
                </div>

            </div>


            <h2>Comments {{ post.comment_count }}</h2>

            <div class="comments">

                <form class="new-comment" @submit.prevent="addComment">
                    <label for="new-comment">New comment</label>
                    <div class="textarea-wrapper">
                        <textarea-field placeholder="Write your post here..." id="new-comment" v-model="newComment"
                            :validateFunc="validateNewComment" @onValidityChange="newCommentIsValid = $event"
                            :max-length="100" error-message="Content must be between 1 and 100 characters" />
                    </div>
                    <button type="submit" @click.prevent="addComment">Comment</button>
                </form>
                <div class="results">
                    <comment-result v-for="comment in comments" :key="comment.id" :comment="comment" />

                </div>


            </div>
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

    display: flex;
    flex-direction: column;
}

.post {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 20px;
    background-color: var(--primary-color);
    border-radius: 10px;

}

.footer {
    width: 100%;
    height: 20px;
    border-radius: 10px;
    margin-top: 10px;
    text-align: right;
}

.like-button {
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    padding: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer
}

.like-button:hover {
    background-color: #0069d9;
}

.liked {
    background-color: #dc3545;
}

.liked:hover {
    background-color: #c82333;
}

.header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
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

.comments {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 20px;
    background-color: var(--primary-color);
    border-radius: 10px;
}

.new-comment {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.textarea-wrapper {
    width: 100%;
    margin-bottom: 20px;
}

textarea {
    width: 100%;
    height: 100px;
    border: none;
    outline: none;
    padding-top: 10px;
    padding-left: 20px;
    box-sizing: border-box;

    font-weight: 500;
    background-color: #f5f5f5;
    border-radius: 10px;
    resize: vertical;
    display: block;
    color: #000;
}

.new-comment button {
    width: 400px;
    background-color: var(--secondary-color);
    border: none;
    border-radius: 5px;
    padding: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

.new-comment button:hover {
    background-color: #2f8ed0;
}

.preview-image-wrapper {
    width: 100%;
    display: inline-block;
}

.preview-image-wrapper img {
    width: 100%;
    height: 100%;
    max-width: 400px;
    max-height: 400px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid var(--secondary-color);
}

p {
    overflow-wrap: break-word;
}

.date {
    color: #788197;
    font-size: 12px;
    margin-left: 10px;
}

.more-options {
    background-color: var(--secondary-color);
    border: none;
    border-radius: 5px;
    padding: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    width: 30px;
}

.more-options svg {
    width: 20px;
    height: 20px;
    fill: white;
    vertical-align: middle;
}



.options-actions {
    position: absolute;
    background-color: #f5f5f5;
    border-radius: 10px;
    padding: 10px;
    top: 40px;
    right: 0;
    box-sizing: border-box;
}

.options-actions button {
    width: 100%;
    background-color: var(--secondary-color);
    border: none;
    border-radius: 5px;
    padding: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

.options-actions button:hover {
    background-color: #2f8ed0;
}

.options-actions .delete {
    background-color: #dc3545;
}

.options-actions .delete:hover {
    background-color: #c82333;
}



.options {
    margin-left: auto;
    position: relative;
}

@media only screen and (max-width: 600px) {
    .inner {
        flex-direction: column;
        max-width: 100vw;
        width: 100vw;
        min-height: 100vh;
        margin-top: 0;
        background-color: var(--primary-color);
    }

    .new-comment button {
        width: 100%;
    }
}
</style>
