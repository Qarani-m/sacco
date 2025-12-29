// middleware/registrationCheck.js
// Ensures a member has paid the Ksh.1000 registration fee before enabling loans/shares sections

const registrationCheck = (req, res, next) => {
    // Skip check for admins
    if (res.locals.isAdmin) {
        return next();
    }

    // Check if user is logged in
    if (!res.locals.user) {
        return res.redirect('/auth/login');
    }

    // If registration is not paid, restrict access
if (!res.locals.user.registration_paid) {
    const allowedPaths = ['/members/registration-fee', '/members/registration/pay', '/auth/logout'];
    if (!allowedPaths.includes(req.path)) {
        return res.redirect('/members/registration-fee');
    }
}

    next();
};

module.exports = registrationCheck;
