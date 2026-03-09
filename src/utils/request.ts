/**
 * 封装的标准网络请求模块
 */

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 8000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    // 如果返回的内容不是 JSON，可以根据后续需求去调整
    return await response.json() as T;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`请求超时: ${url}`);
    }
    throw error;
  }
}
