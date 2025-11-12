import { getCurrentUser, signOut } from "@/lib/appwrite";
import { User } from "@/type";
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: false, // ✅ Changed from true to false - Allow app to render without authentication

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({isLoading: value}),

    fetchAuthenticatedUser: async () => {
        set({isLoading: true});

        try {
            const user = await getCurrentUser();

            if(user) {
                // Kiểm tra role - chỉ cho phép customer sử dụng mobile app
                if (user.role !== 'customer') {
                    console.warn(`⚠️ User with role "${user.role}" attempted to access mobile app`);
                    
                    // Đăng xuất ngay lập tức
                    await signOut();
                    set({ isAuthenticated: false, user: null });
                    
                    // Throw error để caller có thể xử lý
                    throw new Error(`Access denied. This app is for customers only.`);
                }
                
                set({ isAuthenticated: true, user: user as unknown as User });
            } else {
                set({ isAuthenticated: false, user: null });
            }
        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({ isAuthenticated: false, user: null });
            // Re-throw error nếu là lỗi access denied
            if (e instanceof Error && e.message.includes('Access denied')) {
                throw e;
            }
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await signOut();
            set({ isAuthenticated: false, user: null });
        } catch (e) {
            console.log('logout error', e);
            // Vẫn reset state ngay cả khi signOut thất bại
            set({ isAuthenticated: false, user: null });
        }
    }
}))

export default useAuthStore;
