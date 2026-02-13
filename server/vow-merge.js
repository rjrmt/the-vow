function mergeVowContributions(current, contribution) {
  return {
    challengesAccepted: contribution.challengesAccepted ?? current.challengesAccepted ?? [],
    pulseSyncScore: contribution.pulseSyncScore ?? current.pulseSyncScore ?? 0,
    memoryTimeline: contribution.memoryTimeline ?? current.memoryTimeline ?? [],
    affirmations: contribution.affirmations ?? current.affirmations ?? [],
    canvasImageURL: contribution.canvasImageURL ?? current.canvasImageURL,
  };
}

module.exports = { mergeVowContributions };
