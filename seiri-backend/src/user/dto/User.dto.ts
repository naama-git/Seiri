import { OmitType, PartialType } from "@nestjs/swagger";
import { IsEmail, Length, MaxLength } from "class-validator";
import { User } from "../user.entity";
import { EntityNotFoundError } from "typeorm";


export class CreateUserDto {


    @MaxLength(100)
    name: string;

    @IsEmail()
    email: string;

    @Length(6, 50)
    password: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }

export class ReadUserDTO extends OmitType(CreateUserDto, ['password']) {

    constructor(entity: User | null) {
        if (!entity) return
        super();
        this.id = entity.id
        this.email = entity.email
        this.name = entity.name
        this.isActive = entity.isActive
        this.role = entity.role
    }

    id: number
    role: 'User' | 'Admin'
    isActive: boolean
}