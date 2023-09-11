/**
 * Decodes the token and returns the payload
 * @param {string} token
 * @returns {{exp: number, uid: number}} payload 
 */
function decodeJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
}

function isTokenExpired(token) {
    return decodeJwt(token).exp < Date.now() / 1000;
}

export { decodeJwt, isTokenExpired };