
<script>
export default {
    name: "ToastNotifier",
    computed: {
        visible() {
            return this.$store.state.toastVisible;
        },
        message() {
            return this.$store.state.toastMessage;
        }
    }

};

</script>

<template>
    <div class="toast" :class="message.type" v-if="visible">
        <!--- Bootstrap icon exclamation circle-->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="bi bi-exclamation-circle" viewBox="0 0 16 16"
            fill="currentColor" v-if="message.type === 'error'">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path
                d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
        </svg>

        <!--- Bootstrap icon check circle-->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check"
            viewBox="0 0 16 16" v-if="message.type === 'success'">
            <path
                d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
        </svg>
        <p>{{ message.message }}
            <span class="close" @click="$store.commit('setToastHidden')">
                <i>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
                        viewBox="0 0 16 16">
                        <path
                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                    </svg>
                </i>
            </span>

        </p>
    </div>
</template>

<style scoped>
.toast {
    position: fixed;

    background-color: #fef0f1;
    top: 120px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    box-sizing: border-box;
    padding: 20px;
    display: flex;
    align-items: center;
    border-radius: 5px;
}

.toast svg {
    margin-right: 10px;
}

.error svg {
    color: red;
}

.success svg {
    color: #4caf50;
}


.toast p {
    margin: 0;
    padding: 0;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
    overflow-wrap: break-word;
}

.error {
    background-color: #fef0f1;
    border: 2px solid red;
}

.error p {
    color: red;
}

.success {
    background-color: #f0fef0;
    border: 2px solid #4caf50;
}

.success p {
    color: #4caf50;
}

.close {

    right: 10px;
    top: 10px;
    cursor: pointer;
}
</style>