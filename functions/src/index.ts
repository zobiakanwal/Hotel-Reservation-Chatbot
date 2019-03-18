'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { WebhookClient } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:*'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const _agent = new WebhookClient({ request, response });
  //  const params = request.body.queryResult.parameters;
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        console.log('working');
        agent.add(`Good day! Do you want to book a room  or have some feedback for us?`);
    }

    function fallback(agent) {
        agent.add(`I'm sorry, I didn't understand. Can you say that again?`);
    }

    function roombooking(agent) {

        const firstname = agent.parameters.firstname;
        const lastname = agent.parameters.lastname;
        const persons = agent.parameters.persons;
        const email = agent.parameters.email;
        const RoomType = agent.parameters.RoomType;      
        console.log(name, persons, email, RoomType);

       const dialogflowAgentRef = db.collection('data').doc();   //.doc=docRef,('agent=anythin'=path)
    

        return db.runTransaction(t => {
            t.set(dialogflowAgentRef, { entry: firstname, lastname, persons, email, RoomType});
            return Promise.resolve('Write complete');
        }).then(doc => {
            agent.add(`${firstname} ${lastname} your hotel booking request for ${RoomType} room is forwarded for 
      ${persons} persons. We will contact you on ${email} soon`);
        }).catch(err => {
            console.log(`Error writing to Firestore: ${err}`);
            agent.add(`Failed to write on database`);
        });

    }


     function complaint(agent) {

        const typeFeedback = agent.parameters.typeFeedback;
        const subject = agent.parameters.subject;
        const description = agent.parameters.description;
 

        const dialogflowAgentRef = db.collection('data').doc();   //.doc=docRef,('agent=anythin'=path)

        return db.runTransaction(t => {
            t.set(dialogflowAgentRef, { entry: typeFeedback, subject, description });
            return Promise.resolve('Write complete');
        }).then(doc => {
            agent.add(`Your ${typeFeedback} is duly noted against: \n Subject: ${subject}.
                \n Description: ${description}`);
        }).catch(err => {
            console.log(`Error writing to Firestore: ${err}`);
            agent.add(`Failed to write on database`);
        });

    }
    

    // Run the proper handler based on the matched Dialogflow intent
    const intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('RoomBooking', roombooking);
    intentMap.set('Complaint', complaint);


    _agent.handleRequest(intentMap);
});
