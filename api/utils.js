async function requireUser(req, res, next) {
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action"
        });
    }
    next();
}

async function requireActiveUser(req, res, next) {
    if (req.user.active) {

        next()
    } else {
        next({
            name: "InactiveUserError",
            message: "We must have an active user account"
        })
    }
}

module.exports = {
    requireUser,
    requireActiveUser,
}
