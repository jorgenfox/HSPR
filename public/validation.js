export function validateName(name) {
    const forbiddenChars = /[;:?=\[\]{}<>'"\/\\!@#$%^&*()_+`|~0-9]/;
    return name && !forbiddenChars.test(name);
}

export function capitalizeName(name) {
    // Match the first character of the string and any character after a space, apostrophe, or hyphen.
    return name.replace(/(^|\s|[-'’])\S/g, char => char.toUpperCase());
}

export function checkInput(value) {
    return value > 0 && value <= 120;
}