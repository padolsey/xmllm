import { estimateTokens } from './utils/estimateTokens.mjs';
export default function innerTruncate(txt, separator, nSplits, totalTokensLimit) {
  var tokenCount = estimateTokens(txt);
  if (tokenCount <= totalTokensLimit || nSplits <= 0) {
    return txt;
  }
  var segmentSize = Math.floor(txt.length / nSplits);
  var desiredSegmentLength = Math.floor(txt.length * (totalTokensLimit / tokenCount) / nSplits);
  var segments = [];
  for (var i = 0; i < nSplits; i++) {
    var start = i * segmentSize;
    var segment = txt.substring(start, start + desiredSegmentLength);
    segments.push(segment);
  }
  return segments.join(separator);
}