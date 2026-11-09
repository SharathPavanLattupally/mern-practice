const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getInstructors,
    createInstructor,
    updateInstructor,
    deleteInstructor
} = require("../controllers/instructorController");

router.use(protect);

router.get("/", authorize("admin", "staff", "viewer"), getInstructors);
router.post("/", authorize("admin"), createInstructor);
router.patch("/:id", authorize("admin"), updateInstructor);
router.delete("/:id", authorize("admin"), deleteInstructor);

module.exports = router;