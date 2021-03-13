import * as dotenv from "dotenv";
import "reflect-metadata";
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import connectRedis from "connect-redis";
import session from "express-session";

//const { loadDocuments } = require('@graphql-tools/load');
//const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');

import CommunityGarden from "./CommunityGarden/core";

import { GraphQLFileLoader, loadSchema, mergeSchemasAsync } from "graphql-tools"
import { join } from "path";
import { CommunityGarden1 } from "./Graph/Map/CommunityGarden1";
import { CommunityGarden2 } from "./Graph/Map/CommunityGarden2";



const communitygarden = async () => {
    console.log("local food");
    dotenv.config();
    //console.log(dotenv.config());
    try {
        const PORT = process.env.HTTP_PORT;
        const COOKIE_NAME = process.env.COOKIE_NAME;
        const COOKIE_SECRET = process.env.SESSION_SECRET;
        const conn = await CommunityGarden.DatabaseConnect();
        const app = express();
        app.use(
            cors({
                origin: "http://localhost:3000",
                credentials: true
            }));

        //this must go in between app and applyMiddleware
        const RedisStore = connectRedis(session);
        const redis = new Redis();
        const bt = await CommunityGarden.BraintreeClient();

        if (process.env.NODE_ENV === "test") {
            await redis.flushall();
        }

        app.use(
            session({
                name: COOKIE_NAME,
                store: new RedisStore({
                    client: redis,
                    disableTouch: true,
                }), //cause express session to use redis
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                    httpOnly: true, //cannot access cookie from javascript frontend
                    sameSite: 'lax', // relates to csrf
                    secure: false, //cookie only works in HTTPS
                },
                saveUninitialized: false,
                secret: COOKIE_SECRET as string,
                resave: false, // doesn't continue to ping redis
            })
        );

        const local_food_graphql_schema = await buildSchema({
            resolvers: [CommunityGarden1, CommunityGarden2],
            scalarsMap: [],
            validate: false,
        })

        const bt_s = await loadSchema(join(__dirname, '../../common/bt.graphql'), {
            loaders: [
                new GraphQLFileLoader()
            ]
        });

        const community_garden_graphql_schema = await mergeSchemasAsync({
            schemas: [
                local_food_graphql_schema,
                bt_s,
            ]
        })

        const apolloServer = new ApolloServer({
            schema: community_garden_graphql_schema,
            context: ({ req, res }) => (
                {
                    req,
                    res,
                    redis,
                    bt,
                })
        });

        //creates the graphql endpoint
        apolloServer.applyMiddleware({
            app,
            cors: false // this when using cors module as express middleware
            //cors: { origin: "http://localhost:3000" } // this when not using cors as middleware
        })


        app.get('/', (_: any, res: { send: (arg0: string) => void; }) => {
            res.send('Community Garden')
        })

        app.listen(PORT, () => {
            console.log(`Community Garden server running on ${PORT}`)
            console.log(" Database: ", conn.options.database, "\n Entities: ", conn.options.entities);
        })
    }
    catch (err) {
        console.log(`Community Garden, server... ${err}`);
    }
}

/*const conn = await createConnection({
    type: 'postgres',
    database: 'localfood3',
    username: 'tyson',
    password: 'hell0tyson',
    logging: true,
    synchronize: true, //create the tables without requiring a migration... good for dev
    entities: [Account, Farm, Vegetable],
 
})*/


export default communitygarden;
