const webhookService =
    require('../services/webhook.service');

async function receive(
    req,
    res
) {

    try {

        const {
            type,
            data
        } = req.body;

        if (
            type === 'payment'
        ) {

            await webhookService.processPayment(
                data.id
            );

        }

        return res.sendStatus(200);

    } catch (error) {

        console.error(error);

        return res.sendStatus(500);

    }

}

module.exports = {
    receive
};