import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DeliveryGradient } from "../Figures/ObjectTypes";
import { Farm } from "./Farm";

@ObjectType()
@Entity()
export class Geodesic extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    farmId: number;

    @Field(() => Farm)
    @OneToOne(() => Farm, farm => farm.geodesic, { onDelete: "CASCADE" })
    @JoinColumn()
    farm: Farm;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_r: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_r: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_min: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_max: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_min: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_max: number;

    @Field(() => Float)
    @Column({ type: "float" })
    ar: number;

    @Field(() => Float)
    @Column({ type: "float" })
    delta_lon: number;

    @Field(() => [DeliveryGradient])
    @Column({ type: "jsonb" })
    delivery_gradient: DeliveryGradient[];
}