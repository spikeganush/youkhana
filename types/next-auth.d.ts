import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'MASTER_ADMIN' | 'ADMIN' | 'MEMBER';
  }
}
