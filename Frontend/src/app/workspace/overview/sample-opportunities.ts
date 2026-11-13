// Static examples shared by Overview and the editable Chat draft.
// These statements are fictional and have not been derived from an account.
export const sampleOpportunities = [
  {
    id: 'revisit-routines',
    title: 'Revisit a useful content approach',
    observation: 'In this sample, step-by-step routine posts attracted more discussion than product announcements.',
    action: 'Explore a follow-up routine post.',
    context: 'Fictional example: routine posts prompted questions about product order. No actual posts or engagement metrics have been analyzed.',
    prompt: 'Help me explore why this approach might invite discussion and suggest a follow-up skincare post. Treat the sample explanation as a hypothesis.',
  },
  {
    id: 'clarify-bio',
    title: 'Make your profile introduction clearer',
    observation: 'In this sample, the biography lists interests but leaves the purpose of the account unclear.',
    action: 'Explore a clearer introduction in your own voice.',
    context: 'Fictional example: the biography says “Skincare, beauty, lifestyle”. This is sample text, not the connected account’s biography.',
    prompt: 'Help me improve this sample biography. Ask what I want readers to learn from my account before suggesting wording, and avoid inventing expertise or personal experiences.',
  },
  {
    id: 'answer-reader-questions',
    title: 'Turn a recurring question into a post',
    observation: 'In this sample, readers repeatedly asked how to introduce a new product into their routine.',
    action: 'Outline a post around one reader question.',
    context: 'Fictional example: several sample comments ask when to introduce a new skincare product. These comments are invented for the preview. No actual comments have been retrieved or analyzed.',
    prompt: 'Help me outline a post responding to this sample reader question. Ask which product and audience I have in mind, and identify any skincare claims that need reliable sources.',
  },
  {
    id: 'develop-content-series',
    title: 'Give a useful topic a follow-up',
    observation: 'In this sample, an introductory post about reading product labels left room for a practical walkthrough.',
    action: 'Plan a follow-up that builds on the introduction.',
    context: 'Fictional example: a sample post introduces product labels but includes no worked example. No actual content history has been analyzed, and there is no evidence of audience demand in this preview.',
    prompt: 'Help me develop a follow-up to this sample product-label introduction. Suggest a clear structure and suitable format, and ask what I already covered so the follow-up adds something useful.',
  },
] as const;
