import appConfig from '../vite.config.js';
export default context => {
  const config = appConfig(context);
  return { ...config, cacheDir: 'node_modules/.vite-promo', server: { ...config.server, port: 3011 } };
};
