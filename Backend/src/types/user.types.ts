export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    refresh_token: string | null;
}

export interface SafeUser {
    id: string;
    name: string;
    email: string;
}

