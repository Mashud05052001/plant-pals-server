import { Query } from 'mongoose';

const defaultLimit = 10;

class QueryBuilder<T> {
  constructor(
    public modelQuery: Query<T[], T>,
    public query: Record<string, unknown>,
  ) {}

  /* 
    Search function means searching with a specific keyword on different fields like searching "apple" on product name, category, description etc.
    INPUT  =>  ?searchTerm=value  
    QueryMaking => { $or : [ {fieldName : value}, {fieldName : value} ] } 
  */
  search(searchableFields: string[], sortFields: string = '') {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      const searchCondition = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
      this.modelQuery = this.modelQuery
        .find({
          $or: searchCondition,
        })
        .sort(sortFields);
    }
    return this;
  }

  /*
    Range function means filtering products with price or quantity or any other number related fields. Fielda my be single or multiple
    INPUT = Single item dile string & multiple item dile as an array hisebe ashbe
      1.  ?range=pricePerSlot:gte=120,lte=200  =>  this.query?.range  =>  pricePerSlot:gte=120,lte=200
      2.  ?range=pricePerSlot:gte=200,lte=200&range=capacity:gte=200  =>  this.query?.range  =>  ['pricePerSlot:gte=200,lte=200', 'capacity:gte=200,lte=200']
    QueryMaking => 
      1.  { pricePerSlot: { '$gte': 120, '$lte': 200 } }
      2.  { pricePerSlot: { '$gte': 200, '$lte': 200 }, capacity: { '$gte': 200 } }
  */
  range() {
    const query: Record<string, Record<string, number>> = {};
    const queryValue = this.query?.range;

    if (queryValue) {
      // prettier-ignore
      const rangeArr: string[] = Array.isArray(queryValue) ? queryValue : [queryValue];

      rangeArr.forEach((range) => {
        const [field, conditions] = range.split(':');
        query[field] = {};
        conditions.split(',').forEach((condition) => {
          const [operator, value] = condition.split('=');
          query[field][`$${operator}`] = Number(value);
        });
      });

      this.modelQuery = this.modelQuery.find(query);
    }
    return this;
  }

  /*
    Filter function means searching on filed with specific values. That's why we hanve to remove orher query like searchTerm, page, limit, sort, fields property from the query. 
    INPUT = Always object hisebe thakbe cause amra query kei common keys remove kore others query niye kaj kortechi
      1.  ?amenities=24/7 Room Access&roomNo=201  =>  copyQuery  =>  { amenities: '24/7 Room Access', roomNo: '201' }
      2.  ??name=Meeting Room,Conferance Room  =>  copyQuery  =>  { name: 'Meeting Room,Conferance Room' }
    QueryMaking => 
      1.  { amenities: { '$in': [ '24/7 Room Access' ] }, roomNo: { '$in': [ '201' ] } }
      2.  { name: { '$in': [ 'Meeting Room', 'Conferance Room' ] } }
  */
  filter(sortFields: string = '') {
    const copyQuery = { ...this.query };
    const excludeFields = ['searchTerm', 'page', 'limit', 'sort', 'fields'];

    excludeFields.forEach((field) => delete copyQuery[field]);
    if (copyQuery) {
      const query: Record<string, unknown> = {};
      for (const item in copyQuery) {
        const value = copyQuery[item] as string;
        query[item] = {
          $in: value.includes(',') ? value.split(',') : value,
        };
      }
      this.modelQuery = this.modelQuery.find(query).sort(sortFields);
    }
    return this;
  }

  /* 
    Sort function means sorting items with single or multiple acsending or descending values
    INPUT  =>  ?sort=fieldName1,-fieldName2
    QueryMaking => "fieldName1 -fieldName2" 
  */
  sort() {
    if (this.query?.sort) {
      const sort = this.query.sort as string;
      const sortQuery = sort.includes(',') ? sort.split(',').join(' ') : sort;
      this.modelQuery = this.modelQuery.sort(sortQuery);
    }
    return this;
  }

  /* 
    Fields function means specifically told the server that those some field is my need only
    INPUT  =>  ?fields=fieldName1,-fieldName2
    QueryMaking => "fieldName1 -fieldName2" 
  */
  fields() {
    if (this.query?.fields) {
      const fields = this.query.fields as string;
      const fieldsQuery = fields.includes(',')
        ? fields.split(',').join(' ')
        : fields;
      this.modelQuery = this.modelQuery.select(fieldsQuery);
    }
    return this;
  }

  //  Pagination => only have 2 properties.  ?limit=numberValue&page=numberValue
  paginate() {
    let limit = defaultLimit;
    if (this.query?.limit || this.query?.page) {
      let page = 1,
        skip = 0;
      if (this?.query?.limit) limit = Number(this.query.limit);
      if (this?.query?.page) page = Number(this.query.page);
      skip = limit * (page - 1);
      this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    } else {
      this.modelQuery = this.modelQuery.limit(limit);
    }
    return this;
  }

  // Using this function for generate metadata which is used for pagination.
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const totalData = await this.modelQuery.model.countDocuments(totalQueries);
    let limit = this.query?.limit
      ? Number(this.query.limit)
      : Number(defaultLimit);
    limit = totalData < limit ? totalData : limit;
    const page = this.query?.page ? Number(this.query?.page) : 1;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalData / limit);
    return {
      totalData,
      limit,
      page,
      skip,
      totalPage,
    };
  }
}

export default QueryBuilder;

/*
QueryBuilder Usage
const roomQuery = new QueryBuilder(ModelName.find(), query)
    .search(['']) // put saerchable filedname here where you want to saerch
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const meta = await roomQuery.countTotal();
  const result = await roomQuery.modelQuery;

  return {
    data: result,
    meta,
  };
*/
