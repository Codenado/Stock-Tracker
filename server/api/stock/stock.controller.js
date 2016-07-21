/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/stocks              ->  index
 * POST    /api/stocks              ->  create
 * GET     /api/stocks/:id          ->  show
 * PUT     /api/stocks/:id          ->  update
 * DELETE  /api/stocks/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Stock from './stock.model';
import config from '../../config/environment';

var Quandl = require("quandl");
var quandl = new Quandl({
  auth_token: config.q,
  api_version: 3
});

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function respondWithData(res, statusCode) {
  var myDate = new Date();
  var today = new Date(
    myDate.getFullYear(),
    myDate.getMonth(),
    myDate.getDate()).getTime()

  statusCode = statusCode || 200;
  return function(entity) {

    var done = _.after(entity.length, function() {
      if (entity) {
        res.status(statusCode).json(stocks);
      }

    })
    var stocks = []

    _.map(entity, function(stock) {
      if (stock.updated !== today) {
        stock.updated = today
        console.log('updating')
        quandl.dataset({
          source: "WIKI",
          table: stock.key,
        }, {
          order: "asc",
          format: 'json',
          exclude_column_names: true,
          // Notice the YYYY-MM-DD format
          column_index: 4
        }, function(err, response) {
          if (err) {
            throw err;
          }
          var j = JSON.parse(response)
          var obj = j.dataset.data.map(function(v, i) {
            return {
              date: new Date(v[0]).getTime(),
              open: v[1],
              high: v[2],
              low: v[3],
              close: v[4]
            };
          })
          stock.values = obj
          stock.save()
          stocks.push(stock)
          done()
        });
      } else {
        stocks.push(stock)
        console.log('up to date')
        done()
      }

    });

  }
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Stocks
export function index(req, res) {
  return Stock.find().exec()
    .then(respondWithData(res))
    .catch(handleError(res));
}

// Gets a single Stock from the DB
export function show(req, res) {
  return Stock.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Stock in the DB
export function create(req, res) {
  var stockName = ''
  var myDate = new Date()
  var today = new Date(
    myDate.getFullYear(),
    myDate.getMonth(),
    myDate.getDate()).getTime()
  quandl.dataset({
    source: "WIKI",
    table: req.body.key,
  }, {
    order: "asc",
    format: 'json',
    exclude_column_names: true
  }, function(err, response) {
    if (err) {
      console.log('you did a error')
      handleError(err)
    }
    var j = JSON.parse(response)
    console.log(j)
    if (j.dataset) {
      stockName = j.dataset.name.split(' (')
      var obj = j.dataset.data.map(function(v, i) {
        return {
          date: new Date(v[0]).getTime(),
          open: v[1],
          high: v[2],
          low: v[3],
          close: v[4]

        }
      })
      return Stock.create({key: req.body.key, values: obj, updated: today, name: stockName[0]})
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
    }else{
    res.json({e: 'something went wrong'})
    }
  });



  // return Stock.create(req.body)
  //   .then(respondWithResult(res, 201))
  //   .catch(handleError(res));
}

// Updates an existing Stock in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Stock.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Stock from the DB
export function destroy(req, res) {
  return Stock.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
