const openapiSpec = require('./openapi.json');

class DocsHandler {
  constructor() {
    this.getDocsHandler = this.getDocsHandler.bind(this);
    this.getOpenApiJsonHandler = this.getOpenApiJsonHandler.bind(this);
    this.getRootHandler = this.getRootHandler.bind(this);
  }

  async getOpenApiJsonHandler(request, h) {
    const response = h.response(openapiSpec);
    response.code(200);
    return response;
  }

  async getDocsHandler(request, h) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Forum API - Swagger Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; font-family: sans-serif; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
    const response = h.response(html);
    response.header('Content-Type', 'text/html; charset=utf-8');
    response.code(200);
    return response;
  }

  async getRootHandler(request, h) {
    const acceptHeader = (request.headers && request.headers.accept) || '';
    if (acceptHeader.includes('text/html')) {
      return this.getDocsHandler(request, h);
    }

    const response = h.response({
      status: 'fail',
      message: 'Not Found',
    });
    response.code(404);
    return response;
  }
}

module.exports = DocsHandler;
