import { createStore } from "vuex";


const store = createStore({
    state() {
        return {
            token: null,
            uid: null,
            username: null,
            isLoggedIn: false,
            profilePicture: null,
            bannerPicture: null,
            toastVisible: false,
            toastMessage: null,
            aboutMe: null,
            userCache: {},
        };
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
        setUid(state, uid) {
            state.uid = uid;
        },
        setUsername(state, username) {
            state.username = username;
        },
        setIsLoggedIn(state, isLoggedIn) {
            state.isLoggedIn = isLoggedIn;
        },
        setProfilePicture(state, profilePicture) {
            state.profilePicture = profilePicture;
        },
        setBannerPicture(state, bannerPicture) {
            state.bannerPicture = bannerPicture;
        },
        setToastHidden(state) {
            state.toastVisible = false;
        },
        setToastMessage(state, message) {
            state.toastMessage = message;
            state.toastVisible = true;
        },
        setAboutMe(state, aboutMe) {
            state.aboutMe = aboutMe;
        },
        addUserToCache(state, user) {
            state.userCache[user.id] = user;
        },
        flushUserCache(state) {
            state.userCache = {};
        },
    },
    actions: {
        setToken({ commit }, token) {
            commit("setToken", token);
        },
        setUid({ commit }, uid) {
            commit("setUid", uid);
        },
        setUsername({ commit }, username) {
            commit("setUsername", username);
        },
        setIsLoggedIn({ commit }, isLogin) {
            commit("setIsLoggedIn", isLogin);
        },
        addToast({ commit }, message) {
            commit("setToastMessage", message);

            setTimeout(() => {
                commit("setToastHidden");
            }, 6000);
        },
        flushUserCache({ commit }) {
            commit("flushUserCache");
        }

    },
});

export default store;