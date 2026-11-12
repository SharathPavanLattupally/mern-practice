
const VALID_ROLES = ["admin", "staff", "viewer"];

export const authorize = (...allowedRoles) => {
    const roles = allowedRoles.filter((role) =>
        VALID_ROLES.includes(role)
    );

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (
            roles.length === 0 ||
            !roles.includes(req.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action.",
            });
        }

        return next();
    };
};
