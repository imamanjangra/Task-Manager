    export interface User {
        id: string;
        name: string;
        email: string;
        password: string | null;
        refresh_token: string | null;
        google_id: string | null;
        auth_provider: "local" | "google";
    }

    export interface SafeUser {
        id: string;
        name: string;
        email: string;
    }

