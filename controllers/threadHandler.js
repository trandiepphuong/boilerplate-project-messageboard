let mongoose = require("mongoose");
let Message = require("../models/message").Message;

exports.postThread = async (req, res, next) => {
    try {
        let board = req.params.board;

        let newThread = await Message.create({
            board: board,
            text: req.body.text,
            created_on: new Date(),
            bumped_on: new Date(),
            reported: false,
            delete_password: req.body.delete_password,
            replies: []
        });

        return res.redirect("/b/" + board);
    } catch (err) {
        return res.json("error");
    }
};

exports.getThread = async (req, res) => {
    try {
        let board = req.params.board;
        await Message.find({ board: board })
            .sort({ bumped_on: -1 }) // Sort by bumped_on, descending
            .limit(10) // Limit to 10 threads
            .lean() // Use lean() to return plain JS objects
            .exec((err, threadArray) => {
                if (!err && threadArray) {
                    threadArray.forEach(ele => {
                        ele.replycount = ele.replies.length;
                        // Limit to the most recent 3 replies
                        ele.replies = ele.replies.slice(0, 3);

                        // Remove the reported and delete_password fields
                        ele.replies.forEach(reply => {
                            reply.delete_password = undefined;
                            reply.reported = undefined;
                        });

                        ele.delete_password = undefined;
                        ele.reported = undefined;
                    });
                    return res.json(threadArray);
                }
            });
    } catch (err) {
        res.json("error");
    }
};


exports.deleteThread = async (req, res) => {
    try {
        let board = req.params.board;
        let deletedThread = await Message.findById(req.body.thread_id);
        if (req.body.delete_password === deletedThread.delete_password) {
            await deletedThread.delete();
            return res.send("success");
        } else {
            return res.send("incorrect password");
        }
    } catch (err) {
        res.json("error");
    }
};

exports.putThread = async (req, res) => {
    try {
        let updateThread = await Message.findById(req.body.thread_id);
        updateThread.reported = true;
        await updateThread.save();
        return res.send("reported");
    } catch (err) {
        res.json("error");
    }
};
