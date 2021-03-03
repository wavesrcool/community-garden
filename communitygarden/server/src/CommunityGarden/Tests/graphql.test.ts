import { request } from "graphql-request";

const run = process.env.COMMUNITY_GARDEN;
const mutation = `mutation {
    testGraphQL(communitygarden: "${run}")
}`

test("GraphQL config", async () => {
    const response = await request("http://localhost:4001/graphql", mutation);
    //console.log(response);
    expect(response).toEqual({ testGraphQL: true });
})