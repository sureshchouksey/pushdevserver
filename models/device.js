var mongoose = require('mongoose');

var deviceSchema = mongoose.Schema({
	username: { type: String},
	platform: { type: String, required: true },
	apiKey: { type: String },
	registrationToken: { type: String, required: true },
	deviceId: { type: String, required: true },
	clientId:{ type: String},
	packageName:{type:String},
	group:{ type: String },
	createdAt:{type:Date},
	version:{type:String},
	appversion:{type:String}
});

// Sets the createdAt parameter equal to the current time
deviceSchema.pre('save', next => {
  now = new Date();
  if(!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema);