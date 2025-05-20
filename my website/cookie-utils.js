// Cookie utility functions
function setCookie(name, value, days = 30) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
        let c = cookie;
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) === 0) {
            try {
                return JSON.parse(c.substring(cookieName.length, c.length));
            } catch (e) {
                return c.substring(cookieName.length, c.length);
            }
        }
    }
    return null;
}

function removeCookie(name) {
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
}

// Export the functions
export { setCookie, getCookie, removeCookie }; 