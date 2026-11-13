import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Chat } from './chat';

describe('Opportunity Chat draft', () => {
  async function createChat(params: Record<string, string>) {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Chat);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('prefills sample context without sending and lets the user edit before Send', async () => {
    const fixture = await createChat({ opportunity: 'revisit-routines' });
    const chat = fixture.componentInstance;
    expect(chat.input).toContain('SAMPLE OPPORTUNITY');
    expect(chat.input).toContain('Context');
    expect(chat.input).toContain('Prompt');
    expect(chat.current.messages).toEqual([]);

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'My edited prompt about this sample';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(chat.current.messages).toEqual([]);
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(chat.current.messages[0].text).toBe('My edited prompt about this sample');
    expect(chat.current.messages[1].text).toContain('AI is not connected');
  });

  it('preserves the existing Hot Topics idea draft', async () => {
    const fixture = await createChat({ idea: 'My skincare idea' });
    expect(fixture.componentInstance.input).toBe('My skincare idea');
    expect(fixture.componentInstance.current.messages).toEqual([]);
  });

  it('opens an empty composer for an unknown opportunity', async () => {
    const fixture = await createChat({ opportunity: 'unknown' });
    expect(fixture.componentInstance.input).toBe('');
    expect(fixture.componentInstance.current.messages).toEqual([]);
  });
});
