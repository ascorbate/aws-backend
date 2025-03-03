import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const dynamoDbClient = new DynamoDBClient({ region: 'eu-west-1' });
const documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);

  try {
    const requestBody = JSON.parse(event.body || '{}');
    const { title, description, price, count } = requestBody;

    if (!title || !description || !price || !count) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          message:
            'Missing required parameters: title, description, price, count.',
        }),
      };
    }

    const productId = randomUUID();

    const newProduct = {
      id: productId,
      title,
      description,
      price,
    };

    const newStock = {
      product_id: productId,
      count,
    };

    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE_NAME,
              Item: newProduct,
            },
          },
          {
            Put: {
              TableName: STOCKS_TABLE_NAME,
              Item: newStock,
            },
          },
        ],
      })
    );

    return {
      statusCode: 201,
      headers: HEADERS,
      body: JSON.stringify(newProduct),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        message:
          error instanceof Error ? error.message : 'Internal server error.',
      }),
    };
  }
};
