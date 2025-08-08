/**
 * Very simple matching: count skill tokens that appear in the issue text.
 * Returns best dev object or null.
 */

function normalizeText(t) {
    return (t || '').toLowerCase();
  }
  
  /**
   * devs: array of rows {id, name, discord_id, skills, oncall_days}
   * issue: string
   * returns best dev or null
   */
  function findBestMatch(devs, issue, threshold = 0.1) {
    const text = normalizeText(issue);
    if (!text) return null;
  
    let best = null;
    let bestScore = 0;
  
    for (const dev of devs) {
      const skills = (dev.skills || '').split(',').map(s => s.trim()).filter(Boolean);
      if (skills.length === 0) continue;
  
      let matches = 0;
      for (const skill of skills) {
        const sk = normalizeText(skill);
        // exact token or substring match
        if (sk && (text.includes(sk) || text.split(/\W+/).includes(sk))) {
          matches++;
        }
      }
      const score = matches / skills.length;
      if (score > bestScore) {
        bestScore = score;
        best = dev;
      }
    }
  
    if (best && bestScore >= threshold) return best;
    return null;
  }
  
  module.exports = { findBestMatch };