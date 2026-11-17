export class AppApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "ERROR", status = 500) {
    super(message);
    this.name = "AppApiError";
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const method = (
    customConfig.method || (data !== undefined ? "POST" : "GET")
  ).toUpperCase();

  // For any mutating HTTP method (POST, PATCH, PUT, DELETE),
  // backend contract requires Content-Type: application/json.
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const configHeaders: Record<string, string> = {};
  if (isMutation) {
    configHeaders["Content-Type"] = "application/json";
  }

  if (headers) {
    if (typeof (headers as any).forEach === "function") {
      (headers as any).forEach((value: string, key: string) => {
        configHeaders[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        configHeaders[key] = value;
      });
    } else {
      Object.assign(configHeaders, headers);
    }
  }

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: configHeaders,
    ...customConfig,
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const url = endpoint;

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new AppApiError(
      "Serverga ulanishda xatolik yuz berdi. Backend ishlayotganligini tekshiring.",
      "NETWORK_ERROR",
      0,
    );
  }

  // DELETE and logout return 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let resultData: any;
  try {
    resultData = await response.json();
  } catch {
    resultData = null;
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      !endpoint.includes("/api/auth/") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("teamflow:unauthorized"));
    }
    const errorMsg =
      resultData?.error?.message ||
      (response.status === 401
        ? "Avtorizatsiyadan o‘tilmagan"
        : response.status === 403
          ? "Ushbu amalni bajarish uchun ruxsat yo‘q"
          : response.status === 404
            ? "So‘ralgan resurs topilmadi"
            : "Xatolik yuz berdi");
    const errorCode = resultData?.error?.code || "HTTP_" + response.status;
    throw new AppApiError(errorMsg, errorCode, response.status);
  }

  // Standard API success response returns { data: ... }
  if (resultData && typeof resultData === "object" && "data" in resultData) {
    return resultData.data as T;
  }

  return resultData as T;
}
