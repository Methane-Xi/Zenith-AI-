export const voiceService = {
  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  startListening(): Promise<{ action: string; payload?: any }> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        reject(new Error("Speech recognition not supported"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        resolve(this.parseCommand(text));
      };

      recognition.onerror = (event: any) => {
        reject(event.error);
      };

      recognition.start();
    });
  },

  parseCommand(text: string): { action: string; payload?: any } {
    const lower = text.toLowerCase();
    
    if (lower.includes('create task') || lower.includes('add task')) {
      const title = text.replace(/create task|add task/gi, '').trim();
      return { action: 'CREATE_TASK', payload: { title } };
    }
    
    if (lower.includes('complete task') || lower.includes('finish task')) {
      const title = text.replace(/complete task|finish task/gi, '').trim();
      return { action: 'COMPLETE_TASK', payload: { title } };
    }

    if (lower.includes('navigate to') || lower.includes('go to')) {
      const target = text.replace(/navigate to|go to/gi, '').trim();
      return { action: 'NAVIGATE', payload: { target } };
    }

    return { action: 'UNKNOWN', payload: { text } };
  }
};
