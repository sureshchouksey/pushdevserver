
var admin = require("firebase-admin");
var Device = require('../models/device');
var mongoose = require('mongoose');
var config = require('config');
var log4js = require('log4js'); // include log4js
var fs  = require('fs');
var path = require('path');
var logConfig = require('../config/log4js');
var opusConstant = require('../share/constant');
var apn = require('apn');

log4js.configure({ 
  appenders: {
    out: { type: 'console' }, 
    task: { type: 'dateFile', filename: 'logs/task',"pattern":".log", alwaysIncludePattern:true }, 
    result: { type: 'dateFile', filename: 'logs/result',"pattern":".log", alwaysIncludePattern:true}, 
    error: { type: 'dateFile', filename: 'logs/error', "pattern":".log",alwaysIncludePattern:true}, 
    default: { type: 'dateFile', filename: 'logs/default', "pattern":".log",alwaysIncludePattern:true}, 
    pushlog: { type: 'dateFile', filename: 'logs/EPPushLog', "pattern":".log",alwaysIncludePattern:true}, 
    rate: { type: 'dateFile', filename: 'logs/rate', "pattern":".log",alwaysIncludePattern:true} 
  },
  categories: {
    default: { appenders: ['out','default'], level: 'info' },
    pushlog: { appenders: ['out','pushlog'], level: 'info' },

    task: { appenders: ['task'], level: 'info'},
    result: { appenders: ['result'], level: 'info' },
    error: { appenders: ['out','error'], level: 'error' },
    rate: { appenders: ['rate'], level: 'info' }
  }
});


var loggerinfo = log4js.getLogger('info'); // initialize the var to use.
var loggerpush = log4js.getLogger('pushlog'); // initialize the var to use.

var loggererror = log4js.getLogger('error'); // initialize the var to use.
var loggerdebug = log4js.getLogger('debug'); // initialize the var to use.
if(logConfig.visible){
    loggerinfo.level = "OFF";
    loggererror.level = "OFF";
    loggerdebug.level = "OFF";    
}


var serviceAccount = require(opusConstant.opusConstant.serviceAccountPath);
var otherServiceAccout = require(opusConstant.opusConstant.otherServiceAccoutPath);
var workplaceServiceAccount = require(opusConstant.opusConstant.workplaceServiceAccountPath);
var epWorkplaceServiceAccount = require(opusConstant.opusConstant.epWorkplaceServiceAccountPath);
var mearsConnectServiceAccount = require(opusConstant.opusConstant.mearsConnectServiceAccountPath);
var epModeConnectServiceAccount = require(opusConstant.opusConstant.epModeConnectServiceAccountPath);
var mearsDevConnectServiceAccount = require(opusConstant.opusConstant.mearsDevConnectServiceAccountPath);

var WorkplaceAdminApp = admin.initializeApp({
  credential: admin.credential.cert(workplaceServiceAccount),
  databaseURL: opusConstant.opusConstant.firebaseURL
},"Workplace");

var EpWorkplaceAdminApp = admin.initializeApp({
  credential: admin.credential.cert(epWorkplaceServiceAccount),
  databaseURL: opusConstant.opusConstant.firebaseURL
},"EpWorkplace");

var MearsConnectAdminApp = admin.initializeApp({
  credential: admin.credential.cert(mearsConnectServiceAccount),
  databaseURL: opusConstant.opusConstant.firebaseURL
},"MearsConnect");

var epModeConnectAdminApp = admin.initializeApp({
  credential: admin.credential.cert(epModeConnectServiceAccount),
  databaseURL: opusConstant.opusConstant.firebaseURL
},"epModeConnect");

var MearsDevConnectAdminApp = admin.initializeApp({
  credential: admin.credential.cert(mearsDevConnectServiceAccount),
  databaseURL: opusConstant.opusConstant.firebaseURL
},"MearsDevConnect");



// Get all data for loggedIn user
exports.getAll = (req, res) => {
  try{
    loggerinfo.task('TEST--->',req);
    loggerinfo.info('Start Get Device Service');
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token === config.token){
        Device.find({}).sort({createdAt:-1}).exec((err,docs)=>{
          if(err){ return loggerinfo.error(err);}
              res.status(200).json(docs);
        })      
    }
    else
    {
      loggerinfo.error('Get Device Service: Authentication failed.');
      res.status(401).send('Authentication failed.');
    }
  } 
  catch(err){
    loggerinfo.error('Get Device Service: Internal server error',err);
    res.status(500).send(err);
  }  
}



// Get data for all devices
exports.getAllDevice = (req, res) => {
  try{  
      loggerinfo.info('Start Get All Device Service');
      var token = req.body.token || req.query.token || req.headers['x-access-token'];  
      if(token === config.token){
        ApnDevice.find({}, (err, docs) => {
        if (err) { return loggerinfo.error(err); }      
          res.status(200).json(docs);
        });
      }
      else
      {        
        loggerinfo.error('Get All Device Service: Authentication failed.');
        res.status(401).send('Authentication failed.');
      }
  }
  catch(err){
    loggerinfo.error('Get All Device Service: Internal server error',err);
    res.status(500).send(err);
  }
}


exports.home = (req,res) =>{ 
  res.send('Welcome to WorkplaceON Server');
}


exports.update = (req, res) => {
  try{
    loggerinfo.info('Start Create and Update Registration Service'+req.body.platform+'deviceID--->'+req.body.deviceId +'devicetoken-->' +req.body.registrationToken);
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(req.body && req.body.hasOwnProperty('platform')  && req.body.hasOwnProperty('deviceId') && req.body.hasOwnProperty('packageName') && req.body.hasOwnProperty('registrationToken') && req.body.hasOwnProperty('packageName') && req.body.hasOwnProperty('version') && req.body.hasOwnProperty('appversion'))
    {
      if(req.body.platform != "" && req.body.platform != null && req.body.registrationToken != "" && req.body.registrationToken != null && req.body.deviceId != "" && req.body.deviceId != null)      
      {
        if(token === config.token){ 
            loggerinfo.info('Request body of Registration Service ',req.body);      
            var query = {
            "platform" : req.body.platform,          
            "packageName":req.body.packageName,
            "deviceId":req.body.deviceId,          
          };
          req.body.createdAt = new Date();
          console.log('req.body',req.body);
            Device.findOneAndUpdate(query, req.body, { upsert: true }, (err) => {
              if (err) { return loggerinfo.error(err); }
              loggerinfo.info('New device successfully register for FCM');
              var resultData = {
                "username":req.body.username,
                "status":"Success"
              }
              res.status(200).json(resultData);
            });
        }
        else
        {
          loggerinfo.error('Create and Update Registration Service: Authentication failed.');
          res.status(401).send('Authentication failed.');
        }
      }
      else{
        loggerinfo.error('Create and Update Registration Service: Registration token and DeviceId should not be Empty.');
        res.status(500).json({status:500,message:'Registration token and DeviceId should not be Empty.'});
      }
    }
    else{
      loggerinfo.error('Create and Update Registration Service: Platform,DeviceId, Registration Token and PackageName are mandatory.');
      res.status(500).json({status:500,message:'Platform, DeviceId, Registration Token and PackageName are mandatory.'});
    }
     
  }
  catch(err){
    loggerinfo.error('Create and Update Registration Service: Internal server error.');
    res.status(500).send(err);
  }
  
}

 //Delete by id
exports.delete = (req, res) => {
    try{
      loggerinfo.info('Start delete RegistrationId from database Service');
      var token = req.body.token || req.query.token || req.headers['x-access-token'];
      if(token === config.token){  
          Device.find({ username : req.params.username,deviceId:req.params.deviceId,packageName:req.params.packageName }, (err, obj) => {
            if (err) { return loggerinfo.info(err); }
            loggerinfo.info("Search result of get Service", obj[0]);
            Device.remove({_id : mongoose.Types.ObjectId(obj[0]._id)}, (err, result) => {
              if(err){ 
                loggerinfo.error('Delete RegistrationId from database Service: RegistrationId not delete.');
                return res.status(500).send(err)
              }
              loggerinfo.info('Device successfully deleted');              
              res.status(200).json({ message: "Device successfully deleted!", data:result });
            });        
          });
      }
      else
      {
        loggerinfo.error('Create and Update Registration Service: Authentication failed.');
        res.status(401).send('Authentication failed.');
      }
    }
    catch(err){
      loggerinfo.error('Delete RegistrationId from database Service: RegistrationId not delete.');
      res.status(500).send(err);
    }
   }


exports.deleteAllRegisterdDevice = (req, res) => {
  loggerinfo.info('Request body of deleteAll Service',req.body);
  Device.remove({}, (err) => {
    if (err) { return loggerinfo.info(err); }
    loggerinfo.info('All device sucessfully deleted!');
    res.sendStatus(200);
  })
}

exports.deleteAllDevice = (req, res) => {
  loggerinfo.info('Request body of deleteAll Service',req.body);
  Device.remove({}, (err) => {
    if (err) { return loggerinfo.info(err); }
    loggerinfo.info('All device sucessfully deleted!');
    res.sendStatus(200);
  })
}

exports.deleteDeviceByDate = (req, res) => {
  loggerinfo.info('Request body of deleteAll Service',req.body);
  Device.find({"createdAt": {"$lt": new Date(2019, 3, 15)}}, (err,docs) => {
    if (err) { return loggerinfo.info(err); }
    loggerinfo.info('All device sucessfully deleted!');
    //res.sendStatus(200);
    res.json(docs);
  })
}


exports.deleteByPlatform = (req, res) => {
  loggerinfo.info('Request body of deleteAll Service',req.params);
  Device.remove({platform : req.params.platform,packageName:req.params.packageName}, (err) => {
    if (err) { return loggerinfo.info(err); }
    loggerinfo.info('All device sucessfully deleted!');
    res.sendStatus(200);
  })
}


// Send message to multiple devices of multiple users with multiple notification in single Payload
exports.sendNotification = (req, res) => {

  try{

  loggerinfo.info('Start SendNotification Service');
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token === config.token ){
      
        loggerinfo.info('Request body of sendNotification Service',req.body);
        var payLoadList = req.body;
        var responseList = [];
        var androidRegistrationTokens =[];
        var iosRegistrationTokens =[];
        var resultList = [];
        var isPackageNameValid = false;
        var apnProvider;
        payLoadList.forEach((item, index) => {
          if(item && item.hasOwnProperty('packageName') && item.hasOwnProperty('username') && item.hasOwnProperty('notification'))
          {
              var userList = [];
              var newData = {};
              userList = item.username.split(',');
              var itemKeys = Object.keys(item.notification);
              itemKeys.forEach(function(data,index){
                 newData[data] = item.notification[data];
                 
              })
              console.log('newData',newData);
              if(item.notification.hasOwnProperty('silent')){
                  if(typeof item.notification['silent'] === 'boolean'){
                    newData['silent'] = item.notification['silent'] ? 'true' :'false';
                  }
                  delete item.notification['silent'];
              }
              
              var payload = {
               // notification: item.notification,
                data:newData
              };
              
              Device.find({ 'username': { $in: userList } }, (err, obj) => {
                if (err) { return loggerinfo.error(err); }      
                // Send a message to the devices corresponding to the provided
                // registration tokens.  
                loggerinfo.info(' Username-->',obj);    
                obj.forEach((device,index)=>{          
                    if(device.platform === 'Android'){
                        androidRegistrationTokens.push(device.registrationToken);
                    }
                    if(device.platform === 'iOS'){
                      //loggerinfo.info('device.registrationToken --- > ' +iosRegistrationTokens);
                      iosRegistrationTokens.push(device.registrationToken);            
                    }
                })        
                
                var adminApp ={};

                if(item.packageName === opusConstant.opusConstant.wpoPackageNameProd){
                  adminApp = WorkplaceAdminApp;
                  apnProvider = new apn.Provider(opusConstant.opusConstant.options);
                  isPackageNameValid = true;
                } else if(item.packageName === opusConstant.opusConstant.epmodPackageNameProd){
                  apnProvider = new apn.Provider(opusConstant.opusConstant.optionEpConnect);                                    
                  adminApp = EpWorkplaceAdminApp;
                  isPackageNameValid = true;
                } else if(item.packageName === opusConstant.opusConstant.epmodPackageNameDev){
                  apnProvider = new apn.Provider(opusConstant.opusConstant.options);
                  adminApp = epModeConnectAdminApp;
                  isPackageNameValid = true;
                } else if(item.packageName === opusConstant.opusConstant.mcConnectPackageNameProd){
                  adminApp = MearsConnectAdminApp;
                  apnProvider = new apn.Provider(opusConstant.opusConstant.optionsMearsConnect);
                  isPackageNameValid = true;
                } else if(item.packageName === opusConstant.opusConstant.mcConnectPackageNameDev){
                  adminApp = MearsDevConnectAdminApp;
                  apnProvider = new apn.Provider(opusConstant.opusConstant.optionsMearsConnect);
                  isPackageNameValid = true;
                } else{
                  isPackageNameValid = false;
                  loggerinfo.error('Send Notification Service: Package Name is inValid.');       
                  res.status(500).json({status:500,message:'Package Name is inValid.'});
                }
                
                 
                if(iosRegistrationTokens.length>=1){

                  if(apnProvider){
                    var apnURL = item.notification.url ? item.notification.url :"";
                    let note = new apn.Notification({
                      payload:{
                       "messageFrom":item.notification.body,
                       "attachment-url":apnURL
                      },
                alert:item.notification.title,
                priority:5,
                host:"api.push.apple.com:443",
                sound:"ping.aiff",
                topic:item.packageName,
                contentAvailable: 1//this key is also needed for production
                });
                    // var note = new apn.Notification();
                    // var apnURL = item.notification.url ? item.notification.url :"";
                    // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                    // note.badge = 1;
                    // note.sound = "ping.aiff";
                    // note.alert = item.notification.title// Opus Alert message";
                    // note.payload = {'messageFrom': item.notification.body,"attachment-url":apnURL};
                    // note.urlArgs ="http://google.com";
                    // note.topic = item.packageName;// + ".voip";
                   // note.aps = {  "content-available" : 1};
                   // loggerinfo.info('note:Request parameter of send messaging service in APN',note);
                    //loggerinfo.info('RegistrationTokens:Request parameter of send messaging service in APN',iosRegistrationTokens);
                    
                    apnProvider.send(note, iosRegistrationTokens).then( (result) => {
                      // see documentation for an explanation of result
                      console.log('After sending message to apn');
                      //loggerinfo.info('APN- SendNotification ',iosRegistrationTokens);
                      loggerinfo.info('APN- Actual Response ',result);

                      loggerinfo.info('APN- Response ',JSON.stringify(result));

                          console.log('Result',JSON.stringify(result));
                          //res.status(200).json(result);      
                          responseList.push(result);
                      });
                  }
                }
                
                if(isPackageNameValid){

                if(androidRegistrationTokens.length>=1){
                  loggerinfo.info('registrationTokens:Request parameter of send messaging service in FCM',androidRegistrationTokens);
                  loggerinfo.info('payload:Request parameter of send messaging service in FCM',payload);        
                  adminApp.messaging().sendToDevice(androidRegistrationTokens, payload)
                    .then((response)=> {          
                      // See the MessagingDevicesResponse reference documentation for
                      // the contents of response.                    
                      responseList.push(response);          
                      if (payLoadList.length == responseList.length) {
                        
                        responseList[0].results.forEach((item,index)=>{
                          var result ={};
                          loggerinfo.info('Android result-', item); 
                          console.log('item',item);
                          if(item.hasOwnProperty('error')){
                              result = {
                                "status" : 'error',
                                "registrationToken" : androidRegistrationTokens[index]
                              }
                              Device.find({ registrationToken : androidRegistrationTokens[index]}, (err, obj) => {
                                if (err) { return loggerinfo.error(err); }
                                loggerinfo.info("Search result of get Service", obj[0]);
                                Device.remove({_id : mongoose.Types.ObjectId(obj[0]._id)}, (err, result) => {
                                  if(err){ return res.status(500).send(err)}                      
                                });
                              });
                              resultList.push(result);
                          }
                          else{
                            result = {
                                "status" : 'success',
                                "registrationToken" : androidRegistrationTokens[index]
                              }
                              resultList.push(result);
                          }
                        })
                        //loggerinfo.info('resultList', resultList);                        
                      }          
                    })
                    .catch((error)=> {
                      loggerinfo.error("Error sending message:", error);
                    });
                  }

                  var resultData = {              
                        "status":200,"message":'Successfully sent notification'
                      }
                  res.status(200).json(resultData);

                }
                  
              });
          }
          else
          {
            loggerinfo.error('Send Notification Service: Username, Notification and PackageName are mandatory.');
            res.status(500).json({status:500,message:'Username,Notification and PackageName are mandatory.'});
          }
        });
  }
  else
  {
    loggerinfo.error('Send Notification Service: Authentication failed.');
    res.status(401).json({status:401,message:'Authentication failed.'});
  }
  }catch(err){
    loggerinfo.error('Send Notification Service: Internal server error.');
    res.status(500).json({status:500,message:'Internal server error'});
  }
  loggerinfo.info('End SendNotification Service');

}


exports.subscribeToTopic = (req, res) => {
  try{
  loggerinfo.info('Start SubscribeToTopic for FCM and Registration for APN Service');
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token === config.token){
    if(req.body && req.body.hasOwnProperty('platform')  && req.body.hasOwnProperty('deviceId') && req.body.hasOwnProperty('packageName') && req.body.hasOwnProperty('registrationToken') && req.body.hasOwnProperty('packageName'))
    { 
      if(req.body.registrationToken != "" && req.body.registrationToken != null && req.body.deviceId != "" && req.body.deviceId != null){

     
      loggerinfo.info('Request body of subscribeToTopic Service',req.body);
        // Subscribe the device corresponding to the registration token to the
        // topic.    
        //let topic = req.body.packageName;
        var topic = "testDemo";
        var registrationToken = req.body.registrationToken; 
        var platform = req.body.platform; 
        var adminApp ={};
        if(platform === 'Android'){
          var inputData = {
              "platform" : req.body.platform,
              "registrationToken":req.body.registrationToken,
              "packageName":req.body.packageName,
              "deviceId":req.body.deviceId,
              "createAt":new Date()
            }        
            var device = new Device(inputData);
            var query = {
              "platform" : req.body.platform,          
              "packageName":req.body.packageName,
              "deviceId":req.body.deviceId,          
            };            
            console.log('req.body',req.body);
              Device.findOneAndUpdate(query, inputData, { upsert: true }, (err) => {
                    // 11000 is the code for duplicate key error          
                    if (err && err.code === 11000) {
                      loggerinfo.error('SubscribeToTopic for FCM  Service: Internal server error.');
                      res.sendStatus(400);
                    }
                    if (err) {
                      loggerinfo.error('SubscribeToTopic for FCM  Service: Internal server error.');
                      return loggerinfo.error(err);
                    }

                  if(req.body.packageName === opusConstant.opusConstant.wpoPackageNameProd){
                    adminApp = WorkplaceAdminApp;
                    isPackageNameValid = true;
                  } else if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameProd){
                    adminApp = EpWorkplaceAdminApp;
                    isPackageNameValid = true;
                  } else if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameDev){                    
                    adminApp = epModeConnectAdminApp;
                    isPackageNameValid = true;
                  }  else if(req.body.packageName === opusConstant.opusConstant.mcConnectPackageNameProd){
                    adminApp = MearsConnectAdminApp;
                    isPackageNameValid = true;
                  } else if(req.body.packageName === opusConstant.opusConstant.mcConnectPackageNameDev){
                    adminApp = MearsDevConnectAdminApp;                    
                    isPackageNameValid = true;
                  } else{
                    isPackageNameValid = false;
                    loggerinfo.error('Send Notification Service: Package Name is inValid.');       
                    res.status(500).json({status:500,message:'Package Name is inValid.'});
                  }
                    
                  if(isPackageNameValid){
                    loggerinfo.info('registrationToken:Input parameter of subscribeToTopic service in FCM',registrationToken);
                    loggerinfo.info('topic:Input parameter of subscribeToTopic service in FCM',topic);        
                    adminApp.messaging().subscribeToTopic(registrationToken, topic)
                      .then((response)=> {
                        // See the MessagingTopicManagementResponse reference documentation
                        // for the contents of response.
                        res.json(response);                  
                        loggerinfo.info("Successfully subscribed to topic:", response);        
                      })
                      .catch((error)=> {
                        loggerinfo.error("Error subscribing to topic:", error);        
                      });
                  }
              });               
        }
        else if(platform === 'iOS'){
            var inputData = {
              "platform" : req.body.platform,
              "registrationToken":req.body.registrationToken,
              "packageName":req.body.packageName,
              "deviceId":req.body.deviceId
            }
            loggerinfo.info("Request parameter of Registration for APN Service:", inputData); 
            var obj = new Device(inputData);
            var query = {
              "platform" : req.body.platform,              
              "packageName":req.body.packageName,
              "deviceId":req.body.deviceId
            };

            Device.findOneAndUpdate(query, req.body, { upsert: true }, (err) => {
            if (err) { 
              loggerinfo.info('ERROR-->'+error)
              return loggerinfo.error(err); }
            loggerinfo.info('New device successfully register for FCM');
            var resultData = {
              "username":req.body.username,
              "status":"Success"
            }
            res.status(200).json(resultData);
          });
        }
        else{
            loggerinfo.error('Send Notification Service: Platform are mandatory.');
            res.status(500).json({status:500,message:'Platform are mandatory.'});    
        }
      }
      else{
            loggerinfo.error('Send Notification Service: Registration token and DeviceId should not be Empty.');
            res.status(500).json({status:500,message:'Registration token and DeviceId should not be Empty.'});    
        }
    }
    else
    {
      loggerinfo.error('Send Notification Service: Platform,DeviceId, Registration Token and PackageName are mandatory.');
      res.status(500).json({status:500,message:'Platform, DeviceId, Registration Token and PackageName are mandatory.'});
    }
  }
  else
  {
    loggerinfo.error('SubscribeToTopic for FCM and Registration for APN Service: Authentication failed.');
    res.status(401).send('Authentication failed.');
  }
  }catch(err){
    loggerinfo.error('SubscribeToTopic for FCM and Registration for APN Service: Internal server error.');
    res.status(500).send(err);
  }
  
}

exports.sendToAll = (req,res)=>{

  try{

  loggerinfo.info('Start SendToAll Service');
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token === config.token){
    if(req.body && req.body.hasOwnProperty('packageName')  && req.body.hasOwnProperty('notification'))
    { 
        var deviceTokens = [];
        var responseList =[];
        var adminApp ={};
        var apnProvider;
        Device.find({packageName:req.body.packageName}, (err, obj) => {
            if (err) { return loggerinfo.error(err); }
            loggerinfo.info("Search result of get Service for SendToAll Service", obj[0]);
            obj.forEach((device,index)=>{
                if(device.platform == 'iOS' && device.registrationToken){                  
                  deviceTokens.push(device.registrationToken);
                }
                  
            })           
            if(deviceTokens.length>=1){
              if(req.body.packageName === opusConstant.opusConstant.wpoPackageNameProd || req.body.packageName === opusConstant.opusConstant.epmodPackageNameDev){                  
                apnProvider = new apn.Provider(opusConstant.opusConstant.options);
              } else if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameProd){                  
                apnProvider = new apn.Provider(opusConstant.opusConstant.optionEpConnect);                 
              }  else if(req.body.packageName === opusConstant.opusConstant.mcConnectPackageNameProd){                  
                apnProvider = new apn.Provider(opusConstant.opusConstant.optionsMearsConnect);                 
              } 
              var apnURL = req.body.notification.url ? req.body.notification.url :"";
              if(apnProvider){
                //res.status(200).json(apnProvider);
                console.log('apnProvider',apnProvider);
                //code added
                let note = new apn.Notification({
                  payload:{
                   "messageFrom":req.body.notification.body,
                   "attachment-url":apnURL
                  },
            category:"Billing",
            alert:req.body.notification.title,
            sound:"ping.aiff",
            topic:req.body.packageName,
            contentAvailable: 1//this key is also needed for production
            });
                //end
                // var note = new apn.Notification();
                // note.expiry = Math.floor(Date.now() / 1000) + 3600; 
                // note.badge = 1;
                // note.sound = "ping.aiff";
                // note.alert = req.body.notification.title// Opus Alert message";
                // note.payload = {'messageFrom': req.body.notification.body,"attachment-url":apnURL};
                // note.topic = req.body.packageName;// + ".voip"; 
                //console.log('note for IOS',note,deviceTokens);
                console.log('Before the send apn notification'); 
                try{
                  var newDeviceToken = deviceTokens.slice(0,100);
                  apnProvider.send(note, deviceTokens).then( (result) => {
                    // see documentation for an explanation of result
                    console.log('After the send apn notification');
                        console.log('result',JSON.stringify(result));
                        loggerinfo.info('Result of sendToAll Service for iOS',JSON.stringify(result));
                       // res.status(200).json(result);
                        responseList.push(result);                
                    });
                }
                catch(err){
                  console.log('APN error',err)
                }   
                
              }              
            }
          });
          //console.log('req.body.packageName',req.body.packageName);
          //console.log('MearsDevConnectAdminApp',MearsDevConnectAdminApp);
          if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameDev){
            adminApp = WorkplaceAdminApp;
            apnProvider = new apn.Provider(opusConstant.opusConstant.options);
          } else if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameProd){
            adminApp = EpWorkplaceAdminApp;              
            apnProvider = new apn.Provider(opusConstant.opusConstant.optionEpConnect);
          }  else if(req.body.packageName === opusConstant.opusConstant.epmodPackageNameDev){
              topic = 'MOD2020';
              apnProvider = new apn.Provider(opusConstant.opusConstant.options);
              adminApp = epModeConnectAdminApp;
              
              isPackageNameValid = true;
          } else if(req.body.packageName === opusConstant.opusConstant.mcConnectPackageNameProd){
            adminApp = MearsConnectAdminApp;  
            apnProvider = new apn.Provider(opusConstant.opusConstant.optionsMearsConnect);                 
          } else if(req.body.packageName === opusConstant.opusConstant.mcConnectPackageNameDev){
            adminApp = MearsDevConnectAdminApp;
            console.log('adminApp MearsDevConnectAdminApp')
            apnProvider = new apn.Provider(opusConstant.opusConstant.optionsMearsConnect);
            isPackageNameValid = true;
            
          } else{            
            loggerinfo.error('SendToAll: Package Name is inValid.');       
            res.status(500).json({status:500,message:'Package Name is inValid.'});
          }

          loggerinfo.info('Request body of sendForTopic Service',req.body);
          //let topic = req.body.packageName;
          topic = "testDemo";
           var newData = {};
              
              var itemKeys = Object.keys(req.body.notification);
              itemKeys.forEach(function(data,index){
                 newData[data] = req.body.notification[data];
                 
              })
              console.log('newData',newData);
              if(req.body.notification.hasOwnProperty('silent')){
                  if(typeof req.body.notification['silent'] === 'boolean'){
                    newData['silent'] = req.body.notification['silent'] ? 'true' :'false';
                  }
                  delete req.body.notification['silent'];
              }
              
			  if(newData.hasOwnProperty('silent')){
				  var payload = {
				   // notification: item.notification,
					data:newData
				  };
			  }
			  else{
				   var payload = {
				     notification: req.body.notification,
				     data:req.body.notification
				   };
        }
        
          loggerinfo.info('payload:Request parameter of sendToAll service in FCM',payload);
          loggerinfo.info('topic:Request parameter of sendToAll service in FCM',topic);        
          adminApp.messaging().sendToTopic(topic, payload)
            .then((response)=> {
              // See the MessagingTopicResponse reference documentation for the
              // contents of response.
              res.status(200).json({status:200,message:'Successfully sent message.'});     
              loggerinfo.info("Successfully sent message:", response);      
            })
            .catch((error)=> {
              loggerinfo.info("Error sending message:", error);      
            });
    }
    else
    {
      loggerinfo.error('SendToAll Service:Notification and PackageName are mandatory.');
      res.status(401).json({status:500,message:'Notification and PackageName are mandatory.'});
    }         
  }
  else
  {
    loggerinfo.error('SendToAll Service: Authentication failed.');
    res.status(401).json({status:401,message:'Authentication failed.'});
  }
  }catch(err){
    loggerinfo.error('SendToAll Service: Internel server error.');
    res.status(500).json({status:500,message:'Internel server error' ,err:err});
  }
}

exports.readLogFile = (req,res)=>{
      try{
          loggerinfo.info('Start Read Log File Service');      
          var token = req.body.token || req.query.token || req.headers['x-access-token'];
          if(token === config.token){ 
            var realPath = path.join(__dirname, '../logs/default.log')    
             res.download(realPath); 
          }
          else
          {
            loggerinfo.error('Read Log File Service: Authentication failed.');
            res.status(401).json({status:401,message:'Authentication failed.'});
          }
      }catch(err){
        loggerinfo.error('Read Log File Service: Internel server error.');
        res.status(500).json({status:500,message:'Internel server error' ,err:err});
      }
  }
  exports.readLogFile = (req,res)=>{
    try{
        loggerinfo.info('Start Read Log File Service');      
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if(token === config.token){ 
          var realPath = path.join(__dirname, '../logs/default.log')    
           res.download(realPath); 
        }
        else
        {
          loggerinfo.error('Read Log File Service: Authentication failed.');
          res.status(401).json({status:401,message:'Authentication failed.'});
        }
    }catch(err){
      loggerinfo.error('Read Log File Service: Internel server error.');
      res.status(500).json({status:500,message:'Internel server error' ,err:err});
    }
}
  exports.clearLog = (req,res)=>{
    try{
      loggerpush.info('clearLog---->>>>>');
      var realPath = path.join(__dirname, '../logs/default.log')
        fs.writeFile(realPath,'',function(){
          loggerinfo.info('Start Clear Log File Service'); 
          console.log('done');
          res.status(200).json({status:200,message:'Successfully clear log.'}); 
        })
    }
    catch(err){
      loggerinfo.error('Clear Log File Service: Internel server error.');
      res.status(500).json({status:500,message:'Internel server error' ,err:err});
    }
  }


exports.searchDevice = (req, res) => {
  loggerinfo.info('Request body of searchDevice Service',req.body);
  var searchDevice = req.body;
  Device.find(searchDevice, (err, docs) => {
    if (err) { return loggererror.info(err); }
    loggerinfo.info('Search result based on device',docs);
    res.json(docs);
  });
}

exports.SearchByUsers = (req, res) => {
  loggerinfo.info('Request body of SearchByUsers Service',req.body);
  var userList = req.body.username;
  Device.find({ 'username': { $in: userList } }, (err, docs) => {
    //loggerinfo.info('Search result based on users',docs);
    res.json(docs);
  })
}

// Count all
exports.count = (req, res) => {
  Device.count((err, count) => {
    if (err) { return loggererror.info(err); }
    res.json(count);
  });
}





