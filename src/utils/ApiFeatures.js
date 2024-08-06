export class ApiFeatures {
  constructor(mongooseQury, queryString) {
    this.mongooseQury = mongooseQury;
    this.queryString = queryString;
  }
  pagination() {
    let page = this.queryString.page || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    this.mongooseQury.find().skip(skip).limit(limit);
    return this;
  }

  filter() {
    const excludeQuery = ["page", "sort", "search", "select"];
    let filterObj = { ...req.query };
    excludeQuery.forEach((el) => delete filterObj[el]);

    filterObj = JSON.parse(
      JSON.stringify(filterObj).replace(
        /(gt|lt|gte|lte|eq)/,
        (match) => `$${match}`
      )
    );
    this.mongooseQury.find(filterObj);
    return this;
  }

  sort() {
    //sort
    if (this.queryString.sort) {
      // sort taket ("price discount")
      this.mongooseQury.sort(this.queryString.sort.replace(",", " "));
    }
    return this;
  }

  select() {
    if (this.queryString.select) {
      this.mongooseQury.select(this.queryString.select.replace(",", " "));
    }
    return this;
  }

  search() {
    if (this.queryString.search) {
      this.mongooseQury.find({
        $or: [
          { title: { $regex: this.queryString.search, $options: "i" } },
          { description: { $regex: this.queryString.search, $options: "i" } },
        ],
      });
    }
    return this;
  }
}
