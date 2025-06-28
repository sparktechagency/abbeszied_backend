import { FilterQuery, Query } from 'mongoose';
import AppError from '../error/AppError';
import httpStatus from 'http-status';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  filter() {
    const excludeFields = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
      'minPrice',
      'maxPrice',
      'maxSalary',
      'minSalary',
      'languages',
    ];
    const queryObj = { ...this.query };
    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate(defaultLimit = 10) {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  priceRange() {
    const priceFilter: Record<string, unknown> = {};
    const minPrice = this.query?.minPrice
      ? Number(this.query.minPrice)
      : undefined;
    const maxPrice = this.query?.maxPrice
      ? Number(this.query.maxPrice)
      : undefined;

    if (minPrice !== undefined && !isNaN(minPrice)) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      priceFilter.$lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      } as FilterQuery<T>);
    }
    return this;
  }
  experienceRange() {
    const experienceFilter: Record<string, unknown> = {};
    const minExperience = this.query?.minExperience
      ? Number(this.query.minExperience)
      : undefined;
    const maxExperience = this.query?.maxExperience
      ? Number(this.query.maxExperience)
      : undefined;

    if (minExperience !== undefined && !isNaN(minExperience)) {
      experienceFilter.$gte = minExperience;
    }
    if (maxExperience !== undefined && !isNaN(maxExperience)) {
      experienceFilter.$lte = maxExperience;
    }
    if (Object.keys(experienceFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        experience: experienceFilter,
      } as FilterQuery<T>);
    }
    return this;
  }
  
  salaryRange() {
    const minSalary = this.query?.minSalary
      ? Number(this.query.minSalary)
      : undefined;
    const maxSalary = this.query?.maxSalary
      ? Number(this.query.maxSalary)
      : undefined;
  
    const salaryFilters = [];
  
    if (minSalary !== undefined && !isNaN(minSalary)) {
      salaryFilters.push({ 'salary.max': { $gte: minSalary } });
    }
  
    if (maxSalary !== undefined && !isNaN(maxSalary)) {
      salaryFilters.push({ 'salary.max': { $lte: maxSalary } });
    }
  
    if (salaryFilters.length > 0) {
      this.modelQuery = this.modelQuery.find({
        $and: salaryFilters
      } as FilterQuery<T>);
    }
  
    return this;
  }
  languageFilter() {
    let languages = this.query?.languages;
    
    // Handle comma-separated string from query params
    if (typeof languages === 'string') {
      languages = languages.split(',').map((lang: string) => lang.trim());
    }
    
    if (languages && Array.isArray(languages) && languages.length > 0) {
      // Filter jobs that have any of the specified languages
      this.modelQuery = this.modelQuery.find({
        language: { $in: languages }
      } as FilterQuery<T>);
    }
    
    return this;
  }
  async countTotal() {
    try {
      const totalQueries = this.modelQuery.getFilter();
      const total = await this.modelQuery.model.countDocuments(totalQueries);
      const page = Number(this.query?.page) || 1;
      const limit = Number(this.query?.limit) || 10;
      const totalPage = Math.ceil(total / limit);

      return { page, limit, total, totalPage };
    } catch (error) {
      throw new AppError(httpStatus.SERVICE_UNAVAILABLE, error as string);
    }
  }
}

export default QueryBuilder;
