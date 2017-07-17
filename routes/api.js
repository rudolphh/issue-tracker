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

function isValidObjectID(str) {
  // A valid Object Id must be 24 hex characters
  return (/^[0-9a-fA-F]{24}$/).test(str);
}

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

      var issue_id = req.body._id;
      delete req.body._id;

      var issue = req.body;

      for (var field in issue) {
        if (!issue[field]) { // empty strings false
          delete issue[field]
        }
      }

      if (Object.keys(issue).length === 0) {
        res.send('no updated field sent');
      } else {
        issue.updated_on = new Date();
        if(req.body.open) issue.open = false;

        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);
          collection.update(
            { _id: ObjectId(issue_id) },
            { $set: issue },
            { new: true },
            function(err,doc){
              !err ? res.send('successfully updated') : res.send('could not update '+issue+' '+err);
          });
        });
      }
    })

    .delete(function (req, res){
      var project = req.params.project;
      var issue_id = req.body._id;
      if (!issue_id || !isValidObjectID(issue_id)) {
        res.send('_id error');
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);
          collection.findOneAndDelete(
            { _id: new ObjectId(issue_id) },
            function(err, doc) {
              if(!err){
                if(doc.value) res.send('deleted '+ issue_id);
                else res.send('could not delete' + issue_id + ', _id not found');
              } else res.send('could not delete '+ issue_id + ' ' + err);
          });
        });
      }
    });

};
