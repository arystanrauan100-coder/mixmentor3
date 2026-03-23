import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface AdviceRequestParams {
  topic: string;
  problem: string;
}

interface AdviceResponse {
  advice: string;
}

export function useGetAdvice() {
  return useMutation<AdviceResponse, Error, AdviceRequestParams>({
    mutationFn: async (data) => {
      const res = await fetch(api.advice.getAdvice.path, {
        method: api.advice.getAdvice.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        let errorMessage = "Неизвестная ошибка при получении совета";
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Fallback to generic message
        }
        throw new Error(errorMessage);
      }

      return await res.json();
    },
  });
}
