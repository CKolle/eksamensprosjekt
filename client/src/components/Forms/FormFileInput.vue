<script>
export default {
    name: "FormFileInput",
    props: {
        placeholderMsg: {
            type: String,
            required: true,
        },
        handler: {
            type: Function,
            required: false,
        },
        allowedFileTypes: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
    },
    methods: {
        handleUpload(event) {
            this.handler(event);
        },
    }
};

</script>
<template>
    <div class="upload-wrapper">
        <input type="file" :name="name" @change="handleUpload" :accept="allowedFileTypes">

        <p>{{ placeholderMsg }}</p>
    </div>
</template>

<style scoped>
.upload-wrapper {
    width: 150px;
    height: 150px;
    display: inline-flex;
    box-sizing: border-box;
    align-items: center;
    border: 1px dashed var(--secondary-color);
    text-align: center;
    vertical-align: top;
    color: var(--secondary-color);
}


input {
    cursor: pointer;
    opacity: 0;
    position: absolute;
    width: 150px;
    height: 150px;
}

p {
    margin: 0;
    padding: 0;
    width: 100%;
    font-size: 1.0rem;
    font-weight: 300;
    font-family: 'Inter', sans-serif;
}
</style>