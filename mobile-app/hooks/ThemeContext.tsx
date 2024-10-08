import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  ReactElement,
  useMemo,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultContextValue: ThemeContextType = {
  theme: "light",
  toggleTheme: (): void => {},
};

const ThemeContext: React.Context<ThemeContextType> =
  createContext<ThemeContextType>(defaultContextValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const colorScheme: ColorSchemeName = useColorScheme();
  const [theme, setTheme] = useState<Theme>((colorScheme as Theme) || "light");

  useEffect((): void => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  const toggleTheme: () => void = (): void => {
    setTheme((prevTheme: Theme): "light" | "dark" =>
      prevTheme === "light" ? "dark" : "light",
    );
  };

  const contextValue: {
    theme: Theme;
    toggleTheme: () => void;
  } = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme: () => ThemeContextType = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
