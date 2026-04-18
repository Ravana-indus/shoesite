interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Shipping' },
  { number: 2, label: 'Method' },
  { number: 3, label: 'Payment' },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step.number <= currentStep
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number}
            </div>
            <span className="text-sm mt-2 text-gray-600">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-2 ${
                step.number < currentStep ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}