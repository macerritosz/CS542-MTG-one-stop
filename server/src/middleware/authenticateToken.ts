import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
const SECRET_KEY = "mySecretKey";

interface AuthenticatedRequest extends Request {
    user: string | JwtPayload | undefined;
  }

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) {
        res.sendStatus(401);
        return;
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      req.user = decoded;
      next();
    });
}
  