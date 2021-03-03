import { gql, GraphQLClient } from "graphql-request";
import CommunityGarden from "../../CommunityGarden/core";
import { Query, Resolver } from "type-graphql";



/**
 * @flow 
 * 
 * 
 * The server generates a client token and sends it back to the client sdk
 *     
 *  Vault the single-use payment method information, permanently storing it for future use; this results in a new multi-use payment method
    Charge the single-use payment method
 * 
 */

@Resolver()
export class CommunityGarden6 {
    @Query(() => Boolean)
    async authorizeCreditCard(
    ) {
        const endpoint = process.env.BRAINTREE_SANDBOX_API_ENDPOINT;

        const keypair = process.env.BRAINTREE_SANDBOX_PUBLIC_KEY + ":" + process.env.BRAINTREE_SANDBOX_PRIVATE_KEY;
        //console.log("keypair, ", keypair);


        const BraintreeClient = new GraphQLClient(endpoint as string, {
            headers: {
                "authorization": "Bearer " + CommunityGarden.encode64(keypair as string),
                "Braintree-Version": "2021-02-26",
                "Content-Type": "application/json",
            }
        });

        const b_query_ping = gql`query {
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
              clientToken: input TypeInput {
                  
              }
            }
          }`

        const vars_1 = {
            input: {
                paymentMethodId: 1,
                transaction: {
                    amount: 20
                }
            }
        }

        await BraintreeClient.request(b_query_ping, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        //console.log(input, mut2, mut3, query)
        await BraintreeClient.request(mut3, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        await BraintreeClient.request(mut2, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        await BraintreeClient.request(mut2, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })
    }
};