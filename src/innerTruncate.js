function estimateTokenCount(m) { return m.length / 3; }

module.exports = function innerTruncate(txt, separator, nSplits, totalTokensLimit) {
    let tokenCount = estimateTokenCount(txt);
    if (tokenCount <= totalTokensLimit || nSplits <= 0) {
        return txt;
    }

    // let segmentSize = Math.floor(totalTokensLimit / (nSplits + 1));
    let segmentSize = 0 | (txt.length / tokenCount * totalTokensLimit) / nSplits; // estimate
    let segments = [];

    let txtSplitted = txt.split('');
    
    for (let i = 0; i <= nSplits; i++) {
        let segmentStart = i * segmentSize;
        let segment = txtSplitted.splice(0, segmentSize);
        segments.push(segment.join(''));
    }

    return segments.join(separator);
}