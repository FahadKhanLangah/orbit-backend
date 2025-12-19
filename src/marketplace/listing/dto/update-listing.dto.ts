import { PartialType } from '@nestjs/mapped-types'; // npm i @nestjs/mapped-types
import { PostListingDto } from './post-listing.dto';


export class UpdateListingDto extends PartialType(PostListingDto) { }