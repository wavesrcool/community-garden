import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MeasurementMap, QuantityMap } from "../Figures/ObjectTypes";
import { Farm } from "./Farm";

@ObjectType() //allows use with type graphql
@Entity()
export class Vegetable extends BaseEntity {
    @Field() // exposes this as a valid field for graphql queries
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    farmId: number;

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

    @Field()
    @Column()
    index!: string;

    @Field()
    @Column()
    nameCommon!: string;

    @Field()
    @Column()
    nameGeneric!: string;

    @Field()
    @Column()
    nameSpecificEpithet!: string;

    @ManyToOne(() => Farm, farm => farm.vegetables)
    farm: Farm;

    @Field(() => [MeasurementMap])
    @Column({ type: "jsonb", nullable: true })
    measurements: MeasurementMap[];

    @Field(() => [QuantityMap])
    @Column({ type: "jsonb", nullable: true })
    quantities: QuantityMap[];
}