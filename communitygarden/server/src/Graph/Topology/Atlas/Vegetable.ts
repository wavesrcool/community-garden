import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VegetableName, VegetableState } from "../Figures/EnumTypes";
import { Farm } from "./Farm";
import { QuantityMap } from "./QuantityMap";

@ObjectType()
@Entity()
export class Vegetable extends BaseEntity {
    @Field()
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
    farmId: number;

    @Field(() => Farm)
    @ManyToOne(() => Farm, farm => farm.vegetables, { onDelete: "CASCADE" })
    @JoinColumn()
    farm: Farm;

    @Field(() => VegetableName)
    @Column()
    name: VegetableName;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    other_name: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    variety: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    nameGeneric: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    nameSpecificEpithet: string;

    @Field(() => [QuantityMap], { nullable: true })
    @OneToMany(() => QuantityMap, q => q.vegetable)
    map: QuantityMap[];

    @Field(() => VegetableState)
    @Column()
    state: VegetableState;
}