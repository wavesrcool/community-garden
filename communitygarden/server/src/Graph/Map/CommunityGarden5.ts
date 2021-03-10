import { Arg, Query, Resolver } from "type-graphql";
import { createQueryBuilder } from "typeorm";
import { Farm } from "../Topology/Atlas/Farm";
import { FarmPage } from "../Topology/Figures/ObjectTypes";

@Resolver()
export class CommunityGarden5 {
    @Query(() => FarmPage)
    async farmPage(
        @Arg("id") id: string
    ): Promise<FarmPage | undefined> {
        const farm = await createQueryBuilder(Farm, "farm")
            .leftJoinAndSelect("farm.vegetables", "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("farm.cg = :cg", { cg: id })
            .getOne()
        console.log("farm2", farm)

        // index vegetable: id farmId state
        /*const available_vegetables = await createQueryBuilder(Vegetable, "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("vegetable.farmId = :id", { id })
            .andWhere("vegetable.state = :state", { state: "available" })
            .getMany()

        const growing_vegetables = await createQueryBuilder(Vegetable, "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("vegetable.farmId = :id", { id })
            .andWhere("vegetable.state = :state", { state: "unlisted" })
            .getMany()

        const vegetables = await createQueryBuilder(Vegetable, "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("vegetable.farmId = :id", { id })
            .getMany()

        console.log("vs..", vegetables)


        /*const avail = vegetables.map(
            (vegetable, _index, _array) => {
                if (vegetable.state == VegetableState.UNLISTED) {
                    return vegetable.name
                } else {
                    return
                }
            }
        );


        console.log("available vegetables...", available_vegetables)
        console.log("unlisted vegetables...", growing_vegetables)*/


        if (!farm?.farm_name) {
            return undefined;
        }

        return {
            farm_name: farm.farm_name,
            available_vegetables: ["yes"],
            growing_vegetables: ["yes"],
            vegetables: farm.vegetables,

        }
    }

}