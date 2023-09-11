import store from "../store";
import authService from "./authService";

class ApiServiceError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = "ApiServiceError";
    }
}


const fetchOperations = {
    baseUrl: "/api",
    async handleResponse(response) {
        if (!response.ok) {
            if (response.status === 401) {
                authService.logout();
                throw new ApiServiceError("Unauthorized", response.status);
            }
            throw new ApiServiceError( await response.text() || "Bad response from the server", response.status);
        }
        if (response.status === 204) {
            return null;
        }
        const responseData = await response.json();
        return responseData;
    },
    async get(endpoint) {
        try {
            authService.isAuthenticated();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${store.state.token}`,
                }
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error instanceof ApiServiceError) {
                throw error;
            }
            throw new Error("Failed to fetch data.");
        }
    },

    async post(endpoint, data) {
        try {
            authService.isAuthenticated();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${store.state.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error instanceof ApiServiceError) {
                throw error;
            }
            throw new Error("Failed to post data.");
        }
    },

    async put(endpoint, data) {
        try {
            authService.isAuthenticated();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${store.state.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error instanceof ApiServiceError) {
                throw error;
            }
            throw new Error("Failed to put data.");
        }
    },

    async delete(endpoint) {
        try {
            authService.isAuthenticated();
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${store.state.token}`,
                    "Content-Type": "application/json",
                },
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error instanceof ApiServiceError) {
                throw error;
            }
            throw new Error("Failed to delete data.");
        }
    },
};

/**
 * @typedef {Object} User
 * @property {int} id
 * @property {string} profile_picture
 * @property {string} banner_picture
 * @property {string} username
 * @property {string} about_me
 */

/**
 * @typedef {Object} Post
 * @property {int} id
 * @property {int} uid
 * @property {string|null} image
 * @property {int} like_count
 * @property {int} comment_count
 * @property {string} content
 * @property {string} created_at
 **/

/**
 * @typedef {Object} NewPost
 * @property {string|null} image
 * @property {string} content
 * @property {string} title
 */

/**
 * @typedef {Object} Comment
 * @property {int} id
 * @property {int} uid
 * @property {int} pid
 * @property {string} content
 */

/**
 * @typedef {Object} Follow
 * @property {int} id
 * @property {string} profile_picture
 * @property {string} username
 */

const apiService = {
    /**
     * Get user info from server if not in cache
     * @param {string} uid
     * @returns {Promise<User>} user info
     * @throws {Error} failed to fetch user info
     */
    async fetchUserInfo(uid) {
        // Check the cache first
        const cachedUser = store.state.userCache[uid];
        if (cachedUser) {
            return cachedUser;
        }

        const user = await fetchOperations.get(`/users/${uid}`);
        store.commit("addUserToCache", user);
        return user;
    },
    /**
     * Fetch users from server
     * @param {int} pageSize The number of users to fetch
     * @param {int} lastUserId The id of the last user fetched
     * @param {string} query Search query
     * @returns {Promise<User[]>} Array of users
     * @throws {Error} failed to fetch users
     */
    async fetchUsers(pageSize, lastUserId=null, query=null) {

        let endpoint = `/users?page_size=${pageSize}`;
        if (lastUserId !== null) {
            endpoint += `&last_id=${lastUserId}`;
        }
        if (query !== null) {
            endpoint += `&query=${query}`;
        }

        return await fetchOperations.get(endpoint);
    },

    /**
     * Fetch posts from server
     * @param {int} pageSize The number of posts to fetch
     * @param {int} lastPostId The id of the last post fetched
     * @param {string} query Search query
     * @param {int} likedBy Filter posts by user id that liked the post
     * @returns {Promise<Post[]>} Array of posts
     * @throws {Error} failed to fetch posts
     */
    async fetchPosts(pageSize, lastPostId=null, query=null, likedBy=null) {

        let endpoint = `/posts?page_size=${pageSize}`;
        if (lastPostId !== null) {
            endpoint += `&last_id=${lastPostId}`;
        }
        if (query !== null) {
            endpoint += `&query=${query}`;
        }
        if (likedBy !== null) {
            endpoint += `&liked_by=${likedBy}`;
        }

        return await fetchOperations.get(endpoint);

    },
    /**
     * Fetch post from server
     * @param {string|int} pid The id of the post to fetch
     * @returns {Promise<Post>} Post
     * @throws {Error} failed to fetch post
     */
    async fetchPost(pid) {
        return await fetchOperations.get(`/posts/${pid}`);
    },
    /**
     * Fetch comments from server
     * @param {string|int} pid The id of the post to fetch comments from
     * @param {int} pageSize The number of comments to fetch
     * @param {int} lastCommentId The id of the last comment fetched
     * @returns {Promise<Comment[]>} Array of comments
     */
    async fetchUserFeedPosts(uid, pageSize, lastPostId=null) {
        let endpoint = `/users/${uid}/posts/feed?page_size=${pageSize}`;
        if (lastPostId !== null) {
            endpoint += `&last_id=${lastPostId}`;
        }
        return await fetchOperations.get(endpoint);
    },
    /**
     * Fetch the user's posts from server
     * @param {string|int} uid The id of the user to fetch posts from
     * @param {int} pageSize The number of posts to fetch
     * @param {int} lastPostId The id of the last post fetched
     * @param {boolean} hasImage Filter posts by whether they have an image
     * @returns {Promise<Post[]>} Array of posts
     * @throws {Error} failed to fetch posts
     */
    async fetchUserPosts(uid, pageSize, lastPostId=null, hasImage=null, descending=true){
        let endpoint = `/users/${uid}/posts?page_size=${pageSize}&descending=${descending}`;
        if (lastPostId !== null) {
            endpoint += `&last_id=${lastPostId}`;
        }
        if (hasImage !== null) {
            endpoint += `&has_image=${hasImage}`;
        }
        return await fetchOperations.get(endpoint);
    },
    /**
     * Update user profile picture
     * @param {string|int} uid The id of the user to update
     * @param {File} profilePicture The new profile picture
     * @returns {Promise<{profile_picture: string}>} The new profile picture name
     * @throws {Error} failed to update profile picture
     */
    async updateProfilePicture(uid, profilePicture) {
        try {
            const fromData = new FormData();
            fromData.append("image", profilePicture);
            const response = await fetch(`/api/users/${uid}/profile-picture`, {
                method: "PUT",
                body: fromData,
                headers: {
                    "Authorization": `Bearer ${store.state.token}`
                }

            });
            if (!response.ok) {
                throw new Error("Failed to update profile picture. Bad response from server.");
            }
            const responseData = await response.json();
            return responseData;
        }
        catch (error) {
            throw new Error("Failed to update profile picture.");
        }
    },
    /**
     * Update user banner picture
     * @param {string|int} uid 
     * @param {File} bannerPicture 
     * @returns {Promise<{banner_picture: string}>} The new banner picture name
     * @throws {Error} failed to update banner picture
     */
    async updateBannerPicture(uid, bannerPicture) {
        try {
            const formData = new FormData();
            formData.append("image", bannerPicture);
            const response = await fetch(`/api/users/${uid}/banner-picture`, {
                method: "PUT",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${store.state.token}`
                }
            });

            if (response.status === 400) {
                throw new Error("Failed to update banner picture. Bad request.");
            }

            if (!response.ok) {
                throw new Error("Failed to update banner picture. Bad response from server.");
            }
            const responseData = await response.json();
            return responseData;

        } catch(error) {
            throw new Error(error.message || "Failed to update banner picture.");

        }
    },
    /**
     * Update user info
     * @param {string|int} uid The id of the user to update
     * @param {Object} userInfo The new user info
     * @returns {Promise<Object>} The new user info
     * @throws {Error} failed to update user info
     */
    async updateUserInfo(uid, userInfo) {
        try {
            const response = await fetch(`/api/users/${uid}`, {
                method: "PUT",
                body: JSON.stringify(userInfo),
                headers: {
                    "Authorization": `Bearer ${store.state.token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(await response.text() || "Failed to update user info. Bad response from server.");
            }
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            throw new Error(error.message || "Failed to update user info.");
        }
    },

    /**
     * Create new post
     * @param {string|int} uid The id of the user to create post for
     * @param {NewPost} post The new post
     * @returns {Promise<Post>} The new post
     * @throws {Error} failed to create new post
     */
    async newPost(uid, post) {
        try {
            const requestForm = new FormData();
            requestForm.append("image", post.image);
            requestForm.append("content", post.content);
            requestForm.append("title", post.title);
            const response = await fetch(`/api/users/${uid}/posts`, {
                method: "POST",
                body: requestForm,
                headers: {
                    "Authorization": `Bearer ${store.state.token}`
                }
            });
            if (!response.ok) {
                throw new Error(await response.text() || "Failed to create new post. Bad response from server.");
            }
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            throw new Error(error.message || "Failed to create new post.");
        }
    },
    /**
     * Delete post
     * @param {string|int} uid The id of the user to delete post for
     * @param {string|int} pid The id of the post to delete
     * @returns {Promise<void>}
     * @throws {Error} failed to delete post
     */
    async deletePost(uid, pid) {
        await fetchOperations.delete(`/users/${uid}/posts/${pid}`);
        return;
    },
    /**
     * Follow user
     * @param {string|int} uid The id of the user to follow
     * @param {string|int} followedUid The id of the user to be followed
     * @returns {Promise<string>} Success message
     * @throws {Error} failed to follow user
     */
    async followUser(uid, followedUid) {
        await fetchOperations.post(`/users/${uid}/follows/${followedUid}`);
        return "Followed user successfully.";
    },

    /**
     * Check if user is following another user
     * @param {string|int} uid The id of the user to check
     * @param {string|int} followedUid The id of the user to be checked
     * @returns {Promise<boolean>} True if user is following another user, false otherwise
     * @throws {Error} failed to check follow
     */
    async checkFollow(uid, followedUid) {

        const response = await fetchOperations.get(`/users/${uid}/follows/${followedUid}`);
        return response.is_following;
    },
    /**
     * Unfollow user
     * @param {string|int} uid The id of the user to unfollow
     * @param {string|int} followedUid The id of the user to be unfollowed
     * @returns {Promise<void>}
     * @throws {Error} failed to unfollow user
     */
    async unfollowUser(uid, followedUid) {
        await fetchOperations.delete(`/users/${uid}/follows/${followedUid}`);
        return;
    },
    /**
     * Get user's followers
     * @param {string|int} uid The id of the user to get followers for
     * @param {string|int} lastFollowId The id of the last follow to get
     * @returns {Promise<Follow[]>} The user's followers
     * @throws {Error} failed to get followers
     */
    async getFollowing(uid, lastFollowId = null) {
        let endpoint = `/users/${uid}/follows`;
        if (lastFollowId !== null) {
            endpoint += `?last_follow_id=${lastFollowId}`;
        }
        return await fetchOperations.get(endpoint);
    },
    /**
     * Like post
     * @param {string|int} uid The id of the user to like post for
     * @param {string|int} pid The id of the post to like
     * @returns {Promise<void>}
     * @throws {Error} failed to like post
     */
    async likePost(uid, postId) {
        await fetchOperations.post(`/users/${uid}/posts/${postId}/likes`);
        return; 
    },
    /**
     * Unlike post
     * @param {string|int} uid The id of the user to unlike post for
     * @param {string|int} pid The id of the post to unlike
     * @returns {Promise<void>}
     * @throws {Error} failed to unlike post
     */
    async unlikePost(uid, postId) {
        await fetchOperations.delete(`/users/${uid}/posts/${postId}/likes`);
        return;
    },
    /**
     * Check if user has liked a post
     * @param {string|int} uid The id of the user to check
     * @param {string|int} pid The id of the post to be checked
     * @returns {Promise<boolean>} True if user has liked post, false otherwise
     * @throws {Error} failed to check like
     */
    async checkLike(uid, postId) {

        const response = await fetchOperations.get(`/users/${uid}/posts/${postId}/likes`);
        return response.is_liked;
    },

    /**
     * Calls the API to add a comment to a post
     * @param {string|int} uid The id of the user to add comment for
     * @param {string|int} pid The id of the post to add comment to
     * @param {string} comment The comment to add
     * @returns {Promise<void>}
     * @throws {Error} failed to add comment
     */
    async addComment(uid, postId, comment) {
        return await fetchOperations.post(`/users/${uid}/posts/${postId}/comments`, comment);
    },
    /**
     * Calls the API to fetch comments for a post
     * @param {string|int} postId The id of the post to fetch comments for
     * @param {int} pageSize The number of comments to fetch
     * @param {string|int} lastId The id of the last comment to fetch
     * @returns {Promise<Comment[]>} The comments for the post
     */
    async fetchComments(postId, pageSize = 10, lastId = null) {
        let responseUrl = `/posts/${postId}/comments?page_size=${pageSize}`;
        if (lastId !== null) {
            responseUrl += `&last_id=${lastId}`;
        }
        return await fetchOperations.get(responseUrl);
    },
    /**
     * Calls the API to delete the user's account
     * @param {string|int} uid The id of the user to delete
     * @returns {Promise<void>}
     * @throws {Error} failed to delete account
     */
    async deleteAccount(uid) {
        await fetchOperations.delete(`/users/${uid}`);
    },


};

export default apiService;
export { ApiServiceError }; 