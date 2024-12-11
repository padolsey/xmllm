"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = innerTruncate;
var _estimateTokens = require("./utils/estimateTokens.js");
function innerTruncate(txt, separator, nSplits, totalTokensLimit) {
  var tokenCount = (0, _estimateTokens.estimateTokens)(txt);
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