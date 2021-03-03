import { request } from "graphql-request"
import { farm_values, signUpFarm } from "./GraphQL/Farm_Layer0";
import { public_values, signUpPublic, loginPublic } from "./GraphQL/Public_Layer0"

test("Sign Up: Public", async () => {
    const response = await request("http://localhost:4001/graphql", signUpPublic);

    expect(response.signUpPublic.errors).toEqual(null)

    expect(response.signUpPublic.account).toEqual(
        {
            farmId: null,
            first_name: public_values.first_name,
            last_name: public_values.last_name,
            birth_date: public_values.birth_date,
            email: public_values.email,
            username: public_values.username,
            geocode: {
                geolocation: {
                    lat: public_values.geocode.geolocation.lat,
                    lng: public_values.geocode.geolocation.lng,
                }
            }
        }
    );

    expect(response.signUpPublic.farm).toEqual(null)
});

test("Login: Public", async () => {
    const response = await request("http://localhost:4001/graphql", loginPublic);

    expect(response.login.errors).toEqual(null)

    expect(response.login.account).toEqual(
        {
            farmId: null,
            first_name: public_values.first_name,
            last_name: public_values.last_name,
            birth_date: public_values.birth_date,
            email: public_values.email,
            username: public_values.username,
            geocode: {
                geolocation: {
                    lat: public_values.geocode.geolocation.lat,
                    lng: public_values.geocode.geolocation.lng,
                }
            }
        }
    );
});

test("Sign Up: Farm", async () => {
    const response = await request("http://localhost:4001/graphql", signUpFarm);

    expect(response.signUpFarm.errors).toEqual(null)

    expect(response.signUpFarm.account).toEqual(
        {
            first_name: farm_values.first_name,
            last_name: farm_values.last_name,
            birth_date: farm_values.birth_date,
            email: farm_values.email,
            username: farm_values.username,
            geocode: {
                geolocation: {
                    lat: farm_values.geocode.geolocation.lat,
                    lng: farm_values.geocode.geolocation.lng,
                }
            },
        }
    );
    console.log(response.signUpFarm.farm)

    expect(response.signUpFarm.farm).toEqual(
        {
            farm_name: farm_values.farm_name,
            geocode: {
                geolocation: {
                    lat: farm_values.geocode.geolocation.lat,
                    lng: farm_values.geocode.geolocation.lng,
                }
            },
            delivery_gradient: [
                {
                    radius: 5,
                    cost: 5
                },
                {
                    radius: 10,
                    cost: 7
                },
                {
                    radius: 20,
                    cost: 10
                },
            ]
        }
    );
});