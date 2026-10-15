import { useReducer } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS, settingsReducer } from '@/lib/settings';
import type { Action } from '@/lib/actions';
import type { Settings } from '@/lib/types';

// Renders a panel wired to the real reducer, so controlled inputs see state
// changes the same way they do in the app. onAction receives every action
// dispatched while the harness is mounted.
export function PanelHarness({
  initial,
  onAction,
  children,
}: {
  initial?: Settings;
  onAction?(action: Action): void;
  children(settings: Settings, dispatch: (action: Action) => void): ReactNode;
}) {
  const [settings, dispatch] = useReducer(settingsReducer, initial ?? DEFAULT_SETTINGS);
  const record = (action: Action) => {
    onAction?.(action);
    dispatch(action);
  };
  return <>{children(settings, record)}</>;
}