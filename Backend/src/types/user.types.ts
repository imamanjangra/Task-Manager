    export interface User {
        id: string;
        name: string;
        email: string;
        password: string | null;
        refreshTokens: string | null;
        googleId: string | null;
        auth_provider: "local" | "google";
        profile : Profile | null;
    }

    export interface Profile {
        id: string;
        userId: string;
        profile: string | null;
    }
    export interface SafeUser {
        id: string;
        name: string;
        email: string;
    }

