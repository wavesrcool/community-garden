import { Farm } from "../../Graph/Topology/Farm";
import { GeolocationInput } from "../../Graph/Topology/Figures/InputTypes";
import { toRadians } from "spherical-geometry-js";
import { Arg, Mutation, Resolver } from "type-graphql";
import { getManager } from "typeorm";

@Resolver()
export class CommunityGarden4 {
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
}