var apn = require('apn');
var options = {
  token: {
    cert:"./AuthKey_9A928585XR.p8",
    key: "./AuthKey_9A928585XR.p8",
    keyId: "9A928585XR",
    teamId: "NXU7WY6764"
  },
  production: false
};

var apnProvider = new apn.Provider(options);




exports.sendNotification=(req,res)=>{

   //	res.json(req.body);

	let deviceToken = req.body.deviceToken//"90a79191be315abe901b1dab00bf8f9cee712e0b25af9bc9d4f2ed562742e14f";
	var note = new apn.Notification();

	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = 3;
	note.sound = "ping.aiff";
	note.alert = "\uD83D\uDCE7 \u2709" + req.body.notification.title// Opus Alert message";
	note.payload = {'messageFrom': req.body.notification.body};
	note.topic = "com.opusneo.workplaceon";
	apnProvider.send(note, deviceToken).then( (result) => {
    // see documentation for an explanation of result
        console.log(result);
        res.json(result);
    });
}