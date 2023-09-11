<script>
export default {
    name: "TextareaField",
    expose: ["blurHandler"],
    emits: ["update:modelValue", "onValidityChange"],
    inheritAttrs: false,
    data() {
        return {
            fieldHasError: false,
        };
    },
    props: {
        modelValue: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: true,
        },
        maxLength: {
            type: Number,
            required: true,
        },
        validateFunc: {
            type: Function,
            required: true,
        },
        errorMessage: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        id: {
            type: String,
            required: false,
        },
        style: {
            type: String,
            required: false,
        },
    },
    methods: {
        blurHandler(event) {
            // Uses the event because computed properties may be out of sync
            const isValid = this.validateFunc(event.target.value);
            this.fieldHasError = !isValid;
            this.$emit("onValidityChange", isValid);
        },
        updateValue(event) {
            const isValid = this.validateFunc(event.target.value);
            this.$emit("update:modelValue", event.target.value);
            this.$emit("onValidityChange", isValid);
            if (this.fieldHasError) {
                this.fieldHasError = !this.validateFunc(event.target.value);
            }
        },
    },
    computed: {
        letterCount() {
            return this.modelValue.length;
        },

    }



};

</script>

<template>
    <div class="text-area" :style="style">
        <textarea :name="name" :id="id" :placeholder="placeholder" :value="modelValue"
            :class="{ error: this.fieldHasError }" @blur="blurHandler" @input="(event) => updateValue(event)"></textarea>
        <p class="letter-count">{{ letterCount }}/{{ maxLength }}</p>
    </div>
    <p class="error-text" v-if="this.fieldHasError && errorMessage">{{ errorMessage }}</p>
</template>


<style scoped>
.error {
    border: 1px solid red;
}

.letter-count {
    position: absolute;
    bottom: 5px;
    right: 20px;
    font-size: 0.8rem;
    font-weight: 400;
}

.error-text {
    color: red;
    font-size: 0.8rem;
    text-align: start;
}

textarea {
    width: 100%;
    height: 150px;
    border: none;
    border-radius: 5px;
    padding: 10px;
    box-sizing: border-box;
    resize: vertical;
    background-color: #f5f5f5;

}

.text-area {
    position: relative;
    box-sizing: border-box;

}

@media only screen and (max-width: 600px) {
    .text-area {
        width: 100% !important;
    }


}
</style>