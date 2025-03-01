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
  
  const client = new DynamoDBClient({ region: 'eu-west-1' });
  const dynamoDB = DynamoDBDocumentClient.from(client);
  
  const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;
  const STOCKS_TABLE = process.env.STOCKS_TABLE;
  
  export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    console.log(event);
    try {
      const { title, description, price, count } = JSON.parse(event.body || '{}');
  
      if (!title || !description || !price || !count) {
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Need params: title, description, price, count',
          }),
        };
      }
  
      const id = randomUUID();
  
      const product = {
        id: id,
        title,
        description,
        price,
      };
  
      const stock = {
        product_id: id,
        count: count,
      };
  
      await dynamoDB.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: PRODUCTS_TABLE,
                Item: product,
              },
            },
            {
              Put: {
                TableName: STOCKS_TABLE,
                Item: stock,
              },
            },
          ],
        })
      );
  
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      };
    } catch (error) {
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