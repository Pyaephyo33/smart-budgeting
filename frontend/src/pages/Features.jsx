import React from 'react';
import { CheckCircle } from 'lucide-react';

const features = [
  {
    title: "Smart Budget Planning",
    description: "Automatically analyze your income and expenses to generate optimized budgets based on your habits and goals."
  },
  {
    title: "Envelope-Based Tracking",
    description: "Group your spending by custom envelopes like groceries, entertainment, rent, etc., for better clarity and control."
  },
  {
    title: "Savings Goals Management",
    description: "Set, track, and visualize your financial goals like emergency funds or vacation savings, all in one place."
  },
  {
    title: "Predictive Analytics",
    description: "Use machine learning to forecast your next month’s spending and identify risky overspending trends early."
  },
  {
    title: "Personalized Insights",
    description: "Receive data-driven financial tips tailored to your spending behaviors and savings progress."
  },
  {
    title: "Multi-Account & Category Support",
    description: "Manage different bank accounts and track categorized spending with ease and clarity."
  },
];

const Features = () => {
  return (
    <section className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-12">Key Features</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="text-blue-600 w-6 h-6" />
                <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
