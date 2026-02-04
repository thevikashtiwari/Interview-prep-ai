const Session = require("../Models/Session");
const Question = require("../Models/Question");
const mongoose = require('mongoose');

//@desc Create a new session and liked question
// @route POST /api/sessions/create
// @access Private
exports.createSession = async (req , res) => {
    try{
        const {role , experience ,topicsToFocus , description, questions} = req.body;
        const userId = req.user._id; // Assuming you have a middleware setting req.user

        const session = await Session.create({
            user:userId,
            role,
            experience,topicsToFocus,description,
        });

        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session:session._id,
                question :q.question,
                answer:q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();
        console.log("👀 req.body.topicsToFocus:", req.body.topicsToFocus);


        res.status(201).json({success: true , session});
    } catch(error) {
        console.error("🔥 Server Error:", error.message);
        res.status(500).json({success: false , message: "Server Error"});
    }
};

//@desc Get all session for the logged-in user
// @route GET /api/sessions/my-sessions
// @access Private
exports.getMySessions = async (req,res) => {
    try{
        const sessions = await Session.find({user: req.user.id})
            .sort({createdAt: -1})
            .populate("questions");
        res.status(200).json(sessions);

    } catch(error) {
        res.status(500).json({success: false , message: "Server Error"});
    }};

//@desc GET a  session by ID with populated question
// @route GET /api/sessions/:id
// @access Private
exports.getSessionById = async (req,res) => {
    try{
        const session = await Session.findById(req.params.id)
        .populate({
            path: "questions",
            options:{sort:{isPinned: -1 , createdAt: 1}},
        })
        .exec();

        if(!session) {
            return res
            .status(404)
            .json({success:false , message:"Session not found"});
        }

        res.status(200).json({success:true , session});

    } catch(error) {
        res.status(500).json({success: false , message: "Server Error"});
    }};

//@desc Delete a session and its questions
// @route DELETE  /api/sessions/:id
// @access Private
exports.deleteSession = async (req,res) => {
      const sessionId = req.params.id;

  console.log("🔍 Delete request for session ID:", sessionId);
  console.log("🔐 Authenticated user ID:", req.user?.id);

  // ✅ Step 1: Validate session ID format
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: "Invalid session ID format" });
  }
    try{
        
        console.log("Trying to delete session ID:", req.params.id);

        const session = await Session.findById(req.params.id);
        console.log("session is : " , session);
       // console.log("Session: " , session);
        if(!session) {
            return res.status(404).json({message:"Session not found"});

        }


        //Check if the logged-in user owns this session
        if(session.user.toString() !== req.user.id) {
            return res
            .status(401)
            .json({message :"Not authorised to delete this session"});
        }
          // First, delete all questions linked to this session
        await Question.deleteMany({ session: session._id });
        

        //Then, delete the sesssion
        await session.deleteOne();

        res.status(200).json({message: "Session deleted successfully"});
    } catch(error) {
        console.log('Hejhjfdhf');
        res.status(500).json({success: false , message: "Server Error"});
    }};


