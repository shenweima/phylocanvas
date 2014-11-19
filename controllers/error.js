exports.createError = function(status) {
    var error = new Error();
    error.status = status;
    return error;
};