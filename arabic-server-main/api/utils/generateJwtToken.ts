import jwt from "jsonwebtoken";

interface Payload {
  adminId: string;
}

const generateJwtToken = (payload: Payload, expiresIn?: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: expiresIn ?? "7d" },
      (err, token) => {
        if (err || !token) return reject(err);
        resolve(token);
      }
    );
  });
};

export default generateJwtToken;