import { estimateTokens } from './utils/estimateTokens.mjs';

export default function innerTruncate(txt, separator, nSplits, totalTokensLimit) {
    let tokenCount = estimateTokens(txt);
    if (tokenCount <= totalTokensLimit || nSplits <= 0) {
        return txt;
    }

    const segmentSize = Math.floor(txt.length / nSplits);
    const desiredSegmentLength = Math.floor((txt.length * (totalTokensLimit / tokenCount)) / nSplits);

    let segments = [];
    for (let i = 0; i < nSplits; i++) {
        const start = i * segmentSize;
        const segment = txt.substring(start, start + desiredSegmentLength);
        segments.push(segment);
    }

    return segments.join(separator);
}