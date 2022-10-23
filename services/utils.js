function strip(string) {
    return string.replace(/^\s+|\s+$/g, '');
}

function inverseSortOrder(order) {
    if(order === 'desc')
        return 'asc';
    return 'desc';
}

function containsAnyLetters(string) {
    return /[a-zA-Z]/.test(string);
}

module.exports = {
    strip,
    inverseSortOrder,
    containsAnyLetters,
}