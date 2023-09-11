<script>
export default {
  expose: ["blurHandler"],
  emits: ["update:modelValue", "onValidityChange"],
  data() {
    return {
      fieldHasError: false,
      fieldIsValid: false,
    };
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
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
    style: {
      type: String,
      required: false,
    },
  },
  methods: {
    blurHandler() {
      const isValid = this.validateFunc(this.modelValue);
      this.fieldIsValid = isValid;
      this.fieldHasError = !isValid;
      this.$emit("onValidityChange", isValid);
    },
    updateValue(event) {
      this.$emit("update:modelValue", event.target.value);
      const isValid = this.validateFunc(event.target.value);
      this.fieldIsValid = isValid;
      this.$emit("onValidityChange", isValid);

      if (this.fieldHasError) {
        this.fieldHasError = !isValid;
      }
    },


  },
  watch: {
    value(value) {
      this.hasError = !this.validateFunc(value);
    },
  },
};
</script>

<template>
  <input :type="type" :class="[{ error: fieldHasError }]" :placeholder="placeholder" :value="modelValue"
    @blur="blurHandler" @input="(event) => updateValue(event)" :style="style" />
  <p class="error-text" v-if="fieldHasError">{{ errorMessage }}</p>
</template>


<style scoped>
input {
  margin-top: 1rem;
  border: none;
  background-color: #f5f5f5;
  width: 100%;
  height: 38px;
  text-indent: 10px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  border-radius: 5px;
}

.error-text {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: start;
  width: 100%;
}

.error {
  border: 1px solid red;
}
</style>