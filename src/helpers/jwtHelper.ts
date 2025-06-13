import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (payload: object, secret: Secret, expireTime: string) => {
  return jwt.sign(payload, secret, { expiresIn: '30d' });
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
const isTokenExpired = (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload;
  return !decoded?.exp || Date.now() >= decoded.exp * 1000;
};

export const jwtHelper = { createToken, verifyToken, isTokenExpired };
