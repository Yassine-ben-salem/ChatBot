import { describe, expect, test } from 'bun:test';
import { conversationRepository } from './conversation.repository';

describe('conversationRepository', () => {
   test('returns empty history for unknown conversation', () => {
      expect(
         conversationRepository.getMessages('session-a', 'missing')
      ).toEqual([]);
   });

   test('returns a copy, not the internal array reference', () => {
      const id = crypto.randomUUID();
      const history = conversationRepository.getMessages('session-a', id);
      history.push({ role: 'user', content: 'mutated' });
      expect(conversationRepository.getMessages('session-a', id)).toEqual([]);
   });

   test('adds and retrieves messages in order', () => {
      const id = crypto.randomUUID();
      conversationRepository.addMessage('session-a', id, {
         role: 'user',
         content: 'hi',
      });
      conversationRepository.addMessage('session-a', id, {
         role: 'assistant',
         content: 'hello',
      });
      const history = conversationRepository.getMessages('session-a', id);
      expect(history.map((m) => m.content)).toEqual(['hi', 'hello']);
   });

   test('addMessage returns the updated history', () => {
      const id = crypto.randomUUID();
      const result = conversationRepository.addMessage('session-a', id, {
         role: 'user',
         content: 'x',
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.content).toBe('x');
   });

   test('same conversationId is isolated across different sessions', () => {
      const id = crypto.randomUUID();
      conversationRepository.addMessage('session-a', id, {
         role: 'user',
         content: 'from session a',
      });
      expect(conversationRepository.getMessages('session-b', id)).toEqual([]);
   });

   test('caps stored history to the configured maximum', () => {
      const id = crypto.randomUUID();
      let result: ReturnType<typeof conversationRepository.addMessage> = [];
      for (let i = 0; i < 25; i++) {
         result = conversationRepository.addMessage('session-cap', id, {
            role: 'user',
            content: `msg-${i}`,
         });
      }
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result[result.length - 1]?.content).toBe('msg-24');
   });
});
