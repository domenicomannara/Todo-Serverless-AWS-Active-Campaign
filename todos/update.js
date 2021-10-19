'use strict';

const AWS = require('aws-sdk');
const axios = require('axios');

const url = 'https://your-url.api-us1.com/api/3/contacts/'; // Insert your Active Campaign url

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  
  
  //Update Contact into Active Campaign
  const data_to_send = {
    contact:{}
  }

  if(data.email != null) data_to_send.contact.email = data.email;
  if(data.firstName != null) data_to_send.contact.firstName = data.firstName;
  if(data.lastName != null) data_to_send.contact.lastName = data.lastName;
  if(data.phone != null) data_to_send.contact.phone = data.phone;

  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': '' // Insert your Active Campaign Api-Token
  }

  axios.put(url + event.pathParameters.id, data_to_send, {
      headers: headers
    }).then(response => {
      console.log("*** Update Contact on Active Campaign with ID = " + event.pathParameters.id + " ***");
      console.log(response);
    }).catch(error => {
      console.log(error);
    })
  

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id_table: event.queryStringParameters.id_table,
    },
    ExpressionAttributeValues: {
      ':email': data.email,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET email = :email, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  // Update the Contanct in the database
  dynamoDb.update(params, (error, result) => {
    if (error){
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t update Contact.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};