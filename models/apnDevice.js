var mongoose = require('mongoose');

var apnDeviceSchema = mongoose.Schema({
	platform: { type: String, required: true },	
	registrationToken: { type: String, required: true },		
  packageName:{type:String},
  deviceId:{type:String}
});

// Sets the createdAt parameter equal to the current time
apnDeviceSchema.pre('save', next => {
  now = new Date();
  if(!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('ApnDevice', apnDeviceSchema);