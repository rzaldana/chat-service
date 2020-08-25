import AWS from "aws-sdk";

export const handler = async (event, context) => {
    // create dynamodb client
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    // create APIGatewayManagement Client
    const endpoint = "https://" + event.requestContext.domainName + "/" + event.requestContext.stage;
    console.log(`endpoint: ${endpoint}`);
    const gateway = new AWS.ApiGatewayManagementApi({ endpoint });

    // get user-provided message and ChatId
    const body = JSON.parse(event.body);
    const message = body.message;
    const chatId = body.chatId;
    console.log(`message before loop = ${message}`);

    // get chat record from chatsTable
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

    for (let i = 0; i < n; i++) {
        let participant = participants[i];
        try {
            console.log(`message during loop: ${message}`);
            await gateway.postToConnection({
                Data: message,
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