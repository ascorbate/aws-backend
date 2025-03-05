import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = dynamodb.Table.fromTableName(
      this,
      'TableProducts',
      'products'
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'TableStocks',
      'stocks'
    );

    const createProductLambda = new lambda.Function(
      this,
      'createProductHandler',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'createProduct.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    const fetchAllProductsLambda = new lambda.Function(
      this,
      'FetchAllProductsFunction',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'getProductsList.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    const fetchProductByIdLambda = new lambda.Function(
      this,
      'FetchProductByIdFunction',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'getProductsById.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    productsTable.grantReadData(fetchAllProductsLambda);
    stocksTable.grantReadData(fetchAllProductsLambda);
    productsTable.grantReadData(fetchProductByIdLambda);
    stocksTable.grantReadData(fetchProductByIdLambda);
    productsTable.grantWriteData(createProductLambda);
    stocksTable.grantWriteData(createProductLambda);
    const productCatalogApi = new apigateway.RestApi(
      this,
      'ProductCatalogApi',
      {
        restApiName: 'Product Catalog API',
        description: 'API for managing product catalog',
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: ['*'],
        },
      }
    );

    const productsResource = productCatalogApi.root.addResource('products');
    productsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(fetchAllProductsLambda)
    );

    const productByIdResource = productsResource.addResource('{id}');
    productByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(fetchProductByIdLambda)
    );
    productsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createProductLambda)
    );

  }
}
