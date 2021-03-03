import "reflect-metadata";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LoginInput, SignUpAccountInput, SignUpFarmInput } from "../Topology/Figures/InputTypes";
import { PublicResponse, ErrorList } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/Validate/GraphValidate";
import GraphCompose from "../Functions/Compose/GraphCompose";
import { gql, GraphQLClient } from "graphql-request";
import CommunityGarden, { LocalFood } from "../../CommunityGarden/core";
import { Account } from "../Topology/Atlas/Account";

//import iso3166 from "../../CommunityGarden/Data/ISO3166-1.alpha2.json"

const __COOKIE__ = "localfood";


//const a = iso3166.CN
//console.log();

@Resolver()
export class CommunityGarden0 {
    @Mutation(() => Boolean)
    async testGraphQL(
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
    }

    @Mutation(() => PublicResponse)
    async signUpPublic(
        @Arg("signup_data") signup_data: SignUpAccountInput,
        @Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpPublic(signup_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.SignUpPublic(signup_data);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            req.session.publicId = resp.account.cg;
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "signUpAccount",
                        message: `Else condition: ${signup_data.username}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async signUpFarm(
        @Arg("signup_data") signup_data: SignUpFarmInput,
        @Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpFarm(signup_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.SignUpFarm(signup_data);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            req.session.publicId = resp.account.cg;
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "signUpFarm",
                        message: `Else condition: ${signup_data.username}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async login(
        @Arg("login_credentials") login_credentials: LoginInput,
        @Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        const errors: ErrorList[] | null = await GraphValidate.Login(login_credentials);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.LoginAccount(login_credentials);
        console.log("PublicResponse...\n", resp)

        if (resp.errors) {
            return { errors: resp.errors }
        }

        else if (resp.account && resp.account.farm) {
            req.session.publicId = resp.account.cg;
            req.session.farmId = resp.account.farm.cg;
            //console.log(req.session)
            return resp;
        }

        else if (resp.account && !resp.farm) {
            req.session.publicId = resp.account.cg;
            //console.log(req.session)
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "login",
                        message: `Else condition: ${login_credentials.username}`
                    }
                ],
            };
        }
    };

    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: LocalFood
    ): Promise<Boolean> {
        return new Promise(yay => req.session.destroy(err => {
            res.clearCookie(__COOKIE__);
            if (err) {
                console.log(`Community Garden, \'logout\': ${err}`);
                yay(false);
                return;
            }
            yay(true);
        }));
    };

    @Query(() => [Account])
    async accounts(): Promise<Account[]> {
        return Account.find()
    }

    @Query(() => PublicResponse)
    async account(
        @Arg("username") username: string,
        //@Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        /*if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "account",
                        message: "No publicId on cookie"
                    }
                ]
            };
        }*/
        const account = await Account.findOne({ where: { username } });
        return { account };
    }

    @Query(() => Account, { nullable: true })
    async active(
        @Ctx() { req }: LocalFood
    ) {
        if (!req.session.publicId) {
            return null;
        }

        return Account.findOne({ where: { cg: req.session.publicId } });
    }

}