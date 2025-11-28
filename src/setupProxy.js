const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://127.0.0.1:8443',
      changeOrigin: true,
      secure: false,
      ws: true,
    })
  );
  
  app.use(
    '/health',
    createProxyMiddleware({
      target: 'https://127.0.0.1:8443',
      changeOrigin: true,
      secure: false,
    })
  );
};