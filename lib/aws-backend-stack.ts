import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { data } from '../util/util';

export class AwsBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fetchAllProductsLambda = new lambda.Function(this, 'FetchAllProductsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
    });

    const fetchProductByIdLambda = new lambda.Function(this, 'FetchProductByIdFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
      environment: {
        MOCK_DATA: JSON.stringify(data),
      },
    });

    const productCatalogApi = new apigateway.RestApi(this, 'ProductCatalogApi', {
      restApiName: 'Product Catalog API',
      description: 'API for managing product catalog',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['*'],
      },
    });

    const productsResource = productCatalogApi.root.addResource('products');
    productsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(fetchAllProductsLambda)
    );

    const productByIdResource = productsResource.addResource('{productId}');
    productByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(fetchProductByIdLambda)
    );
  }
}
