const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    // const products = await Product.find({key: 'value'})    specifically
    const products = await Product.find({})
        .sort('name')
        .select('name company featured')
        .skip(1)
        .limit(11)
    res.status(200).json({ products, qty: products.length })
}

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, select,numericFilters } = req.query
    const queryObject = {}
    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }
    if (company) {
        queryObject.company = company
    }
    if (name) {
        queryObject.name = { $regex: name, $options: 'i' } // i is case insestive
    }
    if (numericFilters) {
        const operatorMap = {
          '>': '$gt',
          '>=': '$gte',
          '=': '$eq',
          '<': '$lt',
          '<=': '$lte',
        };
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(
          regEx,
          (match) => `-${operatorMap[match]}-`
        );
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item) => {
          const [field, operator, value] = item.split('-');
          if (options.includes(field)) {
            queryObject[field] = { [operator]: Number(value) };
          }
        });
      }
    let result = Product.find(queryObject)
    // sort
    if (sort) {
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }
    // select
    if (select) {
        const selectList = select.split(',').join(' ')
        result = result.select(selectList)
    }
    // pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)


    const products = await result
    res.status(200).json({ products, qty: products.length })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}