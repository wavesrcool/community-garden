import { LocalFood } from "../../../src/CommunityGarden/core"
import { Arg, Ctx, Mutation, Resolver } from "type-graphql"
import GraphCompose from "../Functions/GraphCompose"
import GraphValidate from "../Functions/GraphValidate"
import { Account } from "../Topology/Atlas/Account"
import { QuantityMapCreateInput, VegetableCreateInput } from "../Topology/Figures/InputTypes"
import { ErrorList, VegetableResponse } from "../Topology/Figures/ObjectTypes"

@Resolver()
export class CommunityGarden2 {
    @Mutation(() => VegetableResponse)
    async createVegetable(
        @Arg("input") input: VegetableCreateInput,
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

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "createVegetable",
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
                        path: "createVegetable",
                        message: "No Account with cg = publicId"
                    }
                ]
            }
        }


        if (acct.farmId === null) {
            return {
                errors: [
                    {
                        path: "createVegetable",
                        message: "No Farm on Account with cg = publicId"
                    }
                ]
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.CreateVegetable(input)
        if (errors) {
            return { errors };
        }

        const resp: VegetableResponse = await GraphCompose.CreateVegetable(input, acct.farmId);
        console.log("VegetableResponse, ", resp);
        if (resp.errors) {
            return {
                errors: resp.errors
            };
        }

        else if (resp.vegetable) {
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
    }

    @Mutation(() => VegetableResponse)
    async createVegetableQuantityMap(
        @Arg("input") input: QuantityMapCreateInput,
        //@Ctx() { req }: LocalFood
    ): Promise<VegetableResponse> {
        const errors = await GraphValidate.CreateVegetableQuantityMap(input)
        if (errors) {
            return { errors }
        }

        const resp: VegetableResponse = await GraphCompose.CreateVegetableQuantityMap(input)
        console.log("resp", resp)
        /*if (resp.errors) {
            return {
                errors: resp.errors
            }
        }*/

        if (!resp.vegetable) { //&& resp.quantity_map)) {
            return {
                errors: [
                    {
                        path: "createVegetableQuantityMap",
                        message: "Insufficient GraphCompose return"
                    }
                ]
            };
        }

        return {
            vegetable: resp.vegetable,
            //quantity_map: resp.quantity_map
        }
    }
}