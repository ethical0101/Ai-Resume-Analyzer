import React from 'react';

export type Suggestion = { type: 'good' | 'improve'; tip: string };

interface ATSProps {
  score: number; // 0-100
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine gradient and icon based on score
  const gradientFrom = score > 69 ? 'from-green-100' : score > 49 ? 'from-yellow-100' : 'from-red-100';
  const statusIcon = score > 69 ? '/icons/ats-good.svg' : score > 49 ? '/icons/ats-warning.svg' : '/icons/ats-bad.svg';

  return (
    <div className={`w-full rounded-2xl shadow-md bg-gradient-to-br ${gradientFrom} to-white`}> 
      {/* Top section */}
      <div className="flex items-center gap-4 p-5">
        <img src={statusIcon} alt="ATS status" className="w-10 h-10" />
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold">ATS Score - {score}/100</h3>
        </div>
      </div>

      {/* Description section */}
      <div className="px-5 pb-5 space-y-3">
        <h4 className="text-lg font-medium">How your resume stacks up</h4>
        <p className="text-sm text-gray-500">
          These insights reflect how an Applicant Tracking System (ATS) might interpret your resume. Use the tips below to improve parsing accuracy and overall relevance.
        </p>

        <ul className="mt-2 space-y-2">
          {suggestions.map((item, idx) => {
            const icon = item.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg';
            const iconAlt = item.type === 'good' ? 'Good' : 'Needs improvement';
            return (
              <li key={idx} className="flex items-start gap-3">
                <img src={icon} alt={iconAlt} className="mt-0.5 w-5 h-5" />
                <p className="text-sm text-gray-700">{item.tip}</p>
              </li>
            );
          })}
        </ul>

        <p className="text-sm text-gray-600 pt-1">
          Keep iterating—small improvements can make a big difference in ATS compatibility and recruiter visibility.
        </p>
      </div>
    </div>
  );
};

export default ATS;
