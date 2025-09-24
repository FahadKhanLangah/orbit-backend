import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./category.schema";
import { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async findAll(onlyActive: boolean = false): Promise<Category[]> {
    const filter = onlyActive ? { isActive: true } : {};
    return this.categoryModel.find(filter).exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return category;
  }

  async findByName(name: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ name: name });
    if (!category) {
      throw new NotFoundException(`Category with this "${name}" not found.`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true }
    );
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return { message: "Category deleted successfully" };
  }
}
