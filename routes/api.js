/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
        collection.find(req.query).toArray(function(err, docs){
          res.json(docs);
        });
      });
    })

    .post(function (req, res){
      var project = req.params.project;

      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        res.send('missing inputs');
      } else {

        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);

          var issue = {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to || '',
            status_text: req.body.status_text || '',
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          }

          collection.insertOne(issue, function(err,doc) {
            issue._id = doc.insertedId;
            res.json(issue);
          });
        });
      }// end else
    })

    .put(function (req, res){
      var project = req.params.project;


    })

    .delete(function (req, res){
      var project = req.params.project;

    });

};
