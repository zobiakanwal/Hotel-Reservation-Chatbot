'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Carousel } = require('actions-on-google');
//const { Card, Suggestion } = require('dialogflow-fulfillment');


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// URLs for images used in card rich responses


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const _agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  const params = request.body.queryResult.parameters   //intializing parameters
  const intentName = request.body.queryResult.intent.displayName   //getting parameters from dialogflow
  console.log("Intent name", intentName);   

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function roombooking(agent) {
    agent.add(`${params.name} your hotel booking request for ${params.RoomType}room is forwarded for 
                ${params.persons}persons. We will contact you on ${params.email} soon`);
  }
  
    function complaint(agent) {
    agent.add(`Your feedback is duly noted against: \n Subject: ${params.subject}.
                                 \n Description: ${params.description}`);
  }

  // Run the proper handler based on the matched Dialogflow intent
  const intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('RoomBooking', roombooking);
  intentMap.set('Complaint', complaint);
  
  
  _agent.handleRequest(intentMap);
});