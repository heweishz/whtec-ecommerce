const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //Copy req.query
  const reqQuery = { ...req.query };
  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => {
    return delete reqQuery[param];
  });

  for (const [key, value] of Object.entries(reqQuery)) {
    reqQuery[key] = { $regex: value, $options: 'i' };
  }

  //Create query string
  let queryString = JSON.stringify(reqQuery);
  // Create operators ($gt, $gte, etc)
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  //Finding resource
  query = model.find(JSON.parse(queryString));
  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  //Sort
  if (req.query.sort) {
    const sortby = req.query.sort.split(',').join(' ');
    query = query.sort(sortby);
  } else {
    query = query.sort('-createdAt');
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 8;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryString));
  query = query.skip(startIndex).limit(limit);
  //Populate
  let scopePopulate = populate;
  if (req.query.populate === '-1') {
    scopePopulate = false;
  } else {
    if (scopePopulate) {
      query = query.populate(scopePopulate);
    }
  }

  //Executing query
  const results = await query;
  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    products: results,
    page,
    pages: Math.ceil(total / limit),
  };

  next();
};

export default advancedResults;
