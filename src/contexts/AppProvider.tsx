"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { logVisit } from "@/actions/stats";

interface AppContextProps {
  showMobileSidebar: boolean;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export default function AppProvider({ children }: { children: ReactNode }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  useEffect(() => {
    async function sendVisit() {
      const { ClientJS } = await import("clientjs");
      const client = new ClientJS();
      const fingerprint = client.getFingerprint().toString();

      await logVisit(fingerprint);
    }
    sendVisit();
  }, []);

  return (
    <AppContext.Provider
      value={{
        showMobileSidebar,
        setShowMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};
