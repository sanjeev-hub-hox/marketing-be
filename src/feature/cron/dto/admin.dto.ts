import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";

export class WorkflowActivities {
    @IsString()
    _id: string;

    @IsString()
    display_name: string;

    @IsBoolean()
    is_default: boolean;

    @IsString()
    module_name: string;

    @IsString()
    activity_slug: string
}


export class AdminPostParamDto extends WorkflowActivities {
    @IsString()
    enquiry_number: string;

    @IsNumber()
    school_id: number

}
