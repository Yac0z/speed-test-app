import type { AsyncSink } from '@logtape/logtape';
import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
} from '@logtape/logtape';
import { Env } from './Env';

const betterStackSink: AsyncSink = async (_record) => {
  // Better Stack integration disabled - configure env vars to enable
};

const canForwardToBetterStack = false;

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    {
      category: ['logtape', 'meta'],
      sinks: ['console'],
      lowestLevel: 'warning',
    },
    {
      category: ['app'],
      sinks: canForwardToBetterStack ? ['console', 'betterStack'] : ['console'],
      lowestLevel: Env.NEXT_PUBLIC_LOGGING_LEVEL,
    },
  ],
});

export const logger = getLogger(['app']);
export const getLevel = () => Env.NEXT_PUBLIC_LOGGING_LEVEL;
