export function safeStringify(value) {
     if (value == null) return null;
     if (typeof value === 'string') return value;

     try {
          return JSON.stringify(value);
     } catch {
          try {
               return String(value);
          } catch {
               return '[unserializable]';
          }
     }
}
