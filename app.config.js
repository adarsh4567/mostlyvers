const base = require('./app.json').expo;

module.exports = () => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || base.extra?.eas?.projectId;
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || base.android?.googleServicesFile;

  return {
    ...base,
    extra: {
      ...base.extra,
      ...(projectId ? { eas: { ...base.extra?.eas, projectId } } : {}),
    },
    android: {
      ...base.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
