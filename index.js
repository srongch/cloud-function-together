const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
// const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// addUserLikes({nAD7Wg30K0TIDuxKAmv8lLqk8KG3:'true' }, {params: {pushId: '-LTeEgBlkMf0QhfdXXzi'}})
// listener for when user add favorite to list

exports.addUserLikes1 = functions.database.ref('likes/{pushId}/{push23}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written sto the Realtime Database.
        const original = snapshot.val();
        //  console.log("data recieve is" ,original)
        // loop over values

        var userId = "";
        var postId1 = context.params.pushId;
        var pushObject = {
        }

        console.log("pusdid", context.params.pushId)
        console.log("pusdi2d", context.params.push23)

        for (let value of Object.keys(original)) {
            console.log("key is =",value ); // John, then 30
            console.log("value is=",original[value]);
            userId = value
            pushObject[postId1] = "true"
        }

        console.log(pushObject)

        return admin.database().ref('user_likes_post').child(context.params.push23).child(postId1).set('true')
    });


// listener for when user remove favorite to list
exports.deleteLikes= functions.database.ref('likes/{pushId}/{push23}')
    .onDelete((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();
        //  console.log("data recieve is" ,original)
        // loop over values

        var userId = "";
        var postId1 = context.params.pushId;
        var pushObject = {
        }

        console.log("pusdid", context.params.pushId)


        for (let value of Object.keys(original)) {
            console.log("key is =",value ); // John, then 30
            console.log("value is=",original[value]);
            userId = value
            pushObject[postId1] = "true"
        }

        console.log(pushObject)
        //
        // var getPost = admin.database().ref(`posts`).child(postId1).once('value');
        // var user_posted = admin.database().ref('/user_goto_post').child(userId).child(postId1).set('true')
        // user_goto_post_detail
        return admin.database().ref('user_likes_post').child(context.params.push23).child(postId1).remove()
    });


// listener for when user add join an activity
exports.addUserActivity = functions.database.ref('post_participants/{pushId}/{push23}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();
        //  console.log("data recieve is" ,original)
        // loop over values
        console.log("addUserActivity excecuted")

        var userId = context.params.push23
        var postId1 = context.params.pushId;
        var pushObject = {

        }
       // pushObject[postId1] = "true"

        console.log("pusdid", context.params.pushId)
        console.log("userid", context.params.push23)
        //
        //
        for (let value of Object.keys(original)) {
            console.log("key is =",value ); // John, then 30
            console.log("value is=",original[value]);
            // userId = value
            pushObject[postId1] = "true"
        }

        // console.log(pushObject)

    //    var getUser = admin.database().ref(`users`).child(userId).once('value')

        var getPostUser = admin.database().ref(`posts`).child(postId1).once('value')
        var user_posted = admin.database().ref('user_goto_post').child(userId).child(postId1).set('true')
        //   var user_goto_posted = admin.database().ref('/user_goto_post').child(userId).child(postId).set('true');

        return newPromise = Promise.all([getPostUser,user_posted]).then( results =>{
            var postUser = results[0].val()

            console.log("post use",postUser)


            var getFromUser = admin.database().ref(`users`).child(userId).once('value')
            var getToUser = admin.database().ref(`users`).child(postUser['userId']).once('value')

            return newPromise = Promise.all([getFromUser,getToUser]).then( results =>{
                var fromUserData = results[0].val()
                var toUserData = results[1].val()

                console.log("toUserData use",toUserData)
                console.log("fromUserData use",fromUserData)

                var notification = {
                    fromUserId : fromUserData['userId'],
                    fromUserProfile : fromUserData['profile'],
                    fromUserName : fromUserData['name'],
                    toUserId :  toUserData['userId'],
                    type : 'GO_TO_ACTIVITY',
                    text : fromUserData['name'] +' will join your activity',
                    postId : postId1,
                    timestamp: (new Date()).getTime(),
                    random : Math.random() * (+100 - +1) + 1,
                    conbineString : fromUserData['userId'] + "_" + toUserData['userId'] + "_" +postId1
                }
                console.log("notification",notification)

                var finalpromise = []

                var key = admin.database().ref(`notifications`).push()
                console.log("key before push is :", key.key)
                finalpromise.push(admin.database().ref(`notifications`).child(key.key).set(notification))
                finalpromise.push(addUserNotificationIndex(notification,key.key))

                if (toUserData['devideToken'] !== null){
                    finalpromise.push(sendFCM("Activity",notification.text,toUserData['devideToken']))
                }

                return Promise.all(finalpromise)
            });

        });


        // addUserActivity({wUFHBSiZAsQ5kXuSuFAdoad5wrt1:'true' }, {params: {pushId: '-LTJVhta-6zPv7Sf3R6c'}})

        // addUserActivity({ hSQyzXXQ4yc7hwVwB1zCYzx4HQq1: 'true' }, {params: {pushId: '-LSGrqURlcmZSeTPP1Bj'}})

       // return admin.database().ref('/user_goto_post').child(userId).child(postId1).set('true')
    });


// add user notification for ALERTS list
function addUserNotificationIndex(notification,notificationId){
    const userId = notification['toUserId']
    const currentTimeStamp = (new Date()).getTime()

    return admin.database().ref(`user_notifications`).child(userId).child(notificationId).set(currentTimeStamp)
}

// remove data from ALERTS list
function removeUserNotificationIndex(userId, notificationId){
    return admin.database().ref(`user_notifications`).child(userId).child(notificationId).remove()
}


// listener for when user leave activity
exports.deleteUserActivity = functions.database.ref('post_participants/{pushId}/{push23}')
    .onDelete((snapshot, context) => {

        const original = snapshot.val();
        //  console.log("data recieve is" ,original)
        // loop over values
      //  const original = change.before.val();
     //   console.log('Uppercasing', context.params.pushId, original);

        var userId = context.params.push23;
        var postId1 = context.params.pushId; // postID to delete
        var pushObject = {
        }

     //   console.log("pusdid", context.params.pushId)

        for (let value of Object.keys(original)) {

            pushObject[postId1] = "true"
        }

      //  console.log(pushObject)


        var  deletePost = admin.database().ref('user_goto_post').child(userId).child(postId1).remove()
        var getPostUser = admin.database().ref(`posts`).child(postId1).once('value')

        return newPromise = Promise.all([deletePost,getPostUser]).then( results =>{

            var postUser  = results[1].val()

            var searchString = userId + "_" + postUser['userId'] + "_" +postId1

            var findNoticeByPost = admin.database().ref(`notifications`).orderByChild('conbineString').equalTo(searchString)
            var getUser = admin.database().ref(`users`).child(postUser['userId']).once('value')


            return newPromise2 = Promise.all([findNoticeByPost,getUser]).then( results =>{


                var promises  = []

                results[0].once("value", function(snapshot) {
                   // console.log(snapshxot.val());
                   console.log("find key new",snapshot.key)

                    for (let value of Object.keys(snapshot.val())) {
                        console.log("key is =",value ); //
                        promises.push(admin.database().ref(`notifications`).child(value).remove())
                        promises.push(removeUserNotificationIndex(postUser['userId'],value))
                    }

                });

               var user  = results[1].val()
            //    console.log("user for push",user)

                if (user['devideToken'] !== null ) {
                    var deviceToken =  user['devideToken']
            //        console.log("device token :",deviceToken)
                    promises.push(sendFCM("Activity","Someone leave your activity"),deviceToken)
                }


                return Promise.all(promises)


                // console.log("all post", postAll)

            });



            // console.log("all post", postAll)

        });

        // deleteUserActivity({ X0aWzAbt8nRhBtDyOy9h4C7Cjpg2: 'true' }, {params: {pushId: '-LSGrqURlcmZSeTPP1Bj'}})
        // addUserActivity({ X0aWzAbt8nRhBtDyOy9h4C7Cjpg2: 'true' }, {params: {pushId: '-LSGrqURlcmZSeTPP1Bj'}})
        // addUserActivity({hSQyzXXQ4yc7hwVwB1zCYzx4HQq1:'true'},{params:{pushId:'-LRw_jCsr3ApZjyB7bTW'}})

    });


// listener for when user add new post
exports.addUserPostNew = functions.database.ref('posts/{pushId}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();

        var userId = original['userId'];
        var postId = context.params.pushId;

        console.log(original);
        console.log("userid", original['date']);
        console.log("postId", postId);

        var getPost = admin.database().ref(`posts`).child(postId).once('value');
        var user_posted = admin.database().ref('user_posted').child(userId).child(postId).set('true');


        return  Promise.all([getPost,user_posted])


    });




// updateDataInPost({profile : 'https://firebasestorage.googleapis.com/v0/b/together-1540688691564.appspot.com/o/profile_images%2FScreen%20Shot%202018-11-22%20at%205.19.45%20PM.png?alt=media&token=3d330fb7-d776-4cbe-946b-7c4c1ebb3be5'},{params: {pushId: 'hSQyzXXQ4yc7hwVwB1zCYzx4HQq1'}})

// update profile picture in post_participants list
function updateProfileInPostParticipants(userId, profile){
  return  admin.database().ref(`post_participants`).once('value',function (snapshot) {
        console.log(snapshot.val())
        console.log('-----post participant------');

        // let updateObjct ={};
        var updateBatch =[];
        //
        // //go through each item found and print out the emails
        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key; // postID
            var childData = childSnapshot.val();
            console.log("--------childdata---------")
            for (let value of Object.keys(childData)) {
                console.log("userId is =",value ); // John, then 30
                console.log("profile is=",childData[value]);

                if (value === userId){
                    console.log("user id is match");

                    //update profile
                    updateBatch.push(admin.database().ref(`post_participants`).child(key).child(value).set(profile))
                }

            }
        });
        return Promise.all(updateBatch).then( results =>{
            console.log("key is :",results)
            return
        });
        // // console.log("key to update",updateObjct)
        // // results.push( ref.update(updateObjct))

    });



}


// update profile picture in post list
function updateProfileInPost(userId, profile,name){
    admin.database().ref(`posts`).once('value',function (snapshot) {
        //    console.log(snapshot.val())
            console.log('-----------');

            let updateObjct ={};
            var results =[];

            //go through each item found and print out the emails
            snapshot.forEach(function(childSnapshot) {

                var key = childSnapshot.key; // postID
                var childData = childSnapshot.val();
                if (childData.userId === userId) {
                    if (profile === ''){
                        results.push( admin.database().ref(`posts`).child(key).child('username').set(name))
                    } else {
                        results.push( admin.database().ref(`posts`).child(key).child('userprofile').set(profile))
                    }

                }

            });
        return Promise.all(results).then( results =>{
            console.log("key is :",results)
             return
        });
            // console.log("key to update",updateObjct)
            // results.push( ref.update(updateObjct))

        });
}


// update profile picture in chat list
function updateProfileInChat(userId, profile,name){
    admin.database().ref(`chats`).once('value',function (snapshot) {
        //    console.log(snapshot.val())
        console.log('-----------');

        let updateObjct ={};
        var results =[];

        //go through each item found and print out the emails
        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key; // postID
            var childData = childSnapshot.val();
            if (childData['user1Id'] === userId) {
                console.log('update user id 1 : ',profile)
                if (profile === '') {
                    results.push( admin.database().ref(`chats`).child(key).child('user1Name').set(name))
                }else {
                    results.push( admin.database().ref(`chats`).child(key).child('user1Profile').set(profile))
                }

            }else if (childData['user2Id'] === userId) {
                console.log('update user id 2 : ',profile)
                if (profile === '') {
                    results.push( admin.database().ref(`chats`).child(key).child('user2Name').set(name))
                }else {
                    results.push( admin.database().ref(`chats`).child(key).child('user2Profile').set(profile))
                }

            }
        });
        return Promise.all(results).then( results =>{
            console.log("key is :",results)
            return
        });

    });
}



// update profile picture in ALERT list
function updateProfileInNofication(userId, profile,name){
    admin.database().ref(`notifications`).once('value',function (snapshot) {
        //    console.log(snapshot.val())
        console.log('-----------');

        let updateObjct ={};
        var results =[];

        //go through each item found and print out the emails
        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key; // postID
            var childData = childSnapshot.val();
            if (childData['fromUserId'] === userId) {
                console.log('update user id 1 : ',profile)
                if (profile === ''){
                    results.push( admin.database().ref(`notifications`).child(key).child('fromUserName').set(name))
                } else {
                    results.push( admin.database().ref(`notifications`).child(key).child('fromUserProfile').set(profile))
                }

            }
        });
        return Promise.all(results).then( results =>{
            console.log("key is :",results)
            return
        });

    });
}


// update profile picture and username in friends list

function updateUserInFriend(userId,profile,name) {
    admin.database().ref(`user_friends`).once('value',function (snapshot) {
        //    console.log(snapshot.val())
        console.log('------friend-----');
        console.log(userId)

        // user['name'] = 'testing1'

        let updateObjct ={};
        var results =[];

        //go through each item found and print out the emails
        snapshot.forEach(function(childSnapshot) {

            var key = childSnapshot.key; // postID
            var childData = childSnapshot.val();

            for (let value of Object.keys(childData)) {
                console.log("userId is =",value ); // John, then 30
                console.log("user data is=",childData[value]);
                //
                if (value === userId){
                    console.log("user id is match");

                    //update profile
                    if (profile === ''){
                        results.push(admin.database().ref(`user_friends`).child(key).child(value).child('name').set(name))
                    } else {
                        results.push(admin.database().ref(`user_friends`).child(key).child(value).child('profile').set(profile))
                    }

                }

            }

        });
        return Promise.all(results).then( results =>{
            console.log("key is :",results)
            return
        });

    });
}





// updateDataInPost({profile : 'da1ta'},{params: {pushId: '7H2TGKGCKAhDNb2mdNwqWv9fHXx2'}})


// listener when user change profile picture
exports.updateDataInPost = functions.database.ref('/users/{pushId}/profile').onUpdate(
    (snap, context) => {
        const ref = snap.after.ref.parent; // reference to the parent
        var userid = context.params.pushId
        var profile = snap.after.val(); // profile
        var results = [];

        console.log("after data", context.params)

      return  admin.database().ref(`users`).child(userid).once('value',function (snapshot) {
               console.log("user : ",snapshot.val())
          var userData = snapshot.val()

            var updateprofileinparticipaint = updateProfileInPostParticipants(userid,profile)
            var updateprofileinpost = updateProfileInPost(userid,profile,'')
            var updateprofileinchat = updateProfileInChat(userid,profile,'')
            var updateprofileinnotification = updateProfileInNofication(userid,profile,'')
            var updateuserinfriend = updateUserInFriend(userid,profile,'')
            return Promise.all([updateprofileinpost,updateprofileinparticipaint,updateprofileinchat,updateprofileinnotification,updateuserinfriend])
        });

});

// listener when user change user name
exports.updateUsernameInPost = functions.database.ref('/users/{pushId}').onUpdate(
    (snap, context) => {
        const ref = snap.after.ref.parent; // reference to the parent
        var userid = context.params.pushId
        // const afterData = snap.after.val();
        var results = [];


        var nameBefore = snap.before.val().name;
        var profileBefore = snap.before.val().profile;

        var nameAfter = snap.after.val().name;
        var profileAfter = snap.after.val().profile;

        console.log("before name",snap.before.val().name);
        console.log("before profile",snap.before.val().profile);
        console.log("after name",snap.after.val().name);
        console.log("after profile",snap.after.val().profile);
        // console.log("after data",snap.after.val())

        var childKey = "";
        var toupdateData = "";

        if (nameBefore !== nameAfter){
            childKey = "username";
            toupdateData = nameAfter;
        }else {
            return
        }



        var updatenameinpost = updateProfileInPost(userid,'',toupdateData)
        var updatenameinchat = updateProfileInChat(userid,'',toupdateData)
        var updatenameinnotification = updateProfileInNofication(userid,'',toupdateData)
        var updatenameinfriend = updateUserInFriend(userid,'',toupdateData)
        return Promise.all([updatenameinpost,updatenameinchat,updatenameinnotification,updatenameinfriend])

    });


// listener when user send message
exports.addLastMessageToMain = functions.database.ref('chat_messages/{pushId}/{pushId1}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();

        const mainMessageId = context.params.pushId;
        var updateObject = {
            fromUser : original['fromUserId'],
            lastMessage : original['content'] ,
            timestamp : original['timestamp']
        }

        console.log(original)
        console.log('main message id', mainMessageId)
        console.log('content to update', updateObject)


        // var groupPromise = root.child(`/group/${groupID}`).once('value');
        var pushtoken = admin.database().ref(`users`).child(original['toUserId']).once('value');
        var fromuserId = admin.database().ref(`users`).child(original['fromUserId']).once('value');
        var adddatabase =  admin.database().ref(`chats`).child(mainMessageId).update(updateObject);

        return newPromise = Promise.all([pushtoken,fromuserId,adddatabase]).then( results =>{
           console.log(results[0].val())

            var user = results[0].val();
            var fromuser = results[1].val();
            var title = fromuser['name'];
            var message = updateObject.lastMessage;
            var token = user['devideToken'];

            console.log("use : ",user)
            console.log(`${title}|${message}|${token}`);

          return  sendFCM(title,message,token);
        });

    });


// send push notification
function sendFCM(title,message,token){
    // This registration token comes from the client FCM SDKs.
    var registrationToken = token;
    if (registrationToken === undefined) return

// See documentation on defining a message payload.
    var messageObject = {
        data: {
            title: title,
            body : message,
        },
        notification: {
            title: title,
            body : message,
        },

        token: registrationToken
    };

    console.log("message to send :", messageObject)

// Send a message to the device corresponding to the provided
// registration token.
    admin.messaging().send(messageObject)
        .then((response) => {
            // Response is a message ID string.
          return  console.log('Successfully sent message:', response);
        })
        .catch((error) => {
           return console.log('Error sending message:', error);
        });

}


// addLastMessageToMain({content : '7H2TGKGCK2',timestamp : 1543189614311,fromUserId : 'hSQyzXXQ4yc7hwVwB1zCYzx4HQq1',toUserId: 'hSQyzXXQ4yc7hwVwB1zCYzx4HQq1'},{params: {pushId: '-LSBac43O8MXPDQrpGWp',pushId1: '-LSBac4O8MXPDQrpGWp'}})

