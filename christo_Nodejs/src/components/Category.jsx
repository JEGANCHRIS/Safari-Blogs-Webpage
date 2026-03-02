import { createContext, useState } from "react";

export const CategoryContext = createContext();

export function categoryProvider({ children }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <categoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </categoryContext.Provider>
  );
}
