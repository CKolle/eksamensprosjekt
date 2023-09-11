import { decodeJwt } from "../utils/jwt_helper";
import store from "../store";
import apiService from "./apiService";
import { router } from "../main";

const authService = {
    /**
     * Login user
     * @param {string} username
     * @param {string} password
     * @returns {Promise<void>}
     * @throws {Error} failed to login
     **/
    async login(username, password) {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                }),
            });
            if (response.status === 401) {
                throw new Error("Login failed. Please check your username and password.");
            }
            if (!response.ok) {
                throw new Error("Failed to login. Bad response from server.");
            }
            const responseData = await response.json();
            await this.authenticateByToken(responseData.access_token);
        }
        catch (error) {
            throw new Error(error.message || "Failed to login.");
        }
    },
    /**
     * Logout user
     * @returns {void}
     */
    logout() {
        localStorage.removeItem("web_app");
        localStorage.removeItem("userProfilePostsSort");
        store.commit("setToken", null);
        store.commit("setUid", null);
        store.commit("setUsername", null);
        store.commit("setIsLoggedIn", false);
        store.commit("setProfilePicture", null);
        store.commit("setBannerPicture", null);
        store.commit("setAboutMe", null);
        router.push("/login");

    },
    /**
     * Authenticate user by local storage
     * @returns {Promise<void>}
     * @throws {Error} failed to authenticate
     */
    async authenticateByStorage() {
        const storage_content = JSON.parse(localStorage.getItem("web_app"));
        if (!storage_content) {
            throw new Error("No storage content.");
        }
        const { token } = storage_content;
        try {
            await this.authenticateByToken(token);
        } catch (error) {
            localStorage.removeItem("web_app");
            throw error;
        }
    },
    /**
     * Authenticate user by token
     * @returns {Promise<void>}
     * @throws {Error} failed to authenticate
     * @throws {Error} token expired
     */
    async authenticateByToken(token) {
        const decodedToken = decodeJwt(token);
        const exp = decodedToken.exp;
        const uid = decodedToken.uid;
        const now = Date.now() / 1000;
        if (exp < now) {
            this.logout();
            throw new Error("Token expired.");
        }
        try {
            const userInfo = await apiService.fetchUserInfo(uid);
            const storage_content = {
                token: token,
                uid: uid
            };
            localStorage.setItem("web_app", JSON.stringify(storage_content));
            store.commit("setToken", token);
            store.commit("setUid", uid);
            store.commit("setUsername", userInfo.username);
            store.commit("setIsLoggedIn", true);
            store.commit("setProfilePicture", userInfo.profile_picture);
            store.commit("setBannerPicture", userInfo.banner_picture);
            store.commit("setAboutMe", userInfo.about_me);
        } catch (error) {
            localStorage.removeItem("web_app");
            throw error; // throw new Error if failed to retrieve user info
        }
    },
    /**
     * Register user
     * @param {string} username
     * @param {string} password
     * @param {string} email
     * @returns {Promise<void>}
     * @throws {Error} failed to register
     */
    async register(username, password, email) {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    email
                }),
            });
            if (!response.ok) {
                throw new Error(await response.text() || "Failed to register.");
            }
            const responseData = await response.json();
            await this.authenticateByToken(responseData.access_token);
        } catch (error) {
            throw new Error(error.message || "Failed to register.");
        }

    },
    /**
     * Check if user is authenticated
     * @returns {boolean}
     * @throws {Error} failed to check authentication
     * @throws {Error} token expired
     */
    isAuthenticated() {
        const token = store.state.token;
        if (!token) {
            return false;
        }
        const decodedToken = decodeJwt(token);
        const exp = decodedToken.exp;
        const now = Date.now() / 1000;
        if (exp < now) {
            this.logout();
            throw new Error("Token expired.");
        }
        return true;
    }
};

export default authService;