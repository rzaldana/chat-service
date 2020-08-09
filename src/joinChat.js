
export const handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'You joined a chat!',
            },
            null,
            2
        ),
    };

};
