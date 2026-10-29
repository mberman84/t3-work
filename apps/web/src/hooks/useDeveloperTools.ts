import { getClientSettings, useClientSettings } from "./useSettings";

export function useDeveloperToolsEnabled(): boolean {
  return useClientSettings((settings) => settings.developerToolsEnabled);
}

export function developerToolsEnabled(): boolean {
  return getClientSettings().developerToolsEnabled;
}
