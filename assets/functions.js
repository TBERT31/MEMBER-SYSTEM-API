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

exports.checkAndChange = (obj) => {
    if(this.isErr(obj)){
        return this.error(obj.message);
    }else{
        return this.success(obj);
    }
}