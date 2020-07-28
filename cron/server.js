/*eslint no-console: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var express = require("express");
var passport = require("passport");
var stringifyObj = require("stringify-object");
var bodyParser = require("body-parser");

var async = require("async");

const axios = require('axios');

xsenv.loadEnv();	// Required for local testing with a default-env.json file

const JobSchedulerClient = require('@sap/jobs-client');
const scheduler = new JobSchedulerClient.Scheduler();

const qs = require('qs');
var crypto = require('crypto');

var app = express();


var server = require("http").createServer();
var port = process.env.PORT || 3000;

var myLogger = function (req, res, next) {
  console.log('LOGGED');
  console.log("==== method: " + req.method + " + " + req.url + "\n=== method");
  console.log("==== headers:\n" + JSON.stringify(req.headers,null,2) + "\n=== headers");
  console.log("==== body:\n" + JSON.stringify(req.body) + "\n==== body\n");
  next();
}

app.use(myLogger);

app.use(bodyParser.json());

app.get("/", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/util/links\">Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/cron", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/util", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/util/links\">Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/util/date", function (req, res) {

	var responseStr = "";
	responseStr += new Date().toISOString();
	res.set('Content-Type', 'text/plain');
	res.status(200).send(responseStr);
});

app.get("/cron/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/cron/get_all_jobs\" target=\"all_jobs\">get_all_jobs</a><br />";
	responseStr += "<a href=\"/cron/fetch_job?jobId=123\" target=\"jobs\">fetch_job?jobId=123</a> use jobId from get_all_jobs<br />";
	responseStr += "<a href=\"/cron/create_job?name=getUtilDate\" target=\"jobs\">create_job?name=getUtilDate</a> name must be unique<br />";
	responseStr += "<a href=\"/cron/update_job?jobId=123&active=false\" target=\"jobs\">update_job?jobId=123&active=false</a> use jobId from get_all_jobs<br />";
	responseStr += "<a href=\"/cron/delete_job?jobId=123\" target=\"jobs\">delete_job?jobId=123</a> use jobId from get_all_jobs<br />";
	responseStr += "------<br />";
	responseStr += "<a href=\"/cron/fetch_job_schedules?jobId=123\" target=\"all_sched\">fetch_job_schedules?jobId=123</a> use jobId from get_all_jobs<br />";
	responseStr += "<a href=\"/cron/fetch_job_schedule?jobId=123&scheduleId=ABC-DEF\" target=\"jobsched\">fetch_job_schedule?jobId=123&scheduleId=ABC-DEF</a> use jobId from get_all_jobs and scheduleId from fetch_job_schedules<br />";
	responseStr += "<a href=\"/cron/create_job_schedule?jobId=123&active=false\" target=\"sched\">create_job_schedule?jobId=123&active=false</a> use jobId from get_all_jobs<br />";
	responseStr += "<a href=\"/cron/update_job_schedule?jobId=123&scheduleId=ABC-DEF&active=false\" target=\"jobsched\">update_job_schedule?jobId=123&scheduleId=ABC-DEF&active=false</a> use jobId from get_all_jobs and scheduleId from fetch_job_schedules<br />";
	responseStr += "<a href=\"/cron/delete_job_schedule?jobId=123&scheduleId=ABC-DEF\" target=\"jobsched\">delete_job_schedule?jobId=123&scheduleId=ABC-DEF</a> use jobId from get_all_jobs and scheduleId from fetch_job_schedules<br />";
	responseStr += "------<br />";
	responseStr += "<a href=\"/cron/get_run_logs?jobId=123&scheduleId=ABC-DEF\" target=\"jobrunsched\">get_run_logs?jobId=123&scheduleId=ABC-DEF</a> use jobId from get_all_jobs and scheduleId from fetch_job_schedules<br />";
	responseStr += "<a href=\"/cron/update_job_run_log?jobId=123&scheduleId=ABC-DEF&message=OK%20finished\" target=\"jobrunlog\">update_job_run_log?jobId=123&scheduleId=ABC-DEF&message=OK%20finished</a> use jobId from get_all_jobs and scheduleId from fetch_job_schedules<br />";
	responseStr += "------<br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

// https://www.npmjs.com/package/@sap/jobs-client

// /cron/get_all_jobs
app.get("/cron/get_all_jobs", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var jreq = {};
	scheduler.fetchAllJobs(jreq, (err, result) => {
	
		if (err) {
			console.log('Error retrieving jobs: %s', err);
			responseJSON.message = err;
			return res.json(responseJSON);
		}
		else {
			console.log('OK retrieving jobs: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// Create Job Docs
// https://help.sap.com/viewer/07b57c2f4b944bcd8470d024723a1631/Cloud/en-US/2c1ecb6dae0c42b4a850f7c07d1b7124.html
// /cron/create_job?name=getUtilDate
app.get("/cron/create_job", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var myJob = 
	{
	"name": req.query.name,
	"description": "cron job named " + req.query.name,
	//"action": "https://" + req.hostname + "/util/date",
	//"action": "http://" + "localhost" + ":" + "8001" + "/util/date",
	"action": "https://" + "conciletime-dev-bump-app.cfapps.us10.hana.ondemand.com" + "/util/date",
	
	"active": true,
	"httpMethod": "GET",
	"schedules": [
		{
		"cron": "* * * * * 0 0",
		"description": "this schedule runs once an hour on the hour",
		"data": {
			"salesOrderId": "1234"
		},
		"active": true,
		"startTime": {
			"date": "2020-07-22 00:00 +0000",
			"format": "YYYY-MM-DD HH:mm Z"
		}
		}
	]
	};

	var scJob = { job: myJob };

	scheduler.createJob(scJob, (error, body) => {
	
		if (error) {
			console.log('Error creating job: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK creating job: %s', body);
			responseJSON = body;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/fetch_job?jobId=123
app.get("/cron/fetch_job", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var suJob = { jobId: req.query.jobId };

	scheduler.fetchJob(suJob, (error, result) => {
	
		if (error) {
			console.log('Error fetching job: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK fetching job: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/update_job?jobId=123&active=false
app.get("/cron/update_job", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var theJob = 
	{
		"active": req.query.active,
	};

	var suJob = { jobId: req.query.jobId, job: theJob };

	scheduler.updateJob(suJob, (error, result) => {
	
		if (error) {
			console.log('Error updating job: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK updating job: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/delete_job?jobId=123
app.get("/cron/delete_job", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var jreq = {
		jobId: req.query.jobId
	};
	scheduler.deleteJob(jreq, (err, result) => {
	
		if (err) {
			console.log('Error deleting job: %s', err);
			responseJSON.message = err;
			return res.json(responseJSON);
		}
		else {
			console.log('OK deleting job: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});
});

// Create Job Schedule Docs
// https://help.sap.com/viewer/07b57c2f4b944bcd8470d024723a1631/Cloud/en-US/66ab3c1404e34a3b9f04b968ecb3fd5f.html
// /cron/create_job_schedule?jobId=123&active=false
app.get("/cron/create_job_schedule", function (req, res) {

	var mySchedule = 
	{
		"repeatInterval": "1 hour",
		"active": req.query.active,
		"description": "New Schedule 1 hour",
		"startTime": "2020-07-28 23:59:00"
	};

	var responseJSON = {
		message: "none",
	};

	var theJob = 
	{
		"active": req.query.active,
	};

	var scJobSched = { jobId: req.query.jobId, schedule: mySchedule };

	scheduler.createJobSchedule(scJobSched, (error, result) => {
	
		if (error) {
			console.log('Error creating job schedule: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK creating job schedule: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// https://help.sap.com/viewer/07b57c2f4b944bcd8470d024723a1631/Cloud/en-US/0a4d9395180f482db46b8a5375fa6f7f.html
// /cron/update_job_schedule?jobId=123&scheduleId=ABC-DEF&active=false
app.get("/cron/update_job_schedule", function (req, res) {

	var theSchedule = 
	{
		"active": req.query.active
	};

	var responseJSON = {
		message: "none",
	};

	var suJobSched = { jobId: req.query.jobId, scheduleId: req.query.scheduleId, schedule: theSchedule };

	scheduler.updateJobSchedule(suJobSched, (error, result) => {
	
		if (error) {
			console.log('Error updating job schedule: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK updating job schedule: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/delete_job_schedule?jobId=123&scheduleId=ABC-DEF
app.get("/cron/delete_job_schedule", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sdJobSched = { jobId: req.query.jobId, scheduleId: req.query.scheduleId };

	scheduler.deleteJobSchedule(sdJobSched, (error, result) => {
	
		if (error) {
			console.log('Error deleting job schedule: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK deleting job schedule: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/fetch_job_schedules?jobId=123
app.get("/cron/fetch_job_schedules", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sfJobScheds = { jobId: req.query.jobId };

	scheduler.fetchJobSchedules(sfJobScheds, (error, result) => {
	
		if (error) {
			console.log('Error fetching job schedules: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK fetching job schedules: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/fetch_job_schedule?jobId=123&scheduleId=ABC-DEF
app.get("/cron/fetch_job_schedule", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sfJobSched = { jobId: req.query.jobId, scheduleId: req.query.scheduleId, displayLogs: true };

	scheduler.fetchJobSchedule(sfJobSched, (error, result) => {
	
		if (error) {
			console.log('Error fetching job schedule: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK fetching job schedule: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/get_run_logs?jobId=123&scheduleId=ABC-DEF
app.get("/cron/get_run_logs", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sgRunLogs = { 
		jobId: req.query.jobId, 
		scheduleId: req.query.scheduleId,
		page_size: 15,
		offset: 0 
	};

	scheduler.getRunLogs(sgRunLogs, (error, result) => {
	
		if (error) {
			console.log('Error getting run logs: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK getting run logs: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/update_job_run_log?jobId=123&scheduleId=ABC-DEF&runId=XYZ-1234&success=true&message=OK%20finished
app.get("/cron/update_job_run_log", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	// var data = { success: req.query.success, message: '"' + "YO" + '"' };
	var data = { success: false, message: "YO" };

	var suRunLog = { 
		jobId: req.query.jobId, 
		scheduleId: req.query.scheduleId,
		runId: req.query.runId,
		data: data
	};

	scheduler.updateJobRunLog(suRunLog, (error, result) => {
	
		if (error) {
			console.log('Error update run log: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK update run log: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/delete_all_job_schedules?jobId=123
app.get("/cron/delete_all_job_schedules", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sdaJobScheds = { jobId: req.query.jobId };

	scheduler.deleteAllJobSchedules(sdaJobScheds, (error, result) => {
	
		if (error) {
			console.log('Error deleting all job schedules: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK deleting all job schedules: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/activate_all_job_schedules?jobId=123
app.get("/cron/activate_all_job_schedules", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sActivateAllScheds = { jobId: req.query.jobId };

	scheduler.activateAllSchedules(sActivateAllScheds, (error, result) => {
	
		if (error) {
			console.log('Error deleting all job schedules: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK deleting all job schedules: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/deactivate_all_job_schedules?jobId=123
app.get("/cron/deactivate_all_job_schedules", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sDectivateAllScheds = { jobId: req.query.jobId };

	scheduler.deactivateAllSchedules(sDectivateAllScheds, (error, result) => {
	
		if (error) {
			console.log('Error deleting all job schedules: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK deleting all job schedules: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/get_job_action_logs?jobId=123
app.get("/cron/get_job_action_logs", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sgAllJobActionLogs = { jobId: req.query.jobId };

	scheduler.getJobActionLogs(sgAllJobActionLogs, (error, result) => {
	
		if (error) {
			console.log('Error getting all job action logs: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK getting all job action logs: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/get_schedule_action_logs?jobId=123&scheduleId=ABC-DEF
app.get("/cron/get_schedule_action_logs", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var sgSchedActionLogs = { jobId: req.query.jobId, scheduleId: req.query.scheduleId };

	scheduler.getScheduleActionLogs(sgSchedActionLogs, (error, result) => {
	
		if (error) {
			console.log('Error getting schedule action logs: %s', error);
			responseJSON.message = error;
			return res.json(responseJSON);
		}
		else {
			console.log('OK getting schedule action logs: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/get_job_count?active_status=true
app.get("/cron/get_job_count", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var jreq = {
		activeStatus: req.query.active_status // true- for getting active number of jobs and false- for getting inactive number of jobs
	};
	scheduler.getJobCount(jreq, (err, result) => {
	
		if (err) {
			console.log('Error getting job count: %s', err);
			responseJSON.message = err;
			return res.json(responseJSON);
		}
		else {
			console.log('OK getting job count: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

//Search API (need more detail)
//Search can be done in both job and schedule entities. Here in the client 'q' contains the query parameter, you need to provide the query in decoded format, the client will decode the query. And filtering parameters can be provided as shown below:

// /cron/search_jobs?active=true
app.get("/cron/search_jobs", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var searchToken = {
		q : 'job startTime:>2020-07-01 active:' + req.query.active,
		displaySchedules : 'false',
		offset : 0,
		page_size : 5
	};

	scheduler.searchJobs(searchToken, (err, result) => {
	
		if (err) {
			console.log('Error searching jobs: %s', err);
			responseJSON.message = err;
			return res.json(responseJSON);
		}
		else {
			console.log('OK searching jobs: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});

// /cron/search_schedules?active=true
app.get("/cron/search_schedules", function (req, res) {

	var responseJSON = {
		message: "none",
	};

	var searchSchedToken = {
		q : 'startTime:>2020-07-01 active:' + req.query.active,
		displaySchedules : 'false',
		offset : 0,
		page_size : 5
	};

	scheduler.searchSchedules(searchSchedToken, (err, result) => {
	
		if (err) {
			console.log('Error searching schedules: %s', err);
			responseJSON.message = err;
			return res.json(responseJSON);
		}
		else {
			console.log('OK searching schedules: %s', result);
			responseJSON = result;
			return res.json(responseJSON);
		}
		return null;
	});

});


app.get("/util/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/util/bump\">Trigger a Jenkins Build Job.</a><br />";
	responseStr += "<a href=\"/util/links\">Back to Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/util/json", function (req, res) {

	var responseJSON = {
		"userId": 1,
		"id": 1,
		"title": "delectus aut autem",
		"completed": false
	  };

	res.json(responseJSON);
});


app.get("/util/bump", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>BUMP</title></head><body><h1>bump-cron</h1><h2>GET WHAT!</h2><br />";
	responseStr += "You need to POST to this URL!<br />";
	responseStr += "<a href=\"/util/links\">Back to Util Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";

	// Get the SECRET_TOKEN from the environment
	// Get the payload.json from the file system
	// Compose the hash for X-Hub-Signature
	// See https://developer.github.com/webhooks/securing/
	//
	// Code inspired by: https://www.robinwieruch.de/github-webhook-node-js
	//
	//
	//Request URL: https://cicd-service.cfapps.us10.hana.ondemand.com/v1/github_events/account/6e3ca693-c112-4862-9c30-254a18b59a55
	//Request method: POST
	//Accept: */*
	//content-type: application/json
	//User-Agent: GitHub-Hookshot/f2f2346
	//X-GitHub-Delivery: a2423d32-c220-11ea-8c16-961d5a50195d
	//X-GitHub-Event: push
	//X-Hub-Signature: sha1=cefbcfcb1949d172a51565d32329974732c8add3

	const secret = process.env.SECRET_TOKEN;
	const payload = require("./payload");

	responseStr += "secret: " + secret + ".<br />";
	responseStr += "payload.repository.owner.name: " + payload.repository.owner.name + ".<br />";

	var params = {
        id: 6,
        first_name: 'Fred',
        last_name: 'Blair',
        email: 'freddyb34@gmail.com'
      };

    var config = {
        method: 'get',
        url: 'https://conciletime-dev-bump-app.cfapps.us10.hana.ondemand.com/util/json',
		headers: { 'User-Agent': 'Console app' }
    };

	var response = {};
	var data = {};
	try {
		response = await axios(config);
		responseStr += "OK now stuff from the axios get.<br />";
		responseStr += "title: " + response.data.title + "<br />";

		config.method = 'post';
		//config.url = 'https://conciletime-dev-bump-app.cfapps.us10.hana.ondemand.com/util/bump';
		config.url = 'https://cicd-service.cfapps.us10.hana.ondemand.com/v1/github_events/account/6e3ca693-c112-4862-9c30-254a18b59a55';
	
	// 	post '/payload' do
	// 	request.body.rewind
	// 	payload_body = request.body.read
	// 	verify_signature(payload_body)
	// 	push = JSON.parse(params[:payload])
	// 	"I got some JSON: #{push.inspect}"
	//   end
	  
	//   def verify_signature(payload_body)
	// 	signature = 'sha1=' + OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha1'), ENV['SECRET_TOKEN'], payload_body)
	// 	return halt 500, "Signatures didn't match!" unless Rack::Utils.secure_compare(signature, request.env['HTTP_X_HUB_SIGNATURE'])
	//   end
	
	//signature = 'sha1=' + OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha1'), ENV['SECRET_TOKEN'], payload_body)

	//import crypto from 'crypto';
	//import { exec } from 'child_process';

		var payloadStr = JSON.stringify(payload);

		const signature = `sha1=${crypto
        .createHmac('sha1', secret)
        .update(payloadStr)
        .digest('hex')}`;

		console.log("sig: " + signature);


		var headers = {
			'Accept': '*/*',
			'content-type': 'application/json',
			'User-Agent': 'GitHub-Hookshot/f2f2346',
			'X-GitHub-Delivery': 'a2423d32-c220-11ea-8c16-961d5a50195d',
			'X-GitHub-Event': 'push',
			'X-Hub-Signature': signature
		};

		config.headers = headers;
	
		config.headers = headers;
		// config.data = qs.stringify({ me: 'Andrew', pw: 'secret' });
		//config.data = JSON.stringify({ me: 'Andrew', pw: 'secret' });
		config.data = payload;
		//config.data = payloadStr;

		response = await axios(config);
		responseStr += "OK now stuff from the axios post.<br />";


		// Cache-Control: no-cache, no-store, max-age=0, must-revalidate
		// Content-Length: 0
		// Content-Security-Policy: default-src &#39;self&#39;;
		// Date: Thu, 09 Jul 2020 20:26:49 GMT
		// Expires: 0
		// Pragma: no-cache
		// Strict-Transport-Security: max-age=31536000; includeSubDomains; preload;
		// X-Content-Type-Options: nosniff
		// X-Frame-Options: DENY
		// X-Vcap-Request-Id: f5c55289-2646-431c-655d-c0443750b36c
		// X-Xss-Protection: 1; mode=block		
		responseStr += "axios headers: " + JSON.stringify(response.headers) + "<br />";
		responseStr += "axios data: " + JSON.stringify(response.data) + "<br />";

	} catch (error) {
		responseStr += "error: " + error + ".<br />";
	}

	responseStr += "POST: " + "FINISHED" + ".<br />";

	res.status(200).send(responseStr);

});

// subscribe/onboard a subscriber tenant
app.post("/util/bump", function(req, res) {
	let retVal = "You POSTED!";
	
	const secret = process.env.SECRET_TOKEN;
	

	let bref = typeof req.body.ref === "undefined" ? 'not object' : req.body.ref;
	
	retVal += "<br /><br />bref: " + bref + "<br /><br />";

	const isMaster = bref === 'refs/heads/master';

	const signature = `sha1=${crypto
	.createHmac('sha1', secret)
	.update(JSON.stringify(req.body))
	.digest('hex')}`;

	retVal += "sig: " + signature + "<br /><br />";
	console.log("sig: " + signature);

	const isAllowed = req.headers['x-hub-signature'] === signature;

	if (isAllowed && isMaster) {
		retVal += "==== WebHook looks good and is on master branch. ====" + "<br /><br />";
	}
	else {
		retVal += "==== WebHook failed match signature or wrong branch. ====" + "<br /><br />";
	}

	retVal += "==== posted headers:" + JSON.stringify(req.headers) + "====";
	retVal += "==== posted body:" + JSON.stringify(req.body) + "====";
	res.status(200).send(retVal);
});


server.on("request", app);

server.listen(port, function () {
	console.info("Backend: " + server.address().port);
});
