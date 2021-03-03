import { LocalFood } from "../../CommunityGarden/Types";
import { Account } from "../Topology/Account";
import { VegetableCreateInput } from "../../Graph/Topology/Figures/InputTypes";
import { VegetableResponse } from "../../Graph/Topology/Figures/ObjectTypes";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import GraphValidate from "../Functions/Validate/GraphValidate";
import GraphCompose from "../Functions/Compose/GraphCompose";
import BotanicalCompose from "../Functions/Compose/BotanicalCompose";

@Resolver()
export class CommunityGarden2 {
    @Mutation(() => VegetableResponse)
    async createVegetable(
        @Arg("vegetable_data") vegetable_data: VegetableCreateInput,
        @Ctx() { req }: LocalFood
    ): Promise<VegetableResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No publicId on cookie"
                    }
                ]
            }
        }

        const acct = await Account.findOne({ where: { cg: req.session.publicId } })
        //console.log(acct)
        /*if (acct == undefined) {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No Account with publicId on cookie"
                    }
                ]
            }
        }*/

        if (acct?.farmId == null) {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No Farm on Account with publicId on cookie"
                    }
                ]
            };
        }

        const errors = await GraphValidate.CreateVegetable(vegetable_data)
        if (errors) {
            return { errors };
        }

        const botanical = await BotanicalCompose.CreateBotanicalVegetable(vegetable_data.index);

        if (!botanical) {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No BotanicalVegetable recieved"
                    }
                ]
            };
        }

        const resp: VegetableResponse = await GraphCompose.CreateVegetable(vegetable_data, acct.farmId, botanical,);
        //console.log("VegetableResponse, ", resp);
        if (resp.errors) {
            return {
                errors: resp.errors
            };
        }

        if (resp.vegetable) {
            return {
                vegetable: resp.vegetable
            };
        } else {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No vegetable on VegetableResponse"
                    }
                ]
            };
        };
    };
}