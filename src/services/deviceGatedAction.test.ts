import { runDeviceGatedAction } from './deviceGatedAction';

describe('runDeviceGatedAction', () => {
  it('transfers a browse-only account before performing the requested action', async () => {
    const confirmTransfer = jest.fn().mockResolvedValue(true);
    const transferDevice = jest.fn().mockResolvedValue(undefined);
    const action = jest.fn().mockResolvedValue('claimed');

    await expect(
      runDeviceGatedAction({
        accessMode: 'BROWSE_ONLY',
        confirmTransfer,
        transferDevice,
        action,
      }),
    ).resolves.toBe('claimed');

    expect(confirmTransfer).toHaveBeenCalledTimes(1);
    expect(transferDevice).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(transferDevice.mock.invocationCallOrder[0]).toBeLessThan(action.mock.invocationCallOrder[0]);
  });

  it('does not transfer an already authorized account', async () => {
    const transferDevice = jest.fn();
    const action = jest.fn().mockResolvedValue('claimed');

    await expect(
      runDeviceGatedAction({
        accessMode: 'FULL',
        confirmTransfer: jest.fn(),
        transferDevice,
        action,
      }),
    ).resolves.toBe('claimed');

    expect(transferDevice).not.toHaveBeenCalled();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('leaves the account unchanged when transfer is cancelled', async () => {
    const transferDevice = jest.fn();
    const action = jest.fn();

    await expect(
      runDeviceGatedAction({
        accessMode: 'BROWSE_ONLY',
        confirmTransfer: jest.fn().mockResolvedValue(false),
        transferDevice,
        action,
      }),
    ).resolves.toBeUndefined();

    expect(transferDevice).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
});
