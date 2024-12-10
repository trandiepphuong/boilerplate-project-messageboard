let mongoose = require("mongoose");
let Message = require("../models/message").Message;

exports.postReply = async (req, res, next) => {
    try {
      let board = req.params.board;
      let foundBoard = await Message.findById(req.body.thread_id);
      
      // Update bumped_on to the current date
      foundBoard.bumped_on = new Date().toUTCString();
  
      let newReply = {
        text: req.body.text,
        created_on: new Date().toUTCString(),
        delete_password: req.body.delete_password,
        reported: false
      };
  
      foundBoard.replies.push(newReply);
      
      await foundBoard.save();
      return res.redirect("/b/" + board + "/" + req.body.thread_id);
    } catch (err) {
      res.json("error");
    }
  };
  

exports.getReply = async (req, res) => {
  try {
    let board = req.params.board;
    await Message.findById(req.query.thread_id, async (err, thread) => {
      if (!err && thread) {
        thread.delete_password = undefined;
        thread.reported = undefined;
        thread.replycount = thread.replies.length;

        thread.replies.forEach(reply => {
          reply.delete_password = undefined;
          reply.reported = undefined;
        });

        return res.json(thread);
      }
    });
  } catch (err) {
    res.json("error");
  }
};

exports.deleteReply = async (req, res) => {
  try {
    let foundThread = await Message.findById(req.body.thread_id);
    foundThread.replies.forEach(async ele => {
      if (
        ele._id == req.body.reply_id &&
        ele.delete_password == req.body.delete_password
      ) {
        ele.text = "[deleted]";
        await foundThread.save();
        return res.send("success");
      } else if (
        ele._id == req.body.reply_id &&
        ele.delete_password != req.body.delete_password
      ) {
        return res.send("incorrect password");
      }
    });
  } catch (err) {
    res.json("error");
  }
};

exports.putReply = async (req, res) => {
    try {
      let foundThread = await Message.findById(req.body.thread_id);
      let reply = foundThread.replies.id(req.body.reply_id); // Find the specific reply by ID
      
      if (reply) {
        reply.reported = true;
        await foundThread.save();
        return res.send("reported");
      } else {
        return res.send("reply not found");
      }
    } catch (err) {
      res.json("error");
    }
  };
  