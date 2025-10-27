import { CartCustomization, CartStore } from "@/type";
import { Alert } from "react-native";
import { create } from "zustand";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    restaurantId: null,

    addItem: (item, restaurantId, quantity = 1) => {
        const currentRestaurantId = get().restaurantId;
        const customizations = item.customizations ?? [];

        // 🚨 Note: Restaurant conflict check moved to menu-detail.tsx
        // This function now assumes conflict already handled
        
        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations) &&
                (i.notes || '') === (item.notes || '')
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations) &&
                    (i.notes || '') === (item.notes || '')
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                ),
            });
        } else {
            set({
                items: [...get().items, { ...item, quantity: quantity, customizations }],
                restaurantId: restaurantId
            });
        }
    },

    removeItem: (id, customizations = [], notes = '') => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations) &&
                        (i.notes || '') === notes
                    )
            ),
        });
    },

    increaseQty: (id, customizations = [], notes = '') => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], customizations) &&
                (i.notes || '') === notes
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, customizations = [], notes = '') => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations) &&
                    (i.notes || '') === notes
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [], restaurantId: null }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0),

    getCartForCheckout: () => {
        const state = get();
        return {
            items: state.items,
            restaurantId: state.restaurantId,
            totalAmount: state.getTotalPrice(),
            totalItems: state.getTotalItems()
        };
    },
}));
