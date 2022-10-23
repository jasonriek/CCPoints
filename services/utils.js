function strip(string) {
    return string.replace(/^\s+|\s+$/g, '');
}

function inverseSortOrder(order)
{
    if(order === 'desc')
        return 'asc';
    return 'desc';
}

module.exports = {
    strip,
    inverseSortOrder,
}