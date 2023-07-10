const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
require('dotenv').config();
const { requireUser, requireActiveUser } = require('./utils.js');


usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");


    next();
});

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);
        if (user && user.password == password) {
            const encryptedData = jwt.sign({
                id: user.id,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: "1w" })
            res.send({
                message: "you're logged in!",
                token: encryptedData
            });
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }

        const user = await createUser({
            username,
            password,
            name,
            location,
        });

        const encryptedData = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: "thank you for signing up",
            token: encryptedData
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
});

usersRouter.delete("/:userId", requireUser, requireActiveUser, async (req, res, next) => {
    const userId = req.params.userId;
    const deleteUser = await getUserById(userId);

    try {
        if (!deleteUser) {
            throw {
                name: "InvalidUserId",
                message: "Must have a valid UserId"
            }

        } else if (req.user.id === deleteUser.id) {
            const updatedUser = await updateUser(userId, { active: false });
            if (!updatedUser) {
                throw {
                    name: "UnableToDelete",
                    message: "Was not able to delete user"
                }
            }
            res.send({ user: updatedUser })
        } else {
            throw {
                name: "CannotDeleteOtherUsers",
                message: "You cannot delete users other than yourself"
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
    const userId = req.params.userId;
    const userToUpdate = await getUserById(userId);

    try {
        if (!userToUpdate) {
            throw {
                name: "InvalidUserId",
                message: "It must have a valid userId"
            }
        } else if (req.user.id === userToUpdate.id) {
            const updatedUser = await updateUser(userId, { active: true })
            if (!updatedUser) {
                throw {
                    name: "UnableToUpdate",
                    message: "Was not able to update user"
                }
            }
            res.send({ user: updatedUser });
        } else {
            throw {
                name: "CannotUpdateOtherUsers",
                message: "You cannot update users other than yourself"
            }
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
});

module.exports = usersRouter;
