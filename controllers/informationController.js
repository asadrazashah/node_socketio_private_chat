const informationService = require("../services/informationService");

module.exports.addSponsor = async (req, res) => {
  try {
    const post = req.body;
    const sponsor = await informationService.addSponsor(post);
    if (sponsor) {
      return res.status(201).json({ sponsor });
    }
    res.status(400).json({ message: "failed to add sponsor" });
  } catch (error) {
    res.status(400).json(error);
  }
};
module.exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await informationService.getSponsorsList();
    res.status(200).json({ sponsors });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports.addLearnMore = async (req, res) => {
  try {
    const post = req.body;
    const learnMorePost = await informationService.addlearnMorePost(post);
    res.status(201).json({ learnMorePost });
  } catch (error) {
    res.status(400).json(error);
  }
};
module.exports.getLearnMorePosts = async (req, res) => {
  try {
    const learnMorePosts = await informationService.getLearnMorePosts();
    res.status(200).json({ learnMorePosts });
  } catch (error) {
    res.status(400).json(error);
  }
};
module.exports.addAnnouncment = async (req, res) => {
  try {
    const post = req.body;
    const newAnnouncment = await informationService.addNewAnnouncment(post);
    res.status(201).json({ newAnnouncment });
  } catch (error) {
    res.status(400).json(error);
  }
};
module.exports.getAnnouncments = async (req, res) => {
  try {
    const announcments = await informationService.getAnnouncments();
    res.status(200).json({ announcments });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getLatestAnnouncments = async (req, res) => {
  try {
    const latestAnnouncment = await informationService.getLatestAnnouncment();
    res.status(200).json({ latestAnnouncment });
  } catch (error) {
    res.status(400).json(error);
  }
};
