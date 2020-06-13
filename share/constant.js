module.exports.opusConstant = Object.freeze({
    wpoPackageNameProd: 'com.opusneo.workplaceon',
    epmodPackageNameProd: 'com.opusneo.epmod2020.workplace',
    epmodPackageNameDev: 'com.opusneo.epmod2020.workplace.dev',
    mcConnectPackageNameProd: 'uk.co.mearsgroup.connect',
    mcConnectPackageNameDev:'uk.co.mearsgroup.connect.dev',
    firebaseURL: 'https://opus-neo.firebaseio.com',
    options : {  
        pfx: "./pushConfig/Certificates.newvoip.p12",
        "cert": "./pushConfig/VOIP.pem",
        "key": "./pushConfig/VOIP.pem",
        "passphrase": "fulcrum#1",
        "voip":false,
        production: false
      },
      optionsMearsConnect : {
        // token: {
        //   cert:"./pushConfig/AuthKey_QMV7PA4VJ2.p8",
        //   key: "./pushConfig/AuthKey_QMV7PA4VJ2.p8",
        //   keyId: "QMV7PA4VJ2",
        //   teamId: "24D9C2VZZT"
        // },
        "cert": "./pushConfig/mearsConnect/apns-pro-cert.pem",
        "key": "./pushConfig/mearsConnect/apns-pro-key.pem",        
        "passphrase": "fulcrum#1",
        "voip":false,
        gateway: 'gateway.push.apple.com:2195',
        production: true
      },
       optionsEpp = {
        token: {
          key: "./pushConfig/AuthKey_3Q7LG2FM9M.p8",
          keyId: "3Q7LG2FM9M",
          teamId: "Q9XD7568D9"
        },
        production: true
      },
      optionEpConnect : {
        token: {
          //cert:"./pushConfig/AuthKey_3Q7LG2FM9M.p8",
          key: "./pushConfig/AuthKey_3Q7LG2FM9M.p8",
          keyId: "3Q7LG2FM9M",
          teamId: "Q9XD7568D9"
        },
        //pfx: "./pushConfig/Certificates_prod.p12",
        //"cert": "./pushConfig/apns-pro-cert.pem",
        //"key": "./pushConfig/apns-pro-key.pem",
        //"cert": "./pushConfig/prod-cert.pem",
       // "key": "./pushConfig/prod-cert.pem",
        //"ca":"./pushConfig/apns-pro.pem",
       // "passphrase": "fulcrum#1",
        //"voip":false,
        
        // proxy: {
        //   host: "gateway.push.apple.com",
        //   port: 2195
        // },
        //gateway: 'gateway.push.apple.com:2195',
        production: true
      },
      serviceAccountPath : "../pushConfig/opus-neo-firebase-adminsdk-c65n3-a3f2c53c2f.json",
      otherServiceAccoutPath : "../pushConfig/flopusneo-firebase-adminsdk-1b5iw-c9e958ac2c.json",
      workplaceServiceAccountPath : "../pushConfig/workplaceON/opusneo-1d012-firebase-adminsdk-inn95-9352065e99.json",
      epWorkplaceServiceAccountPath : "../pushConfig/ep-workplace/e-and-p-mod2020-firebase-adminsdk-2rpvv-963f3f5d0d.json",
      mearsConnectServiceAccountPath : "../pushConfig/mearsConnect/connect-624de-firebase-adminsdk-xqumx-e9f5dca969.json",
      epModeConnectServiceAccountPath : "../pushConfig/epmode2020/fcmtutorial-ab499-firebase-adminsdk-5xb14-fbc807e781.json",
      mearsDevConnectServiceAccountPath : "../pushConfig/mearsConnect/fcmtutorial-ab499-firebase-adminsdk-5xb14-d68a957567.json",


})