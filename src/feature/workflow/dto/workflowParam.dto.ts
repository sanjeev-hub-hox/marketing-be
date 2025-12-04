import { IsObject, IsOptional, IsString } from 'class-validator';

export class WorkflowLogsParamDto {
  @IsString()
  activity_slug: string;

  @IsString()
  module_name: string;

  @IsString()
  module_id: string;

  @IsString()
  reference_id: string;

  @IsOptional()
  @IsString()
  attachment_links?: string[];

  @IsString()
  lob_id: string;

  @IsObject()
  subject_variables: Record<string, any>;

  @IsObject()
  description_variables: Record<string, any>;

  @IsString()
  redirection_link: string;
}

export class OtherParamDto {
  @IsObject()
  subject_variables: Record<string, any>;

  @IsObject()
  description_variables: Record<string, any>;
}
