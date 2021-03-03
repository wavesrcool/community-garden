import { Account } from "../Topology/Account";
import { Farm } from "../../Graph/Topology/Farm";
import { Arg, Query, Resolver } from "type-graphql";
import { createQueryBuilder } from "typeorm";

@Resolver()
export class CommunityGarden3 {
    /*@Query(() => Boolean)
    async search(
        @Arg("list") list: SearchList,
        @Ctx() { req }: LocalFood,
    ) {

    }*/

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
