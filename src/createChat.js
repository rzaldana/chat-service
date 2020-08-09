
export const handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'You created a Chat!',
            },
            null,
            2
        ),
    };


};