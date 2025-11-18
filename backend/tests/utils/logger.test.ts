// backend/tests/utils/logger.test.ts
import { logger } from '../../src/utils/logger';

describe('Logger', () => {
  it('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should log messages without throwing', () => {
    expect(() => {
      logger.info('Test message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.debug('Debug message');
    }).not.toThrow();
  });
});
