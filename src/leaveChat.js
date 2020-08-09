
export const handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'You let a Chat!',
            },
            null,
            2
        ),
    };


};