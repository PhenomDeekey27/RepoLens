export function FeatureSteps() {
  const steps = [
    {
      icon: '◈',
      title: 'Connect Repository',
      description: 'Select a GitHub repository to analyze',
    },
    {
      icon: '◎',
      title: 'Select Issue',
      description: 'Choose an issue to investigate',
    },
    {
      icon: '⊕',
      title: 'Trace Code',
      description: 'RepoLens identifies relevant files',
    },
    {
      icon: '⊙',
      title: 'Find Root Cause',
      description: 'AI-powered root cause analysis',
    },
    {
      icon: '→',
      title: 'Generate Patch',
      description: 'Get an actionable code fix',
    },
  ];

  return (
    <section className="px-4 py-12 md:py-16 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-on-surface text-center mb-8">
        How it works
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center gap-4 md:gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg glass border border-outline-variant/50 mb-3 hover:border-primary-container/40 transition-colors">
                <span className="text-lg text-primary-container">{step.icon}</span>
              </div>
              <h3 className="text-sm font-medium text-on-surface mb-1">{step.title}</h3>
              <p className="text-xs text-on-surface-variant max-w-35">
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block text-on-surface-variant">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
