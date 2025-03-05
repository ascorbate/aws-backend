import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

// Retrieve table names from environment variables
const PRODUCTS_TABLE: string = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE: string = process.env.STOCKS_TABLE!;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  console.log(event);

  // Extract the product ID from the path parameters
  const id = event.pathParameters?.id;

  // Define parameters for querying the DynamoDB tables
  const productParams = {
    TableName: PRODUCTS_TABLE,
    Key: { id },
  };

  const stockParams = {
    TableName: STOCKS_TABLE,
    Key: { product_id: id },
  };

  console.log('id', id);
  if (!id) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Product id required' }),
    };
  }

  try {
    // Fetch data from the DynamoDB tables
    const productData = await dynamoDB.send(new GetCommand(productParams));
    const stockData = await dynamoDB.send(new GetCommand(stockParams));

    // Combine product and stock data
    const product = {
      ...productData.Item,
      count: stockData.Item ? stockData.Item.count : 0,
    };

    // Validate that the product exists
    if (!productData.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    // Return a successful response with the combined product data
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    };
  } catch (error) {
    // Handle errors and return an appropriate response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while processing the request.',
      }),
    };
  }
};