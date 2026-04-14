const Item = require('../models/Item');
const Match = require('../models/Match');


/**
 * Calculate match score between a lost item and a found item.
 * Scoring:
 *   - Name similarity:        0–40 points
 *   - Category match:         0 or 20 points
 *   - Color match:            0 or 20 points
 *   - Description keywords:   0–10 points
 *   - Location similarity:    0–10 points
 *
 * Total possible: 100
 */

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function calculateMatchScore(lostItem, foundItem) {
  const breakdown = {
    nameScore: 0,
    categoryScore: 0,
    colorScore: 0,
    descriptionScore: 0,
    locationScore: 0,
  };

  // 1. Name similarity (up to 40 points)
  const nameTokensLost = tokenize(lostItem.name);
  const nameTokensFound = tokenize(foundItem.name);
  const nameSimilarity = jaccardSimilarity(nameTokensLost, nameTokensFound);
  // Also check if one name contains the other
  const lostNameLower = lostItem.name.toLowerCase();
  const foundNameLower = foundItem.name.toLowerCase();
  const nameContains = lostNameLower.includes(foundNameLower) || foundNameLower.includes(lostNameLower);
  breakdown.nameScore = Math.round(Math.max(nameSimilarity, nameContains ? 0.8 : 0) * 40);

  // 2. Category match (20 points)
  if (lostItem.category === foundItem.category) {
    breakdown.categoryScore = 20;
  }

  // 3. Color match (20 points)
  const lostColor = lostItem.color.toLowerCase().trim();
  const foundColor = foundItem.color.toLowerCase().trim();
  if (lostColor === foundColor) {
    breakdown.colorScore = 20;
  } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
    breakdown.colorScore = 12;
  }

  // 4. Description keyword similarity (up to 10 points)
  const descTokensLost = tokenize(lostItem.description);
  const descTokensFound = tokenize(foundItem.description);
  const descSimilarity = jaccardSimilarity(descTokensLost, descTokensFound);
  breakdown.descriptionScore = Math.round(descSimilarity * 10);

  // 5. Location similarity (up to 10 points)
  const locTokensLost = tokenize(lostItem.location);
  const locTokensFound = tokenize(foundItem.location);
  const locSimilarity = jaccardSimilarity(locTokensLost, locTokensFound);
  const lostLocLower = lostItem.location.toLowerCase();
  const foundLocLower = foundItem.location.toLowerCase();
  const locContains = lostLocLower.includes(foundLocLower) || foundLocLower.includes(lostLocLower);
  breakdown.locationScore = Math.round(Math.max(locSimilarity, locContains ? 0.7 : 0) * 10);

  const totalScore =
    breakdown.nameScore +
    breakdown.categoryScore +
    breakdown.colorScore +
    breakdown.descriptionScore +
    breakdown.locationScore;

  return { totalScore, breakdown };
}

/**
 * Run matching for a given item against all items of the opposite type.
 * Creates Match documents for scores > 30.
 */
async function runMatching(item) {
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const candidates = await Item.find({ type: oppositeType, status: 'active' });

  const matches = [];

  for (const candidate of candidates) {
    const { totalScore, breakdown } = calculateMatchScore(
      item.type === 'lost' ? item : candidate,
      item.type === 'found' ? item : candidate
    );

    if (totalScore > 30) {
      const lostItemId = item.type === 'lost' ? item._id : candidate._id;
      const foundItemId = item.type === 'found' ? item._id : candidate._id;

      try {
        const match = await Match.findOneAndUpdate(
          { lostItemId, foundItemId },
          { matchScore: totalScore, breakdown, status: 'pending' },
          { upsert: true, new: true }
        );
        matches.push(match);
      } catch (err) {
        // Skip duplicate key errors
        if (err.code !== 11000) throw err;
      }
    }
  }

  return matches;
}

module.exports = { calculateMatchScore, runMatching };
