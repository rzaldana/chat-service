import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event, context) => {
    // get connectionId, chatId and alias
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body);
    const chatId = body.chatId;
    const alias = body.alias;

    // get chat record from chatsTable
    try {
        let params = {
            TableName: process.env.CHATS_TABLE_NAME,
            Key: { "id": chatId }
        };
        let result = await dynamodb.get(params).promise();
        var chat = result.Item;
    } catch (error) {
        console.log("found error when getting chat record from chatsTable");
        console.error(error);
    }

    // add user to connectionsTable
    const connection = {
        id: connectionId,
        alias
    };

    try {
        let params = {
            TableName: process.env.CONNECTIONS_TABLE_NAME,
            Item: connection
        };
        await dynamodb.put(params).promise();
    } catch (error) {
        console.log("found error when adding user to connectionsTable");
        console.error(error);
    }

    // add user to participants of chat in ChatsTable
    try {
        let params = {
            TableName: process.env.CHATS_TABLE_NAME,
            Key: { id: chatId },
            UpdateExpression: `SET participants[${chat.participants.length}] = :c`,
            ConditionExpression: `size(participants) = :le`,
            ExpressionAttributeValues: { ':c': connectionId, ':le': chat.participants.length }
        };
        await dynamodb.update(params).promise();
    } catch (error) {
        console.log("found error when adding user to participants in ChatsTable");
        console.error(error);
    }

    return {};

};
