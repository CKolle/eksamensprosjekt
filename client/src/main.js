import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import SearchView from "./views/SearchView.vue";
import SettingsView from "./views/SettingsView.vue";
import ProfileSettings from "./views/Subviews/ProfileSettings.vue";
import AccountSettings from "./views/Subviews/AccountSettings.vue";
import LoginView from "./views/LoginView.vue";
import RegisterView from "./views/RegisterView.vue";
import NewPostView from "./views/NewPostView.vue";
import UserProfileView from "./views/UserProfileView.vue";
import UserProfileFollowers from "./views/Subviews/UserProfileFollowers.vue";
import UserProfilePosts from "./views/Subviews/UserProfilePosts.vue";
import UserProfileMedia from "./views/Subviews/UserProfileMedia.vue";
import UserProfileLikes from "./views/Subviews/UserProfileLikes.vue";
import UserProfileAbout from "./views/Subviews/UserProfileAbout.vue";
import HomeView from "./views/HomeView.vue";
import PostView from "./views/PostView.vue";
import { createRouter, createWebHistory } from "vue-router";
import store from "./store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    {
      path: "/settings",
      component: SettingsView,
      children: [
        { path: "", component: ProfileSettings },
        { path: "account", component: AccountSettings },
      ],
    },
    { path: "/search", component: SearchView },
    { path: "/new-post", component: NewPostView },
    {
      path: "/user/:uid",
      component: UserProfileView,
      children: [
        { path: "follows", component: UserProfileFollowers },
        { path: "media", component: UserProfileMedia },
        { path: "likes", component: UserProfileLikes },
        { path: "about", component: UserProfileAbout },
        { path: "", component: UserProfilePosts },
      ],
    },
    { path: "/post/:pid", component: PostView },
  ],
});

createApp(App).use(router).use(store).mount("#app");

export { router };
