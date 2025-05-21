import { Router } from 'express';

const router = Router();

router.get('/favorite', (req, res) => {
  res.json({
    success: true,
    favorites: [
      { id: 1, title: 'Inception' },
      { id: 2, title: 'The Matrix' },
    ],
  });
});

export default router;
