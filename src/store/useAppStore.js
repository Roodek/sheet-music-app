import { create } from 'zustand';
import DatabaseService from '../services/database';

export const useAppStore = create((set, get) => ({
  // State
  sheets: [],
  playlists: [],
  currentSheet: null,
  currentPlaylist: null,
  loading: false,
  error: null,

  // Initialize
  initialize: async () => {
    set({ loading: true });
    try {
      await DatabaseService.init();
      const sheets = await DatabaseService.getAllSheets();
      const playlists = await DatabaseService.getAllPlaylists();
      set({ sheets, playlists, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Sheet actions
  addSheet: async (sheetData) => {
    try {
      const newSheet = await DatabaseService.addSheet(sheetData);
      set({ sheets: [newSheet, ...get().sheets] });
      return newSheet;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSheet: async (id, updates) => {
    try {
      const updated = await DatabaseService.updateSheet(id, updates);
      set({
        sheets: get().sheets.map(s => s._id === id ? updated : s)
      });
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSheet: async (id) => {
    try {
      await DatabaseService.deleteSheet(id);
      set({ sheets: get().sheets.filter(s => s._id !== id) });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  setCurrentSheet: (sheet) => set({ currentSheet: sheet }),

  // Playlist actions
  addPlaylist: async (name, sheetIds = []) => {
    try {
      const newPlaylist = await DatabaseService.addPlaylist(name, sheetIds);
      set({ playlists: [newPlaylist, ...get().playlists] });
      return newPlaylist;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updatePlaylist: async (id, updates) => {
    try {
      const updated = await DatabaseService.updatePlaylist(id, updates);
      set({
        playlists: get().playlists.map(p => p._id === id ? updated : p)
      });
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deletePlaylist: async (id) => {
    try {
      await DatabaseService.deletePlaylist(id);
      set({ playlists: get().playlists.filter(p => p._id !== id) });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),

  clearError: () => set({ error: null })
}));