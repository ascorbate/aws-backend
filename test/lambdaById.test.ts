

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
}));

describe('Get Product By ID Lambda Function', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({
      send: mockSend,
    });
  });

  it('should return a product with stock count when ID is valid', async () => {
    const mockEvent = {
      pathParameters: { id: '1' },
    };

    const mockProductData = {
      Item: { id: '1', title: 'Product 1', price: 100 },
    };
    const mockStockData = {
      Item: { product_id: '1', count: 5 },
    };

    mockSend.mockResolvedValueOnce(mockProductData); // Мокаем результат get для PRODUCTS_TABLE
    mockSend.mockResolvedValueOnce(mockStockData); // Мокаем результат get для STOCKS_TABLE

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      id: '1',
      title: 'Product 1',
      price: 100,
      count: 5,
    });
  });

  it('should return a 400 error if product ID is missing', async () => {
    const mockEvent = {
      pathParameters: {},
    };

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe('Product id required');
  });

  it('should return a 404 error if product is not found', async () => {
    const mockEvent = {
      pathParameters: { id: '1' },
    };

    mockSend.mockResolvedValueOnce({ Item: null }); // Мокаем отсутствие продукта в PRODUCTS_TABLE

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Product not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const mockEvent = {
      pathParameters: { id: '1' },
    };

    mockSend.mockRejectedValueOnce(new Error('DynamoDB error')); // Мокаем ошибку при вызове DynamoDB

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('DynamoDB error');
  });
});
