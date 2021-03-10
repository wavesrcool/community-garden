import { gql } from "graphql-request";
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
        const client = await CommunityGarden.BraintreeClient();

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

        await client.request(b_query_ping, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        //console.log(input, mut2, mut3, query)
        await client.request(mut3, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        await client.request(mut2, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })

        await client.request(mut2, vars_1)
            .then(data => console.log(data))
            .catch(err => {
                console.log("Community Garden Error:\n", err.response.errors[0])
            })
    }
};