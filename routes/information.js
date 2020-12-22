const router = require("express").Router();
const informationController = require("../controllers/informationController");

router.route("/sponsors/add").post(informationController.addSponsor);
router.route("/sponsors/show").get(informationController.getSponsors);
router.route("/learn-more/add").post(informationController.addLearnMore);
router.route("/learn-more/show").get(informationController.getLearnMorePosts);
router.route("/announcment/add").post(informationController.addAnnouncment);
router.route("/announcment/show").get(informationController.getAnnouncments);
router
  .route("/latest_announcment")
  .get(informationController.getLatestAnnouncments);

module.exports = router;
