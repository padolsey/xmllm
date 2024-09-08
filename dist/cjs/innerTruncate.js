"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = innerTruncate;
function estimateTokenCount(m) {
  return m.length / 3;
}
function innerTruncate(txt, separator, nSplits, totalTokensLimit) {
  var tokenCount = estimateTokenCount(txt);
  if (tokenCount <= totalTokensLimit || nSplits <= 0) {
    return txt;
  }

  // let segmentSize = Math.floor(totalTokensLimit / (nSplits + 1));
  var segmentSize = 0 | txt.length / tokenCount * totalTokensLimit / nSplits; // estimate
  var segments = [];
  var txtSplitted = txt.split('');
  for (var i = 0; i <= nSplits; i++) {
    var segmentStart = i * segmentSize;
    var segment = txtSplitted.splice(0, segmentSize);
    segments.push(segment.join(''));
  }
  return segments.join(separator);
}