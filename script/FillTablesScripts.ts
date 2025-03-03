import AWS = require('aws-sdk');
import { v4 as generateUniqueId } from 'uuid'; 

AWS.config.update({ region: 'eu-west-1' });


const dynamoDBClient = new AWS.DynamoDB.DocumentClient(); 


const productCatalog = [
  {
    title: 'Laptop Pro X', 
    description: 'A high-performance laptop with 32GB RAM and 1TB SSD.',
    price: 1500, 
  },
  {
    title: 'Smartphone Elite',
    description: 'A flagship smartphone with 256GB storage and a 108MP camera.',
    price: 900,
  },
  {
    title: 'Wireless Headphones',
    description: 'Noise-canceling wireless headphones with 30-hour battery life.',
    price: 250,
  },
];

// Function to insert an item into a DynamoDB table
async function addItemToTable(tableName: string, itemData: any) {
  const parameters = { 
    TableName: tableName,
    Item: itemData,
  };
  try {
    await dynamoDBClient.put(parameters).promise();
    console.log(`Inserted item into ${tableName}:`, itemData);
  } catch (error) {
    console.error(`Error inserting item into ${tableName}. Item:`, itemData, error);
  }
}

// Function to populate the tables
async function populateDatabaseTables() { 
  for (const product of productCatalog) { 
    const uniqueId = generateUniqueId(); 
    try {
      await addItemToTable('products', { id: uniqueId, ...product });

      await addItemToTable('stocks', { product_id: uniqueId, count: 10 });
    } catch (error) {
      console.error(`Failed to process product:`, product, error);
    }
  }
}

populateDatabaseTables().catch((error) => { 
  console.error('Script execution failed:', error);
});