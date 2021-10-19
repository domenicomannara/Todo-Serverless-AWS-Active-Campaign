'use strict';

const AWS = require('aws-sdk'); 
const axios = require('axios');

const url = 'https://your-url.api-us1.com/api/3/contacts/'; // Insert your Active Campaign url

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  
  //Get Contact from Active Campaign by ID 
  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': '' // Insert your Active Campaign Api-Token
  }

  axios.get(url + event.pathParameters.id, {
      headers: headers
    }).then(response => {
      const contact_data = {
        email: response.data.contact.email,
        firstName: response.data.contact.firstName,
        lastName: response.data.contact.lastName,
        phone: response.data.contact.phone
      }
      console.log("*** Contact Data ***");
      console.log("Email:", contact_data.email);
      console.log("Firstname:", contact_data.firstName);
      console.log("Lastname:", contact_data.lastName);
      console.log("Phone:", contact_data.phone);
    }).catch(error => {
      console.log(error);
    })
  
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      //id: event.pathParameters.id,
      id_table: event.queryStringParameters.id_table,
    },
  };

  // Get Contact from the database
  dynamoDb.get(params, (error, result) => {
    if (error){
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the Contact.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};