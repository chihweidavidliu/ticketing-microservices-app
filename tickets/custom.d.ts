interface RequestUser {
  id: string;
  email: string;
  iat: number;
}

// augment Request object
declare namespace Express {
  export interface Request {
    currentUser?: RequestUser;
  }
}
