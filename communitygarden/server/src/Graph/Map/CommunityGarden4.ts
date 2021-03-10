/*import { Farm } from "../../Graph/Topology/Atlas/Farm";
import { GeolocationInput, ListAddInput } from "../../Graph/Topology/Figures/InputTypes";
import { toRadians } from "spherical-geometry-js";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import { LocalFood } from "server/src/CommunityGarden/core";
import { ListResponse } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/GraphValidate";
import GraphCompose from "../Functions/GraphCompose";
import { Account } from "../Topology/Atlas/Account";

@Resolver()
export class CommunityGarden4 {
    @Mutation(() => ListResponse)
    async listAdd(
        @Arg("input") input: ListAddInput,
        @Ctx() { req }: LocalFood
    ): Promise<ListResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "listAdd",
                        message: "No publicId on cookie"
                    }
                ]
            }
        }

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "listAdd",
                        message: "No farmId on cookie"
                    }
                ]
            }
        }

        const acct = await Account.findOne({ where: { cg: req.session.publicId } })
        console.log(acct)
        if (acct === undefined) {
            return {
                errors: [
                    {
                        path: "listAdd",
                        message: "No Account with publicId on cookie"
                    }
                ]
            }
        }


        if (acct.farmId === null) {
            return {
                errors: [
                    {
                        path: "listAdd",
                        message: "No Farm on Account with publicId on cookie"
                    }
                ]
            };
        }

        const errors = await GraphValidate.ListAdd(input);

        if (errors) {
            return {
                errors: [
                    {
                        path: "listAdd",
                        message: "No Farm on Account with publicId on cookie"
                    }
                ]
            };
        }

        const resp = await GraphCompose.ListAdd(input, acct.farm.cg);



        console.log(resp)

        return {
            list: resp?.list
        }
    }

    @Mutation(() => String)
    async distance(
        @Arg("pos") pos: GeolocationInput
    ) {
        return `${pos}`
    }

    @Mutation(() => [Farm])
    async searchList(
        //@Arg("search") search: string,
        @Arg("pos") pos: GeolocationInput
    ): Promise<Farm[] | undefined> {
        const query_lat = toRadians(pos.lat);
        const query_lng = toRadians(pos.lng);
        try {
            const farms = await getManager()
                .query(`SELECT * FROM Farm WHERE (${query_lat} >= lat_min AND ${query_lat} <= lat_max) AND (${query_lng} >= lng_min AND ${query_lng} <= lng_max) AND acos(sin(lat_m) * sin(${query_lat}) + cos(lat_m) * cos(${query_lat}) * cos(lng_m-(${query_lng}))) <= delivery_r;`)

            return farms;
        } catch (err) {
            console.log(`${err}`);
        }
        return undefined;
    }
}*/