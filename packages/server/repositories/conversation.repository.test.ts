import { describe, expect, test } from 'bun:test';
import { conversationRepository } from './conversation.repository';

describe('conversationRepository', () => {
   test('returns empty history for unknown conversation', () => {
      expect(conversationRepository.getMessages('missing')).toEqual([]);
   });

   test('returns a copy, not the internal array reference', () => {
      const id = crypto.randomUUID();
      const history = conversationRepository.getMessages(id);
      history.push({ role: 'user', content: 'mutated' });
      expect(conversationRepository.getMessages(id)).toEqual([]);
   });

   test('adds and retrieves messages in order', () => {
      const id = crypto.randomUUID();
      conversationRepository.addMessage(id, { role: 'user', content: 'hi' });
      conversationRepository.addMessage(id, {
         role: 'assistant',
         content: 'hello',
      });
      const history = conversationRepository.getMessages(id);
      expect(history.map((m) => m.content)).toEqual(['hi', 'hello']);
   });

   test('addMessage returns the updated history', () => {
      const id = crypto.randomUUID();
      const result = conversationRepository.addMessage(id, {
         role: 'user',
         content: 'x',
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.content).toBe('x');
   });
});
