import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as jobController from '../controllers/job.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(jobController.jobSchema), asyncHandler(jobController.createJob));
router.get('/', asyncHandler(jobController.getJobs));
router.get('/:id', asyncHandler(jobController.getJobById));
router.put('/:id', validate(jobController.updateJobSchema), asyncHandler(jobController.updateJob));
router.delete('/:id', asyncHandler(jobController.deleteJob));

export default router;
