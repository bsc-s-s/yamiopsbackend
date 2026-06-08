import * as service from './dashboard.service.js';
import { success } from '../../shared/utils/response.js';

export async function getResume(req, res, next) {
  try {
    const resume = await service.getResume(req.tenant_id);
    success(res, resume);
  } catch (err) { next(err); }
}

export async function getOccupancyTimeline(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const timeline = await service.getOccupancyTimeline(req.tenant_id, days);
    success(res, timeline);
  } catch (err) { next(err); }
}
