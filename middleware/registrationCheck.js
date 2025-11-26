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

    // Check if registration is paid
    if (!res.locals.user.registration_paid) {
        // Allow access to payment page and logout
        const allowedPaths = ['/members/pay-registration', '/members/process-registration', '/auth/logout'];
        if (!allowedPaths.includes(req.path)) {
            return res.redirect('/members/pay-registration');
        }
    }

    next();
};

module.exports = registrationCheck;
