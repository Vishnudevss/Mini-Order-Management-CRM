import api from "./api";

export async function getProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function createOrder(orderData) {
  const response = await api.post("/orders", orderData);
  return response.data;
}