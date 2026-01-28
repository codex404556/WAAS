type PayloadFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function payloadFetch<T>(
  path: string,
  options: PayloadFetchOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;
  const res = await fetch(path, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const suffix = text ? ` - ${text}` : "";
    throw new Error(
      `Payload request failed: ${res.status} ${res.statusText}${suffix}`
    );
  }

  return (await res.json()) as T;
}
