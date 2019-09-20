const express = require('express');
const competitionLoader = require('../competition-loader');
const roundResultsPdf = require('../utils/documents/round-results');

const router = express.Router();

router.get('/competitions/:competitionId/rounds/:roundId', async (req, res) => {
  const { competitionId, roundId } = req.params;
  const competition = await competitionLoader.get(competitionId);
  const pdfDoc = roundResultsPdf(competition.wcif, roundId);
  res.setHeader('Content-type', 'application/pdf');
  pdfDoc.pipe(res);
  pdfDoc.end();
});

module.exports = router;
