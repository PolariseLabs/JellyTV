import { Jellyfin } from "@jellyfin/sdk";
import type { Api } from "@jellyfin/sdk";
import "react-native-url-polyfill/auto";
import { getSystemApi } from "@jellyfin/sdk/lib/utils/api/system-api";
import { getLibraryApi } from "@jellyfin/sdk/lib/utils/api/library-api";
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api";

/**
 * Lightweight Jellyfin SDK wrapper for the app.
 * Provides simple helpers to connect and authenticate without executing
 * side-effects at module load.
 */
const jellyfin = new Jellyfin({
  clientInfo: {
    name: "Nativewind TV",
    version: "1.0.0",
  },
  deviceInfo: {
    name: "tvOS",
    id: "nativewind-tvos-device",
  },
});

let currentApi: Api | null = null;

export function getApi(): Api {
  if (!currentApi) {
    throw new Error(
      "Jellyfin API is not initialized. Call authenticate() or connect() first."
    );
  }
  return currentApi;
}

export async function connect(serverUrl: string): Promise<Api> {
  currentApi = jellyfin.createApi(serverUrl);
  return currentApi;
}

export async function authenticate(
  serverUrl: string,
  username: string,
  password: string
): Promise<Api> {
  const api = await connect(serverUrl);
  await api.authenticateUserByName(username, password);
  return api;
}

export async function logout(): Promise<void> {
  if (currentApi) {
    try {
      await currentApi.logout();
    } catch {
      // ignore
    } finally {
      currentApi = null;
    }
  }
}

export async function fetchPublicSystemInfo(serverUrl: string) {
  const api = await connect(serverUrl);
  const info = await getSystemApi(api).getPublicSystemInfo();
  return info.data;
}

export async function fetchLibraries(): Promise<any> {
  const api = getApi();
  const libraries = await getLibraryApi(api).getMediaFolders();
  return libraries.data;
}

export async function fetchLibraryItems(libraryId: string): Promise<any[]> {
  const api = getApi();
  const response = await getItemsApi(api).getItems({ parentId: libraryId });
  return (response.data as any)?.Items ?? [];
}
