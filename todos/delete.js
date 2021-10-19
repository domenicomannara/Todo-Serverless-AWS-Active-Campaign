'use strict';

const AWS = require('aws-sdk');
const axios = require('axios');

const url = 'https://your-url.api-us1.com/api/3/contacts/'; // Insert your Active Campaign url


const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.delete = (event, context, callback) => {
  
  //Delete Contact from Active Campaign by ID 
  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': '' // Insert your Active Campaign Api-Token
  }

  axios.delete(url + event.pathParameters.id, {
      headers: headers
    }).then(response => {
      console.log("*** Deleted Contact on Active Campaign with ID = " + event.pathParameters.id + " ***");
      console.log(response);
    }).catch(error => {
      console.log(error);
    })



  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id_table: event.queryStringParameters.id_table,
    },
  };

  // Delete Contact from the database
  dynamoDb.delete(params, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t remove the Contact.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify({}),
    };
    callback(null, response);
  });
};