
export const handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'You sent a message!',
            },
            null,
            2
        ),
    };


};