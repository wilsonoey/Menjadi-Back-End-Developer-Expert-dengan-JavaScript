const DocsHandler = require('../handler');

describe('DocsHandler', () => {
  it('should handle getOpenApiJsonHandler correctly', async () => {
    const handler = new DocsHandler();
    let codeValue;
    const mockH = {
      response: jest.fn().mockImplementation((spec) => ({
        code: (code) => {
          codeValue = code;
        },
      })),
    };

    const response = await handler.getOpenApiJsonHandler({}, mockH);
    expect(mockH.response).toHaveBeenCalled();
    expect(codeValue).toEqual(200);
    expect(response).toBeDefined();
  });

  it('should handle getDocsHandler correctly', async () => {
    const handler = new DocsHandler();
    let headerKey;
    let headerValue;
    let codeValue;
    const mockH = {
      response: jest.fn().mockImplementation(() => ({
        header: (key, value) => {
          headerKey = key;
          headerValue = value;
        },
        code: (code) => {
          codeValue = code;
        },
      })),
    };

    const response = await handler.getDocsHandler({}, mockH);
    expect(mockH.response).toHaveBeenCalled();
    expect(headerKey).toEqual('Content-Type');
    expect(headerValue).toContain('text/html');
    expect(codeValue).toEqual(200);
    expect(response).toBeDefined();
  });

  it('should handle getRootHandler when accept header contains text/html', async () => {
    const handler = new DocsHandler();
    const mockH = {
      response: jest.fn().mockImplementation(() => ({
        header: jest.fn(),
        code: jest.fn(),
      })),
    };

    const request = {
      headers: {
        accept: 'text/html,application/xhtml+xml',
      },
    };

    const response = await handler.getRootHandler(request, mockH);
    expect(mockH.response).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it('should handle getRootHandler when accept header is not text/html', async () => {
    const handler = new DocsHandler();
    let codeValue;
    const mockH = {
      response: jest.fn().mockImplementation((resObj) => ({
        code: (code) => {
          codeValue = code;
        },
      })),
    };

    const request = {
      headers: {
        accept: 'application/json',
      },
    };

    const response = await handler.getRootHandler(request, mockH);
    expect(mockH.response).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Not Found',
    });
    expect(codeValue).toEqual(404);
    expect(response).toBeDefined();
  });
});
