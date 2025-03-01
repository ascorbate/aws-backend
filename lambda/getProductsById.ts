import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import * as AWS from "aws-sdk";
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE: string = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE: string = process.env.STOCKS_TABLE!;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {


  console.log(event);



  const id = event.pathParameters?.id;

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

  const productData = await dynamoDB.get(productParams).promise();
  const stockData = await dynamoDB.get(stockParams).promise();

  const product = {
    ...productData.Item,
    count: stockData.Item ? stockData.Item.count : 0,
  };

  if (!product) {
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
};
