import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CheckIdentifierDto {

  @ApiProperty({
    description: "User's email address or phone number",
    example: "john@example.com" + " OR " + "+919876543210",
    oneOf: [
      { type: "string", example: "john@example.com" },
      { type: "string", example: "+919876543210" }
    ],
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;
}
