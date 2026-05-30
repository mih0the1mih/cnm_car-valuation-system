import api from './api';

export const getInspectionList = async () => {
  const res = await api.get('/technician/listings');
  return res.data;
};

export const getInspectionDetail = async (id) => {
  const res = await api.get(`/technician/listing/${id}`);
  return res.data;
};

export const submitInspection = async (id, data) => {
  const res = await api.put(`/technician/listing/${id}/inspect`, data);
  return res.data;
};