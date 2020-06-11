function getAuthToken(req) {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Basic') {
    return authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  } else if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

export {
  getAuthToken,
};
