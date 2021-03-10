/*
async testCommunityGarden(
    @Arg("communitygarden") communitygarden: String
): Promise<Boolean> {
    if (communitygarden === "localfood") {
        return true;
    } else {
        return false;

    }
};

@Mutation(() => Boolean)
async scripting(
) {
    //const b64 = "SGVsbG8sIFdvcmxkIQ==";
    const str = 'Hello, World!'

    const token = process.env.COMMUNITY_GARDEN_BRAINTREE_API_PUBLIC_KEY;
    console.log(token)
    if (!token) {
        return false;
    }
    const base64_token = await CommunityGarden.encode64(str)
    console.log(base64_token)

    return true;
}
@Mutation(() => Boolean)
async testBraintree() {
    //const endpoint1 = process.env.COMMUNITY_GARDEN_BRAINTREE_API_ENDPOINT;
    const endpoint2 = process.env.COMMUNITY_GARDEN_BRAINTREE_API_ENDPOINT_TEST;

    const keypair = process.env.COMMUNITY_GARDEN_BRAINTREE_API_PUBLIC_KEY + ":" + process.env.COMMUNITY_GARDEN_BRAINTREE_API_PRIVATE_KEY;
    //console.log("keypair, ", keypair);

    const BraintreeClient = new GraphQLClient(endpoint2 as string, {
        headers: {
            "authorization": "Bearer " + CommunityGarden.encode64(keypair as string),
            "Braintree-Version": "2021-02-26",
            "Content-Type": "application/json",
        }
    })






    const query = gql`query {
        ping
    }`

    const mut2 = gql`mutation chargePaymentMethod($input: ChargePaymentMethodInput!) {
        chargePaymentMethod(input: $input) {
          transaction {
            id
            status
          }
        }
      }`

    const mut3 = gql`mutation {
        createClientToken {
          clientToken
        }
      }`

    const paymentMethodIdVALUE = "";

    const vars_1 = {
        input: {
            paymentMethodId: `${paymentMethodIdVALUE}`,
            transaction: {
                amount: 20
            }
        }
    }

    await BraintreeClient.request(mut2, vars_1)
        .then(data => console.log(data))
        .catch(err => {
            console.log("Community Garden Error:\n", err.response.errors[0])
        })

    await BraintreeClient.request(mut3)
        .then(data => console.log(data))
        .catch(err => {
            console.log("Community Garden Error:\n", err.response.errors[0])
        })


    await BraintreeClient.request(query)
        .then(data => console.log(data))
        .catch(err => {
            console.log("Community Garden Error:\n", err.response.errors)
        })
    return true;
}*/