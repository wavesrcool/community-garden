import "reflect-metadata";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { SignUpPublicInput, SignUpFarmInput, UpdateAccountIdentityInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, DualCredential } from "../Topology/Figures/InputTypes";
import { PublicResponse, ErrorList, SignUpResponse, GraphResponse } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/GraphValidate";
import GraphCompose from "../Functions/GraphCompose";
import { LocalFood } from "../../CommunityGarden/core";
import { Account } from "../Topology/Atlas/Account";

@Resolver()
export class CommunityGarden0 {
    @Mutation(() => SignUpResponse)
    async signUpPublic(
        @Arg("input") input: SignUpPublicInput,
        @Ctx() { req }: LocalFood,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpPublic(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphCompose.SignUpPublic(input);
        console.log("SignUpPublic...", resp)

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account) {
            return {
                errors: [
                    {
                        path: "signUpAccount",
                        message: `Bad response: ${resp}`
                    }
                ],
            };
        }

        req.session.publicId = resp.account;

        /*
        await CommunityGarden.SendEmail(
            {
                to: input.email,
                from: "wavesrcool@icloud.com",
                subject: "Verify your email address",
                text: `${resp.account}`
            }
        );*/

        return {
            username: resp.username,
            account: resp.account,
        }
    };

    @Mutation(() => SignUpResponse)
    async signUpFarm(
        @Arg("input") input: SignUpFarmInput,
        @Ctx() { req }: LocalFood,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpFarm(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphCompose.SignUpFarm(input);
        console.log("SignUpFarm...", resp)

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account || !resp.farm) {
            return {
                errors: [
                    {
                        path: "signUpFarm",
                        message: `Bad response: ${resp}`
                    }
                ],
            };
        }

        req.session.publicId = resp.account;
        req.session.farmId = resp.farm;

        /*
        await CommunityGarden.SendEmail(
            {
                to: input.email,
                from: "wavesrcool@icloud.com",
                subject: "Verify your email address",
                text: `${resp.account}`
            }
        );*/

        return {
            username: resp.username,
            account: resp.account,
            farm: resp.farm,
        }
    }

    @Mutation(() => Boolean)
    async signUpVerifyEmail(
        @Arg("input") input: string
    ): Promise<Boolean> {
        if (input) {
            return true
        }
        return false
    }

    @Mutation(() => PublicResponse)
    async login(
        @Arg("login_credentials") login_credentials: DualCredential,
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

        else if (resp.account && !resp.account.farm) {
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
            res.clearCookie(process.env.COOKIE_NAME as string);
            if (err) {
                console.log(`Community Garden, \'logout\': ${err}`);
                yay(false);
                return;
            }
            yay(true);
        }));
    };

    @Mutation(() => Boolean)
    async deleteAccount(
        @Arg("input") input: DualCredential,
        @Ctx() { req, res }: LocalFood
    ): Promise<Boolean> {
        if (!req.session.publicId) {
            console.log(`Community Garden, \'deleteAccount\' cookie: ${req.session.publicId}`);
            return false;
        }
        const resp: GraphResponse = await GraphCompose.DeleteAccount(input, req.session.publicId);

        if (resp.errors) {
            console.log(`Community Garden, \'deleteAccount\' errors: ${resp.errors[0].message}`);
            return false;
        }

        if (resp.deleted == true) {
            return new Promise(yay => req.session.destroy(err => {
                res.clearCookie(process.env.COOKIE_NAME as string);
                if (err) {
                    console.log(`Community Garden, \'deleteAccount\' destroy... : ${err}`);
                    yay(false);
                    return;
                }
                yay(true);
            }));
        } else {
            console.log(`Community Garden, \'deleteAccount\': else condition`);
            return false;
        }
    }

    @Mutation(() => Boolean)
    async deleteFarm(
        @Arg("input") input: DualCredential,
        @Ctx() { req }: LocalFood
    ): Promise<Boolean> {
        if (!req.session.publicId || !req.session.farmId) {
            console.log(`Community Garden, \'deleteAccount\' cookie: ${req.session.publicId}, ${req.session.farmId}`);
            return false;
        }
        const resp: GraphResponse = await GraphCompose.DeleteFarm(input, req.session.publicId, req.session.farmId);
        console.log("deleteFarm,", resp)
        if (resp.errors) {
            console.log(`Community Garden, \'deleteAccount\' errors: ${resp.errors[0].message}`);
            return false;
        }
        else if (resp.deleted == true) {
            return true
        }
        else {
            return false;
        }
    }

    @Mutation(() => PublicResponse)
    async updateAccountIdentity(
        @Arg("input") input: UpdateAccountIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountIdentity(input);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountIdentity(input, req.session.publicId);
        console.log("updateAccountIdentity", resp);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async updateAccountEmail(
        @Arg("input") input: UpdateAccountEmailInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountEmail(input);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountEmail(input, req.session.publicId);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            //console.log(resp);
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async updateAccountGeocode(
        @Arg("input") input: UpdateAccountGeocodeInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountGeocode(input);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountGeocode(input, req.session.publicId);
        console.log("updateAccountGeocode", resp);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
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