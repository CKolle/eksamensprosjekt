
<template>
  <div class="container">
    <div class="inner">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.container {

  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
}

.inner {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  max-width: 400px;
  padding: 40px;
  margin-top: 40px;
  text-align: center;
  background-color: #fff;
  border-radius: 5px;
}

@media only screen and (max-width: 600px) {
  .inner {
    max-width: 100vw;
    width: 100vw;
    min-height: 100vh;
    margin-top: 0;
  }
}
</style>