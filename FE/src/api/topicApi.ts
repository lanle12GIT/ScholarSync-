import axiosClient from './axiosClient';

// Group all Topic-related APIs
export const topicApi = {
  /**
   * Get all topics
   */
  getAll() {
    return axiosClient.get('/topics');
  },

  /**
   * Get a single topic by ID
   * @param id Topic ID
   */
  getById(id: string) {
    return axiosClient.get(`/topics/${id}`);
  },

  /**
   * Create a new topic for user
   * @param data Object containing the topic key
   */
  create(data: { key: string }) {
    return axiosClient.post('/topics', data);
  },

  /**
   * Update an existing topic
   * @param id Topic ID
   * @param data Updated topic data
   */
  update(id: string, data: { name?: string; keywords?: string[] }) {
    return axiosClient.put(`/topics/${id}`, data);
  },

  /**
   * Delete a topic by ID
   * @param id Topic ID
   */
  delete(id: string) {
    return axiosClient.delete(`/topics/${id}`);
  },

  /**
   * Get all topic categories
   */
  getAllCategories() {
    return axiosClient.get('/categories');
  },

  /**
   * Get topics by category ID
   */
  getTopicsByCategory(categoryId: number) {
    return axiosClient.get(`/topics/category/${categoryId}`);
  },
};
