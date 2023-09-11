function validateGeneriLength(value, min, max) {
    if (!value) {
        return false;
    }
    if (value.length < min || value.length > max) {
        return false;
    }
    return true;
}


const validationService = {
    /**
     * Validate username
     * @param {string} username
     * @returns {boolean} true if username is valid
     */
    validateUsername(username) {
        if (!username) {
            return false;
        }
        if (/\s/.test(username)) {
            return false;
        }

        return validateGeneriLength(username, 3, 50);
    },
    /**
     * Validate email
     * @param {string} email
     * @returns {boolean} true if email is valid
     */
    validateEmail(email) {
        const re = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$";
        if (!email.match(re)) {
            return false;
        }
        return true;
    },
    /**
     * Validate password
     * @param {string} password
     * @returns {boolean} true if password is valid
     */
    validatePassword(password) {
        return validateGeneriLength(password, 8, 128);
    },
    /**
     * Validate post content
     * @param {string} content 
     * @returns 
     */
    validatePostContent(content) {
        return validateGeneriLength(content, 1, 200);
    },
    /**
     * Validate post title
     * @param {string} title
     * @returns {boolean} true if title is valid
     */
    validatePostTitle(title) {
        return validateGeneriLength(title, 1, 50);
    },
    /**
     * Validate comment content
     * @param {string} content
     * @returns {boolean} true if content is valid
     */
    validateCommentContent(content) {
        if (content.trim() == "") {
            return false;
        }
        return validateGeneriLength(content, 1, 100);
    }
};

export default validationService;

