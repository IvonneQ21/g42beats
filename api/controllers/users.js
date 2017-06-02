

const knex = require("../../knex");
const bcrypt = require("bcrypt-as-promised");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const formatSongs = require("./apicallFormat").formatSongs;
const rp = require("request-promise");
const dotenv = require("dotenv").config();
const {
<<<<<<< HEAD
    camelizeKeys,
    decamelizeKeys
} = require('humps');
//Ivonne
 function userById(req, res) {
   let paramId = req.swagger.params.id.value;
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
       console.log(user);
     }
     res.status(200).json(user);
   })
   .catch(err => {
     console.error(err);
   });
||||||| merged common ancestors
    camelizeKeys,
    decamelizeKeys
} = require('humps');
//Ivonne
 function userById(req, res) {
   let paramId = req.swagger.params.id.value;
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
=======
  camelizeKeys,
  decamelizeKeys
} = require("humps");

// would like to see comments above each function.
function userById(req, res) {
  const paramId = req.swagger.params.id.value;
  knex("users")
    .where("id", paramId)
    .then((user) => {
      if (!user) {
        res.status(404).json("Not Found");
      } else {
        delete user[0].hashed_password;
        delete user[0].created_at;
        delete user[0].updated_at;
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
    });
>>>>>>> 8188b833beff25520272f9bf62e5ac7e36945fb3
}

// would like to see comments above each function.
function getUserPlaylistByUserId(req, res) {
  let formatedSongs;
  const userId = req.swagger.params.id.value;
  knex("users")
    .join("playlist", "users.id", "=", "playlist.user_id")
    .join("songs", "playlist.song_id", "=", "songs.id")
    .select()
    .where("user_id", userId)
    .then((usersongs) => {
      if (!usersongs) {
        res.status(404).json("Not Found");
      } else {
        formatedSongs = usersongs.map((object) => {
          delete object.hashed_password;
          delete object.song_id;
          delete object.updated_at;
          delete object.created_at;
          delete object.hashed_password;
          delete object.user_id;
          delete object.id;
          delete object.user_name;
          return object;
        });
      }
      const urlReadySongs = formatSongs(formatedSongs);
      return formatedSongs;
    })

    .then((songObjects) => {
      const spotifyRequests = songObjects.map(songObj => rp(`https://api.spotify.com/v1/search?q=${songObj.song_name}%20artist:${songObj.artist}&type=track`));
      return Promise.all(spotifyRequests);
    })
    .then((spotifyResponses) => {
      const parsedResponse = spotifyResponses.map((album) => {
        if (album === undefined) {
          return "preview url not found";
        }
        return JSON.parse(album).tracks.items;
      });
      const urlsArr = parsedResponse.map(ele => ele[0].preview_url);
      res.status(200);
      res.send(urlsArr);
    })
    .catch((err) => {
      console.error(err);
    });
}


// would like to see comments above each function.
function getGroupsPerUser(req, res) {
  const userId = req.swagger.params.id.value;
  knex("groups")
    .join("group_members", "groups.id", "=", "group_members.group_id")
    .select()
    .where("user_id", userId)
    .then((userGroups) => {
      if (!userGroups) {
        res.status(404).json("Not Found");
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
    });
}

// would like to see comments above each function.
function addSong(req, res) {
  const userName = req.body.user_name;
  const songName = req.body.song;
  const artistName = req.body.artist;
  const userId = req.swagger.params.id.value;
  let song;

  knex("songs")
    .select()
    .where("song_name", songName)
    .where("artist", artistName)
    .first()
    .then((song) => {
      if (song) {
        const data = {
          song_id: song.id,
          user_id: userId
        };
        knex("playlist")
          .insert(data, "*")
          .then((playlistResult) => {
            res.send(200, data);
          });
      } else {
        knex("songs")
          .insert({
            song_name: songName,
            artist: artistName
          }, "*")
          .then((songToAdd) => {
            song = songToAdd[0];
            return knex("playlist")
              .insert({
                user_id: userId,
                song_id: songToAdd[0].id
              }, "*");
          })
          .then((playlistArray) => {
            delete song.created_at;
            delete song.updated_at;
            delete playlistArray[0].created_at;
            delete playlistArray[0].updated_at;
            res.send(200, {
              song,
              playlist: playlistArray[0]
            });
          });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}


// would like to see comments above each function.
function deleteSong(req, res) {
  const userId = req.swagger.params.id.value;
  const songId = req.swagger.params.sid.value;
  let playlistToDelete;

  knex("playlist")
    .select()
    .where("user_id", userId)
    .where("song_id", songId)
    .first()
    .then((playlistAssociation) => {
      playlistToDelete = playlistAssociation;
      delete playlistToDelete.created_at;
      delete playlistToDelete.updated_at;
      delete playlistToDelete.id;
      // console.log(playlistToDelete);
    })
    .then(() => knex("songs")
      .select()
      .where("id", songId)
      .first())
    .then((song) => {
      delete song.created_at;
      delete song.updated_at;
      delete song.id;
      return song;
    })
    .then((song) => {
      res.send(200, {
        song,
        playlist: playlistToDelete
      });
    })
    .catch((err) => {
      console.error(err);
    });
}


module.exports = {
  userById,
  getUserPlaylistByUserId,
  getGroupsPerUser,
  addSong,
  deleteSong
  // getGroupCompiledPlaylist: getGroupCompiledPlaylist
};
