'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 
const axios = require('axios');

const url = 'https://your-url.api-us1.com/api/3/contacts'; // Insert your Active Campaign url
             
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = event.contact;
  
  let email = data.email;
  let firstName = data.firstName;
  let lastName = data.lastName;
  let phone = data.phone;

  
  //Add Contact into Active Campaign
  const data_to_send = {
    contact:{
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': '' // Insert your Active Campaign Api-Token
  }

  axios.post(url, data_to_send, {
      headers: headers
    }).then(response => {
      console.log("*** Added new Contact on Active Campaign ***");
      console.log(response);
    }).catch(error => {
      console.log(error);
    })


  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id_table: uuid.v1(),
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // Insert new Contact into Database
  dynamoDb.put(params, (error) => {
    if (error){
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create a new Contact.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};