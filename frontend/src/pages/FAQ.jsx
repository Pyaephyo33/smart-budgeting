import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqList = [
  {
    question: "How does the budgeting system work?",
    answer: "We use envelope budgeting where you allocate money to categories like food, rent, and savings. This allows you to visualize where your money is going and avoid overspending."
  },
  {
    question: "Is Smart Budgeting free to use?",
    answer: "Yes! Our core features are free. You can also upgrade to Premium for advanced insights, ML forecasts, and multi-account sync."
  },
  {
    question: "How secure is my financial data?",
    answer: "We use industry-standard encryption and never share your data. You’re always in full control of your personal information."
  },
  {
    question: "Can I sync with my bank?",
    answer: "Bank sync is available in Premium plans. You can securely link your bank account using Plaid or manually import CSVs."
  },
  {
    question: "What ML features are available?",
    answer: "We use time-series models to predict your weekly and monthly expenses, identify patterns, and deliver tailored financial tips."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>

        <div className="space-y-6">
          {faqList.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 animate-fade-in-up"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-5 flex justify-between items-center text-left text-gray-800 font-medium text-lg focus:outline-none hover:bg-gray-100"
              >
                {item.question}
                {openIndex === idx ? <ChevronUp /> : <ChevronDown />}
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5 text-gray-600 text-sm transition-all duration-300">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
