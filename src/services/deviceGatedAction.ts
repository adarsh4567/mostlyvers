import { AccessMode } from '../types/api';

type DeviceGatedActionOptions<T> = {
  accessMode: AccessMode | null;
  confirmTransfer: () => Promise<boolean>;
  transferDevice: () => Promise<unknown>;
  action: () => Promise<T>;
};

/**
 * Runs a protected action, offering the free-launch device transfer first when
 * this session only has browse access. The caller owns the confirmation UI and
 * state update so this remains deterministic and reusable.
 */
export const runDeviceGatedAction = async <T>({
  accessMode,
  confirmTransfer,
  transferDevice,
  action,
}: DeviceGatedActionOptions<T>): Promise<T | undefined> => {
  if (accessMode !== 'FULL') {
    const approved = await confirmTransfer();
    if (!approved) return undefined;
    await transferDevice();
  }

  return action();
};
