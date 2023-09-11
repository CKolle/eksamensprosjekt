<script>
import NavigationHamburger from "./NavigationHamburger.vue";
import NavigationBar from "./NavigationBar.vue";
export default {
    name: "NavigationMenu",
    components: {
        NavigationBar,
        NavigationHamburger,
    },
    data() {
        return {
            windowSize: {
                width: 0,
                height: 0
            }
        };
    },
    created() {
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    methods: {
        handleResize() {
            this.windowSize.width = window.innerWidth;
            this.windowSize.height = window.innerHeight;
        }
    },
    computed: {
        isCollapsed() {
            return this.windowSize.width <= 800;
        }
    }
};

</script>

<template>
    <NavigationBar v-if="!isCollapsed" />
    <NavigationHamburger v-if="isCollapsed" />
</template>