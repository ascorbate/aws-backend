import * as AWS from 'aws-sdk';
  
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE: string = process.env.PRODUCTS_TABLE!;
const STOCKS_TABLE: string = process.env.STOCKS_TABLE!;


exports.handler = async () => {
  const productTableParams = {
    TableName: PRODUCTS_TABLE,
  };

  const stockTableParams = {
    TableName: STOCKS_TABLE,
  };

  try {

    const productTableData = await dynamoDB.scan(productTableParams).promise();
    const stockTableData = await dynamoDB.scan(stockTableParams).promise();

 
    const productList = productTableData.Items || [];
    const stockList = stockTableData.Items || [];

  
    if (!productList.length) {
      throw new Error("No products found in the database.");
    }


    const combinedProductList = productList.map(
      (product: AWS.DynamoDB.DocumentClient.AttributeMap) => {
        const matchingStock = stockList.find(
          (stock: AWS.DynamoDB.DocumentClient.AttributeMap) =>
            stock.product_id === product.id
        );
        return {
          ...product,
          count: matchingStock ? matchingStock.count : 0,
        };
      }
    );

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