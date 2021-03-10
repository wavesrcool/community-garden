import { Account } from "../Topology/Atlas/Account";
import { Farm } from "../../Graph/Topology/Atlas/Farm";
import { Arg, Query, Resolver } from "type-graphql";
import { createQueryBuilder } from "typeorm";
import { Vegetable } from "../Topology/Atlas/Vegetable";

@Resolver()
export class CommunityGarden3 {
    @Query(() => Boolean)
    async vegetable(
        @Arg("id") id: number
    ): Promise<Boolean> {
        const v = await createQueryBuilder(Vegetable, "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("vegetable.id = :id", { id })
            .getOne()

        console.log(v)
        return true;
    }

    @Query(() => Boolean)
    async farm(
        @Arg("id") id: number
    ): Promise<Boolean> {
        const v = await createQueryBuilder(Farm, "farm")
            .leftJoinAndSelect("farm.vegetables", "vegetable")
            .leftJoinAndSelect("vegetable.map", "quantity_map")
            .where("farm.id = :id", { id })
            .getOne()

        console.log(v)
        return true;
    }

    @Query(() => Boolean)
    async farmAndVegetables(
        @Arg("id") id: number
    ) {
        const farm = await createQueryBuilder(Farm, "farm")
            .leftJoinAndSelect("farm.vegetables", "vegetable")
            .where("farm.id = :id", { id })
            .getOne();
        console.log(farm)
        return true;
    }





    @Query(() => Boolean)
    async accountAndFarm(
        @Arg("id") id: number,
    ) {
        const account = await createQueryBuilder(Account, "account")
            .leftJoinAndSelect("account.farm", "farm")
            .where("account.id = :id", { id })
            .getOne();
        console.log(account);
        //console.log(account?.farm.vegetables);
        return true;
    }
}
