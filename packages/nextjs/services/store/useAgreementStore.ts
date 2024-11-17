import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Agreement } from "~~/types/Agreement";

interface AgreementSlice {
  agreements: Agreement[];
  isLoading: boolean;
  error: string | null;
  setAgreements: (agreements: Agreement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAgreements: () => void;
}

const useAgreementStore = create<AgreementSlice>()(
  devtools(
    persist(
      set => ({
        // State
        agreements: [],
        isLoading: false,
        error: null,

        // Setters
        setAgreements: (agreements: Agreement[]) => set({ agreements }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setError: (error: string | null) => set({ error }),
        clearAgreements: () => set({ agreements: [] }),
      }),
      {
        name: "agreement-store", // Key for persisting state
      },
    ),
  ),
);

export default useAgreementStore;
