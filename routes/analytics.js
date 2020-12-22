const router = require("express").Router();
const analyticsController = require("../controllers/analyticsController");

router
  .route("/user-with-birthdays")
  .get(analyticsController.getUserWithBirthdays);
router.route("/today").get(analyticsController.getTodayAnalytics);
router
  .route("/user-experience-by-month")
  .get(analyticsController.getUserExperienceByMonth);
router.route("/enter-thumbs").post(analyticsController.addThumbUpOrDown);
router.route("/thumbs/all-months").get(analyticsController.getThumbsPerMonth);
router.route("/uniqe-login").post(analyticsController.addUniqeLogin);
router.route("/today-thumbs").get(analyticsController.todayThumbsAnalytics);

module.exports = router;
