import { LocalFood } from "./../../../src/CommunityGarden/core";
import { Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { gql } from "graphql-request";
import { Account } from "../Topology/Atlas/Account";


@ObjectType()
class Light {
    @Field()
    cg?: string;
    @Field()
    clientToken?: string;
    @Field()
    errors?: boolean;
}

@Resolver()
export class CommunityGarden7 {
    @Query(() => Boolean)
    async test_braintree(
        @Ctx() { bt }: LocalFood
    ) {
        const query_ping = gql`query { ping }`
        const result = await bt.request(query_ping);
        return (result.ping === "pong");
    }

    @Mutation(() => Light)
    async cgio_createClientToken(
        @Ctx() { req, bt }: LocalFood
    ): Promise<Light> {
        const account = await Account.findOne({ where: { cg: req.session.publicId } });
        if (!account) {
            return {
                errors: true,
            };
        }
        const query_createClientToken = gql`mutation {
            createClientToken {
              clientToken
            }
          }`
        const result = await bt.request(query_createClientToken);
        if (!result.createClientToken.clientToken) {
            return {
                errors: true
            }
        }
        return {
            cg: account.cg,
            clientToken: result.createClientToken.clientToken,
        }
    }
};