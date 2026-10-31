import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
interface Conversation {
  id: number;
  title: string;
  messages: { role: string; text: string }[];
}
@Component({ selector: 'app-chat', imports: [FormsModule], templateUrl: './chat.html' })
export class Chat {
  route = inject(ActivatedRoute);
  input = this.route.snapshot.queryParamMap.get('idea') || '';
  conversations: Conversation[] = [{ id: 1, title: 'New conversation', messages: [] }];
  active = 1;
  nextId = 2;
  get current() {
    return this.conversations.find((c) => c.id === this.active)!;
  }
  newChat() {
    const id = this.nextId++;
    this.conversations.push({ id, title: 'New conversation', messages: [] });
    this.active = id;
    this.input = '';
  }
  deleteChat(id: number) {
    this.conversations = this.conversations.filter((c) => c.id !== id);
    if (!this.conversations.length) this.newChat();
    else if (this.active === id) this.active = this.conversations[0].id;
  }
  send() {
    const text = this.input.trim();
    if (!text) return;
    this.current.messages.push({ role: 'user', text });
    if (this.current.title === 'New conversation') this.current.title = text.slice(0, 32);
    this.current.messages.push({
      role: 'assistant',
      text: 'AI is not connected in this frontend preview. Your message is kept in this conversation for this session. When connected, Trellis will show sources, observation dates and uncertainty alongside account-based answers.',
    });
    this.input = '';
  }
}
