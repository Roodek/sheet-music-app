// Simple in-memory database with localStorage persistence
class SimpleDatabase {
  constructor() {
    this.sheets = [];
    this.playlists = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true;
    
    try {
      const sheets = localStorage.getItem('sheets');
      const playlists = localStorage.getItem('playlists');
      
      if (sheets) this.sheets = JSON.parse(sheets);
      if (playlists) this.playlists = JSON.parse(playlists);
      
      this.initialized = true;
      console.log('✅ Database initialized successfully');
      console.log(`📄 Loaded ${this.sheets.length} sheets, ${this.playlists.length} playlists`);
      return true;
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
      return false;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('sheets', JSON.stringify(this.sheets));
      localStorage.setItem('playlists', JSON.stringify(this.playlists));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Sheet methods
  async getAllSheets() {
    return [...this.sheets];
  }

  async addSheet(sheetData) {
    const doc = {
      _id: `sheet_${Date.now()}`,
      type: 'sheet',
      name: sheetData.name,
      fileType: sheetData.fileType,
      fileData: sheetData.fileData,
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sheets.unshift(doc);
    this.saveToStorage();
    console.log('✅ Sheet added:', doc.name);
    return doc;
  }

  async updateSheet(id, updates) {
    const index = this.sheets.findIndex(s => s._id === id);
    if (index === -1) throw new Error('Sheet not found');
    
    this.sheets[index] = {
      ...this.sheets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    console.log('✅ Sheet updated:', this.sheets[index].name);
    return this.sheets[index];
  }

  async deleteSheet(id) {
    const sheet = this.sheets.find(s => s._id === id);
    this.sheets = this.sheets.filter(s => s._id !== id);
    this.saveToStorage();
    console.log('✅ Sheet deleted:', sheet?.name);
  }

  async getSheet(id) {
    return this.sheets.find(s => s._id === id);
  }

  // Playlist methods
  async getAllPlaylists() {
    return [...this.playlists];
  }

  async addPlaylist(name, sheetIds = []) {
    const doc = {
      _id: `playlist_${Date.now()}`,
      type: 'playlist',
      name,
      sheetIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.playlists.unshift(doc);
    this.saveToStorage();
    console.log('✅ Playlist added:', doc.name);
    return doc;
  }

  async updatePlaylist(id, updates) {
    const index = this.playlists.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Playlist not found');
    
    this.playlists[index] = {
      ...this.playlists[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    console.log('✅ Playlist updated:', this.playlists[index].name);
    return this.playlists[index];
  }

  async deletePlaylist(id) {
    const playlist = this.playlists.find(p => p._id === id);
    this.playlists = this.playlists.filter(p => p._id !== id);
    this.saveToStorage();
    console.log('✅ Playlist deleted:', playlist?.name);
  }

  async getPlaylist(id) {
    return this.playlists.find(p => p._id === id);
  }

  // Get sheets for a playlist
  async getPlaylistSheets(playlistId) {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) return [];
    
    return this.sheets.filter(sheet => 
      playlist.sheetIds.includes(sheet._id)
    );
  }

  // Clear all data (for testing)
  async clearAll() {
    this.sheets = [];
    this.playlists = [];
    localStorage.removeItem('sheets');
    localStorage.removeItem('playlists');
    console.log('🗑️ All data cleared');
  }
}

export const DatabaseService = new SimpleDatabase();
export default DatabaseService;