import * as AppIntegrity from '@expo/app-integrity';
import * as Crypto from 'expo-crypto';

let preparedFor: string | null = null;

export const getPlayIntegrityProof = async (action: string, installationId: string, packageName: string, appVersion: string) => {
  const projectNumber = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_PROJECT_NUMBER?.trim();
  if (!projectNumber) return {};
  try {
    if (preparedFor !== projectNumber) {
      await AppIntegrity.prepareIntegrityTokenProviderAsync(projectNumber);
      preparedFor = projectNumber;
    }
    const requestHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${action}\n${installationId}\n${packageName}\n${appVersion}`,
    );
    const integrityToken = await AppIntegrity.requestIntegrityCheckAsync(requestHash);
    return { integrityToken, integrityRequestHash: requestHash };
  } catch {
    // The backend decides whether attestation is mandatory for the environment.
    preparedFor = null;
    return {};
  }
};
