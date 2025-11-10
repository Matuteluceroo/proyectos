import { useApiRequest } from "./apiRequest";

export const useCapacitaciones = () => {
  const apiRequest = useApiRequest();

  return {
    getAll: async () => await apiRequest("capacitaciones", { method: "GET" }),

    getById: async (id: number) =>
      await apiRequest(`capacitaciones/${id}`, { method: "GET" }),

    create: async (data: any) =>
      await apiRequest("capacitaciones", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: async (id: number, data: any) =>
      await apiRequest(`capacitaciones/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    remove: async (id: number) =>
      await apiRequest(`capacitaciones/${id}`, { method: "DELETE" }),
  };
};
