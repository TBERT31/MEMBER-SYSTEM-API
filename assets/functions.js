exports.success = function success(result){
    return{
        status: 'success',
        result: result,
    }
};

exports.error = function error(message){
    return{
        status: 'error',
        result: message,
    }
};

exports.isErr = (err) => {
    return err instanceof Error;
}