const { handler } = require('../lambda/getProductsList'); 
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: jest.fn(),
    })),
  },
}));

describe('Get All Products Lambda Function', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    DynamoDBDocumentClient.from.mockReturnValue({
      send: mockSend,
    });
  });

  it('should return a list of products with stock count', async () => {
    const mockProductData = {
      Items: [
        { id: '1', title: 'Product 1', price: 100 },
        { id: '2', title: 'Product 2', price: 200 },
      ],
    };
    const mockStockData = {
      Items: [
        { product_id: '1', count: 5 },
        { product_id: '2', count: 10 },
      ],
    };

    mockSend.mockResolvedValueOnce(mockProductData); 
    mockSend.mockResolvedValueOnce(mockStockData); 

    const result = await handler();

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([
      { id: '1', title: 'Product 1', price: 100, count: 5 },
      { id: '2', title: 'Product 2', price: 200, count: 10 },
    ]);
  });

  it('should return an error if no products are found', async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe('No products found in the database.');
  });
});