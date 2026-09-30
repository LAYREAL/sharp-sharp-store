import { useEffect, useState } from 'react';
import { getInstallState, subscribeInstall, promptInstall } from './install';

export function useInstall() {
  const [state, setState] = useState(getInstallState);
  useEffect(() => {
    setState(getInstallState());
    return subscribeInstall(() => setState(getInstallState()));
  }, []);
  return { state, install: promptInstall };
}
