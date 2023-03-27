require('babel-register');
const {success, error, isErr} = require('./assets/functions');
const mysql = require('promise-mysql');
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan')('dev');
const config = require('./assets/config');

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected.')

    const app = express()

    let MembersRouter = express.Router()
    let Members = require("./assets/classes/members-class")(db, config);
    console.log(Members);

    app.use(morgan)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    MembersRouter.route('/:id')

        // Récupère un membre avec son ID
        .get(async (req, res) => {
            let member = await Members.getByID(req.params.id);
            res.json(isErr(member) ? error(member.message) : success(member));
        })

        // Modifie un membre avec ID
        .put((req, res) => {

            if (req.body.name) {

                db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {

                        if (result[0] != undefined) {

                            db.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                                if (err) {
                                    res.json(error(err.message))
                                } else {

                                    if (result[0] != undefined) {
                                        res.json(error('same name'))
                                    } else {

                                        db.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                                            if (err) {
                                                res.json(error(err.message))
                                            } else {
                                                res.json(success(true))
                                            }
                                        })

                                    }

                                }
                            })

                        } else {
                            res.json(error('Wrong id'))
                        }

                    }
                })

            } else {
                res.json(error('no name value'))
            }

        })

        // Supprime un membre avec ID
        .delete((req, res) => {

            db.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {

                    if (result[0] != undefined) {

                        db.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, result) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {
                                res.json(success(true))
                            }
                        })

                    } else {
                        res.json(error('Wrong id'))
                    }

                }
            })

        })

    MembersRouter.route('/')

        // Récupère tous les membres
        .get((req, res) => {
            if (req.query.max != undefined && req.query.max > 0) {

                db.query('SELECT * FROM members LIMIT 0, ?', [req.query.max], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {
                        res.json(success(result))
                    }
                })

            } else if (req.query.max != undefined) {
                res.json(error('Wrong max value'))
            } else {

                db.query('SELECT * FROM members', (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {
                        res.json(success(result))
                    }
                })

            }
        })

        // Ajoute un membre avec son nom
        .post((req, res) => {

            if (req.body.name) {

                db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                    if (err) {
                        res.json(error(err.message))
                    } else {

                        if (result[0] != undefined) {
                            res.json(error('name already taken'))
                        } else {

                            db.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {
                                if (err) {
                                    res.json(error(err.message))
                                } else {

                                    db.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {

                                        if (err) {
                                            res.json(error(err.message))
                                        } else {
                                            res.json(success({
                                                id: result[0].id,
                                                name: result[0].name
                                            }))
                                        }

                                    })

                                }
                            })

                        }

                    }
                })

            } else {
                res.json(error('no name value'))
            }

        })

    app.use(config.rootAPI+'members', MembersRouter)

    app.listen(config.port, () => console.log('Started on port '+config.port))
}).catch(err => {
    console.log('Error during database connection');
    console.log(err.message);
})

