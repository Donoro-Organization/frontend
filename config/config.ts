import Constants from 'expo-constants';

const config = {
  BACKEND_API_ENDPOINT: Constants.expoConfig?.extra?.BACKEND_API_ENDPOINT || '',
};

console.log('Config loaded:', config);

export default config;