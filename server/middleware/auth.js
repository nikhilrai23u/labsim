import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies?.token;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
