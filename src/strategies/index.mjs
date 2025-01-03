import { getConfig } from '../config.mjs';
import * as xmlStrategies from './xml.mjs';
import * as idioStrategies from './idio.mjs';

/**
 * Get the appropriate strategies based on the global parser configuration
 */
function getStrategies() {
  const config = getConfig();
  const parserType = config.globalParser || 'xml';

  if (parserType === 'xml') {
    return xmlStrategies;
  } else if (parserType === 'idio') {
    return idioStrategies;
  } else {
    throw new Error(`Unknown parser type: ${parserType}`);
  }
}

/**
 * Get a prompt strategy by ID, falling back to default if not found
 * @param {string} id - The strategy ID to retrieve
 * @returns {PromptStrategy} The requested strategy or default strategy
 */
export function getStrategy(id) {
  const strategiesModule = getStrategies();
  return strategiesModule.getStrategy(id);
} 