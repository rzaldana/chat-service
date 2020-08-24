import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();


export const handler = async (event, context) => {
    // get user-provided connectionId, alias, and chatName
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body);
    const alias = body.alias;
    const chatName = body.chatName;


    // generate DynamoDB records to be inserted
    const chat = {
        id: uuid(),
        name: chatName,
        participants: [connectionId,],
    };

    const connection = {
        id: connectionId,
        alias
    };


    // put chat and connection to ChatsTable and ConnectionsTable respectively
    try {
        await dynamodb.put({ TableName: process.env.CHATS_TABLE_NAME, Item: chat }).promise();
        await dynamodb.put({ TableName: process.env.CONNECTIONS_TABLE_NAME, Item: connection }).promise();
    } catch (error) {
        console.error(error);
    }

    return {};

};