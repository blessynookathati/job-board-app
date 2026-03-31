import { create } from "zustand";

const useStore = create((set) => ({
  bookmarks: JSON.parse(localStorage.getItem("bookmarks")) || [],

  toggleBookmark: (id) =>
    set((state) => {
      let updated;
      if (state.bookmarks.includes(id)) {
        updated = state.bookmarks.filter((b) => b !== id);
      } else {
        updated = [...state.bookmarks, id];
      }
      localStorage.setItem("bookmarks", JSON.stringify(updated));
      return { bookmarks: updated };
    }),
}));

export default useStore;