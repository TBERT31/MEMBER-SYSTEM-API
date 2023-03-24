require("babel-register");
const express = require("express");
const morgan = require("morgan");
const app = express();

const members = [
    {
        id: 1,
        name: 'John'
    },
    {
        id: 2,
        name: 'Julie'
    },
    {
        id: 3,
        name: 'Jack'
    },
];

app.use(morgan('dev'));

app.get("/api/v1/members/:id", (req, res) => {
    res.json(success(members[(req.params.id) - 1]));
})

app.get('/api/v1/members', (req, res) => {
    if(req.query.max != undefined && req.query.max > 0){
        res.json(success(members.slice(0,req.query.max)));
    }else if(req.query.max != undefined){
        res.json(error('Wrong max value'));
    }else{
        res.json(success(members));
    }
})

app.listen(8080, () => console.log('Started on port 8080'));

function success(result){
    return{
        status: 'success',
        result: result,
    }
}

function error(message){
    return{
        status: 'error',
        result: message,
    }
}