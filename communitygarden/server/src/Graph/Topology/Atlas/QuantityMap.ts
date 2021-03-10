import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { iso3166, MassUnit } from "../Figures/EnumTypes";
import { Vegetable } from "./Vegetable";

@ObjectType()
@Entity()
export class QuantityMap extends BaseEntity {
    @Field() // exposes this as a valid field for graphql queries
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @CreateDateColumn()
    updatedAt: Date;

    @Field()
    @Column()
    @Generated("uuid")
    cg!: string;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    vegetableId: number;

    @Field(() => Vegetable)
    @ManyToOne(() => Vegetable, vegetable => vegetable.map, { onDelete: "CASCADE" })
    vegetable: Vegetable;

    @Field(() => Int)
    @Column()
    available: number;

    @Field(() => Float, { nullable: true })
    @Column({ nullable: true })
    mass: number;

    @Field(() => MassUnit, { nullable: true })
    @Column({ nullable: true })
    mass_unit: MassUnit;

    @Field()
    @Column()
    tag: string;

    @Field(() => Float)
    @Column()
    valuation: number;

    @Field(() => iso3166)
    @Column()
    currency: iso3166;
}

