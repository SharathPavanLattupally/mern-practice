const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getCourses,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse
} = require("../controllers/courseController");

router.use(protect);

router.get("/", authorize("admin", "staff", "viewer"), getCourses);
router.get("/:id", authorize("admin", "staff", "viewer"), getCourseById);
router.post("/", authorize("admin"), createCourse);
router.patch("/:id", authorize("admin"), updateCourse);
router.delete("/:id", authorize("admin"), deleteCourse);

module.exports = router;