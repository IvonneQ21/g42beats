'use strict';

const knex = require('../../knex');
const bcrypt = require('bcrypt-as-promised');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');
//Ivonne
 function userById(req, res) {
   let paramId = req.swagger.params.id.value
  //  console.log(id);
   knex('users')
   .where('id', paramId)
   .then(user=> {
     if(!user) {
       console.log("this is the user i see first", user);
       res.status(404).json('Not Found');
     } else {
       delete user[0].hashed_password;
       delete user[0].created_at;
       delete user[0].updated_at;
       delete user[0].id;
       delete user[0].user_name;
       console.log(user);
     }
     res.status(200).json(user);
   })
   .catch(err => {
     console.error(err);
   });
}

// grab user playlist Ivonne
function getUserPlaylistByUserId(req, res){
  let userId = req.swagger.params.id.value;
  knex('users')
  .join('playlist','users.id', '=', 'playlist.user_id')
  .join('songs', 'playlist.song_id', '=', 'songs.id')
  .select()
  .where('user_id', userId)
    .then((usersongs) => {
      console.log(usersongs);
      if(!usersongs){
      //   // console.log(userssongs);
        res.status(404).json('Not Found');
      } else {
        usersongs.map(function(object){
          delete object.hashed_password;
          delete object.song_id;
          delete object.updated_at;
          delete object.created_at;
          delete object.hashed_password;
          delete object.user_id;
        });
      }
      res.status(200).json(usersongs);
    })
    .catch((err) => {
      console.error(err);
    })
}

// function getUserPlaylistByGroupIdandUserId(req, res) {
//   let gid = req.swagger.params.id.value;
//   knex('oups')
// }
      // }



function createUser(req, res, next) {
  let userId
    bcrypt.hash(req.body.password, 12)
        .then((hashed_password) => {
          return knex('users')
              .insert({
                  user_name: req.body.user_name,
                  hashed_password: hashed_password,
                  // group_name: req.body.groupname
              }, '*');
        })
        .then((user) => {
            let newUser = user[0];
            const claim = {
                userId: newUser.id,
                // permissions: newUser.permissions
                //NOTE: this will be useful for the superuser.
            }
            const token = jwt.sign(claim, process.env.JWT_KEY);
            newUser.token = token
            delete newUser.hashed_password;
            res.status(200).send(camelizeKeys(newUser));
            return newUser;
        })
        .then((checkingGroup) => {
           const id = knex('groups').where('group_name', req.body.groupname).select('id');
           return id;
        })
        .then((insertingGroupMember) => {
          console.log(checkingGroup);
          knex('group_members').insert({group_id: insertingGroupMember, user_id: userId})
        })
        .catch((err) => {
            next(err);
        });
}


function getGroupsPerUser(req, res){
  let userId = req.swagger.params.id.value;
  knex('groups')
  .join('group_members','groups.id', '=', 'group_members.group_id')
  // .join('users', 'playlist.song_id', '=', 'songs.id')
  .select()
  .where('user_id', userId)
    .then((userGroups) => {
      console.log(userGroups);
      if(!userGroups){
        // console.log(userssongs);
        res.status(404).json('Not Found');
      } else {
        delete userGroups[0].created_at;
        delete userGroups[0].updated_at;
        delete userGroups[0].group_id;
        delete userGroups[0].user_id;
        delete userGroups[0].id;
      }
      res.status(200).json(userGroups);
    })
    .catch((err) => {
      console.error(err);
    })
}



        // //BREAK WEEK : how to better organize relationship database to include user from
        // // multiple groups. eg: instructor in multiple groups.
        //
        // module.exports.addSong = function(args, res, next) {
        //     /**
        //      * Add a song to authorized user's personal playlist.
        //      *
        //      * id Long Return an individual associated with that id
        //      * song Addsong Name of song with artist user wants to add
        //      * returns addsong
        //      **/
        //     var examples = {};
        //     examples['application/json'] = {
        //         "song": "aeiou",
        //         "userid": 123456789
        //     };
        //     if (Object.keys(examples).length > 0) {
        //         res.setHeader('Content-Type', 'application/json');
        //         res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
        //     } else {
        //         res.end();
        //     }
        // }
        //




        module.exports ={
            userById: userById,
            getUserPlaylistByUserId: getUserPlaylistByUserId,
            getGroupsPerUser: getGroupsPerUser
            // getGroupCompiledPlaylist: getGroupCompiledPlaylist
        }
