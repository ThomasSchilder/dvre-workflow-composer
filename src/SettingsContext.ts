import { createContext, useContext } from 'react';

export interface IWorkflowSettings {
  schedulerUrl: string;
  assetIndexerUrl: string;
}

const SettingsContext = createContext<IWorkflowSettings>({
  schedulerUrl: '',
  assetIndexerUrl: ''
});

export const SettingsProvider = SettingsContext.Provider;

export function useSettings(): IWorkflowSettings {
  return useContext(SettingsContext);
}
