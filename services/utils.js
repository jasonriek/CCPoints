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

function getDate()
{
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let date = new Date();
    return date.toLocaleTimeString("en-US", options);
}

module.exports = {
    strip,
    inverseSortOrder,
    containsAnyLetters,
    getDate,
}