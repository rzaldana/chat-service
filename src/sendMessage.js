import AWS from "aws-sdk";

export const handler = async (event, context) => {
    // create dynamodb client
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // create APIGatewayManagement Client
    const endpoint = "https://" + event.requestContext.domainName + "/" + event.requestContext.stage;
    const gateway = new AWS.ApiGatewayManagementApi({ endpoint });

    // get connectionId, message, and alias from user request
    const body = JSON.parse(event.body);
    const message = body.message;
    const connectionId = event.requestContext.connectionId;

    // get connection record from connectionsTable
    // to find chatId and alias
    try {
        let params = {
            TableName: process.env.CONNECTIONS_TABLE_NAME,
            Key: { id: connectionId }
        };
        let result = await dynamodb.get(params).promise();
        var chatId = result.Item.chatId;
        var alias = result.Item.alias;
        console.log(`chatId = ${JSON.stringify(chatId)}`);

    } catch (error) {
        console.log("An error occured while getting the connection record from connectionsTable");
        console.error(error);
    }


    // get chat record from chatsTable with chatId from above
    try {
        let params = {
            TableName: process.env.CHATS_TABLE_NAME,
            Key: { id: chatId }
        };
        let result = await dynamodb.get(params).promise();
        var chat = result.Item;
    } catch (error) {
        console.log("An error occured when getting chat record from chatsTable");
        console.error(error);
    }


    // send message to every participant in chat
    // Not using forEach because you can't use forEach with async/await
    let participants = chat.participants;
    let n = participants.length;

    // a string that is unlikely to appear in a text message
    // and will separate the alias from the message in the
    // string we send through the socket
    const separator = "+/*/*";


    for (let i = 0; i < n; i++) {
        let participant = participants[i];
        try {
            console.log(`message during loop: ${message}`);
            await gateway.postToConnection({
                Data: `${alias}${separator}${message}`,
                ConnectionId: participant
            }).promise();
            console.log(`message after sending: ${message}`);

        } catch (error) {
            console.log(`error occurred when posting message to participant ${participant} `);
            console.error(error);
        }
    }

    console.log(`message after loop: ${message}`);

    return {};


};