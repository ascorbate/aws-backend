import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'eu-west-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

// Retrieve table names from environment variables
const PRODUCTS_TABLE: string = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE: string = process.env.STOCKS_TABLE!;

exports.handler = async () => {
  // Define parameters for querying the DynamoDB tables
  const productTableParams = {
    TableName: PRODUCTS_TABLE,
  };

  const stockTableParams = {
    TableName: STOCKS_TABLE,
  };

  try {
    // Fetch data from the DynamoDB tables
    const productTableData = await dynamoDB.send(new ScanCommand(productTableParams));
    const stockTableData = await dynamoDB.send(new ScanCommand(stockTableParams));

    // Extract items from the scan results, defaulting to an empty array if none are found
    const productList = productTableData.Items || [];
    const stockList = stockTableData.Items || [];

    // Validate that products exist
    if (!productList.length) {
      throw new Error("No products found in the database.");
    }

    // Combine product and stock data
    const combinedProductList = productList.map((product) => {
      const matchingStock = stockList.find(
        (stock) => stock.product_id === product.id
      );
      return {
        ...product,
        count: matchingStock ? matchingStock.count : 0,
      };
    });

    // Return a successful response with the combined product list
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(combinedProductList),
    };
  } catch (error) {
    // Handle errors and return an appropriate response
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while processing the request.",
      }),
    };
  }
};