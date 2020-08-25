import AWS from "aws-sdk";

export const handler = async (event, context) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // get connectionId of user who just left
    const connectionId = event.requestContext.connectionId;

    // get connection record from connectionsTable with Key: connectionId and then delete it
    // get chatId from record
    try {
        let params = {
            TableName: process.env.CONNECTIONS_TABLE_NAME,
            Key: { id: connectionId }
        };
        let result = await dynamodb.get(params).promise();
        var chatId = result.Item.chatId;
        dynamodb.delete(params).promise();
    } catch (error) {
        console.log("error occured while getting connection record or deleting it from connectionsTable");
        console.error(error);
    }

    // Retrieve list of participants from chatsTable to find index of connectionId to delete
    try {
        let params = {
            TableName: process.env.CHATS_TABLE_NAME,
            Key: { id: chatId }
        };
        let result = await dynamodb.get(params).promise();
        var participants = result.Item.participants;


        // find index of connectionId to delete in participants
        if (Array.isArray(participants)) {
            var indexToDelete = participants.indexOf(connectionId);
            if (indexToDelete == -1) {
                console.error("connectionId not found in participants array");
            }
        } else {
            console.error("participants is not an array");
        }
    } catch (error) {
        console.log("error ocurred while retrieving record from chatsTable");
        console.error(error);
    }

    // update chatsTable to remove connectionId from participants
    try {
        let params = {
            TableName: process.env.CHATS_TABLE_NAME,
            Key: { id: chatId },
            UpdateExpression: `REMOVE participants[${indexToDelete}]`,
            ConditionExpression: `participants[${indexToDelete}] = :c`,
            ExpressionAttributeValues: { ':c': connectionId }
        };
        await dynamodb.update(params).promise();
    } catch (error) {
        console.log("error occured while updating chatsTable ");
        console.error(error);
    }


    return {};


};