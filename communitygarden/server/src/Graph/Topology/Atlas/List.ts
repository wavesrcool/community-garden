import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { iso3166 } from "../Figures/EnumTypes";

@ObjectType()
@Entity()
export class List extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column()
    @Generated("uuid")
    cg: string;

    @Field()
    @Column()
    from: string; //cg

    @Field()
    @Column()
    to: string; //cg, ... or unsigned

    @Field()
    @Column()
    node: string;

    @Field()
    @Column()
    map: string;

    @Field(() => Int)
    @Column()
    quantity: number;

    @Field(() => Float)
    @Column()
    number: number;

    @Field(() => iso3166)
    @Column()
    symbol: iso3166;
    /*
    @Field(() => [GraphField])
    @Column({ type: "jsonb" })
    graph_field: GraphField[];

    @Field(() => [Tree], { nullable: true })
    @Column({ type: "jsonb", nullable: true })
    tree: Tree[];*/



}