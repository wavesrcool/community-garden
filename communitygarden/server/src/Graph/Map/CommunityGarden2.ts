import { LocalFood } from "server/src/CommunityGarden/core";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import GraphShape2 from "../Functions/GraphShape2";
import GraphValidate from "../Functions/GraphValidate";
import { UpdateAccountIdentityInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateFarmIdentityInput, UpdateFarmDeliveryGradientInput } from "../Topology/Figures/InputTypes";
import { AccountResponse, ErrorList } from "../Topology/Figures/ObjectTypes";

@Resolver()
export class CommunityGarden2 {
    @Mutation(() => AccountResponse)
    async updateAccountIdentity(
        @Arg("input") input: UpdateAccountIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: "Community Garden Map 2: Error 1"
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountIdentity(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape2.UpdateAccountIdentity(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... updateAccountIdentity, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: "Community Garden Map 2: Error 2"
                    }
                ],
            };
        }
    };

    @Mutation(() => AccountResponse)
    async updateAccountEmail(
        @Arg("input") input: UpdateAccountEmailInput,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: "Community Garden Map 2: Error 1"
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountEmail(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape2.UpdateAccountEmail(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... updateAccountEmail, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: "Community Garden Map 2: Error 2"
                    }
                ],
            };
        }
    };

    @Mutation(() => AccountResponse)
    async updateAccountGeocode(
        @Arg("input") input: UpdateAccountGeocodeInput,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: "Community Garden Map 2: Error 1"
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountGeocode(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape2.UpdateAccountGeocode(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... updateAccountGeocode, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: "Community Garden Map 2: Error 2"
                    }
                ],
            };
        }
    }

    @Mutation(() => AccountResponse)
    async updateFarmIdentity(
        @Arg("input") input: UpdateFarmIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: "Community Garden Map 2: Error 1"
                    }
                ],
            };
        }

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: "Community Garden Map 2: Error 2"
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateFarmIdentity(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape2.UpdateFarmIdentity(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... updateFarmIdentity, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: "Community Garden Map 2: Error 3"
                    }
                ],
            };
        }
    };

    @Mutation(() => AccountResponse)
    async updateFarmDeliveryGradient(
        @Arg("input") input: UpdateFarmDeliveryGradientInput,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateFarmDeliveryGradient",
                        message: "Community Garden Map 2: Error 1"
                    }
                ],
            };
        }

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "updateFarmDeliveryGradient",
                        message: "Community Garden Map 2: Error 2"
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateFarmDeliveryGradient(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape2.UpdateFarmDeliveryGradient(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... updateFarmDeliveryGradient, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateFarmDeliveryGradient",
                        message: "Community Garden Map 2: Error 3"
                    }
                ],
            };
        }
    }
}
