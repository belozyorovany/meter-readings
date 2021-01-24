module.exports = function mustBeAuthenticated(ctx, next) {
  if (!ctx.user) {
    ctx.throw(401, 'User should be authenticated');
  }

  return next();
};
