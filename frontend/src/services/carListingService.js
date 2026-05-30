import api from './api';

export const createListing = async (data) => {
  const response = await api.post('/car-listings', data);
  return response.data;
};

export const getMyListings = async () => {
  const response = await api.get('/car-listings/my-listings');
  return response.data;
};

export const getAllListings = async () => {
  const response = await api.get('/car-listings');
  return response.data;
};

export const getListingById = async (id) => {
  const response = await api.get(`/car-listings/${id}`);
  return response.data;
};

export const updateListing = async (id, data) => {
  const response = await api.put(`/car-listings/${id}`, data);
  return response.data;
};

export const getPublishedListings = async (params) => {
  const response = await api.get('/car-listings/published', { params });
  return response.data;
};

export const getPublicListingById = async (id) => {
  const response = await api.get(`/car-listings/public/${id}`);
  return response.data;
};

export const deleteListing = async (id) => {
  const response = await api.delete(`/car-listings/${id}`);
  return response.data;
};