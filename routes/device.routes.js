var Device = require('../controllers/device');
var APN = require('../controllers/apn');

module.exports = function (app) {
    //console.log(app);
    app.route('/device')
        .get(Device.getAll)
        .post(Device.update)
        .put(Device.update);
    app.route('/device/getAllDevice')
        .get(Device.getAllDevice);
    app.route('/')
        .get(Device.home);
    app.route('/device/subscribeToTopic')
        .post(Device.subscribeToTopic);    
    app.route('/sendNotification')
        .post(Device.sendNotification);    
    app.route('/device/delete/:username/:deviceId/:packageName')
        .delete(Device.delete);  
    app.route('/device/deleteAllRegisterdDevice')
        .delete(Device.deleteAllRegisterdDevice);  
    app.route('/device/deleteAllDevice')
        .delete(Device.deleteAllDevice);
    app.route('/device/deleteDeviceByDate')
        .delete(Device.deleteDeviceByDate);
    app.route('/device/deleteByPlatform/:platform/:packageName')
        .delete(Device.deleteByPlatform);
                   
    app.route('/device/sendToAll')
        .post(Device.sendToAll);
    app.route('/device/Log')
        .get(Device.readLogFile);
    app.route('/device/clearLog')
        .get(Device.clearLog);
        

    app.route('/SearchByUsers')
        .post(Device.SearchByUsers);
    app.route('/device/search')
        .post(Device.searchDevice);
    app.route('/device/count')
        .get(Device.count);
    
    
}