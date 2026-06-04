import axiosClient from './axiosClient';

// Group all Paper-related APIs
export const paperApi = {
  /**
   * Search papers with pagination and filters
   * @param params Query parameters for searching
   */
  searchPapers(params: {
    keyword?: string;
    topicId?: string | number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }) {
    return axiosClient.get('/papers/search', { params });
  },

  /**
   * Get a single paper by ID
   * @param id Paper ID
   */
  getPaperById(id: string | number) {
    return axiosClient.get(`/papers/${id}`);
  },

  /**
   * Request AI to summarize a paper
   * @param id Paper ID
   */
  summarizePaper(id: string) {
    return axiosClient.post(`/papers/${id}/summarize`);
  },

  /**
   * Request AI to score a paper
   * @param id Paper ID
   */
  scorePaper(id: string) {
    return axiosClient.post(`/papers/${id}/score`);
  },

  /**
   * Get paginated favorite papers
   */
  getFavorites(page: number = 0, size: number = 10) {
    return axiosClient.get('/favorites', { params: { page, size } });
  },

  /**
   * Add a paper to favorites
   */
  addFavorite(id: string | number) {
    return axiosClient.post(`/favorites/${id}`);
  },

  /**
   * Remove a paper from favorites
   */
  removeFavorite(id: string | number) {
    return axiosClient.delete(`/favorites/${id}`);
  },

  /**
   * Check if a paper is favorited
   */
  checkFavorite(id: string | number) {
    return axiosClient.get(`/favorites/check/${id}`);
  },

  /**
   * Get user specific paper feed based on saved topics
   */
  getUserFeed(page: number = 0, size: number = 10) {
    return axiosClient.get('/papers/feed/user', { params: { page, size } });
  },

  /**
   * Get discover paper feed based on other topics
   */
  getDiscoverFeed(page: number = 0, size: number = 5) {
    return axiosClient.get('/papers/feed/discover', { params: { page, size } });
  },

  /**
   * Get top rated papers (point >= 80)
   */
  getTopRatedPapers(page: number = 0, size: number = 6) {
    return axiosClient.get('/papers/top-rated', { params: { page, size } });
  }
};
