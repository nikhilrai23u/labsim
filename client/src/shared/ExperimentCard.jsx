import React from 'react';
export default function ExperimentCard({ exp, onOpen }){
  return (
    <div className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
        <span className="text-[10px] uppercase tracking-wide text-gray-500">{exp.durationMinutes || 8} min</span>
      </div>
      <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{exp.subject || 'Physics'}</span>
        {exp.difficulty && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{exp.difficulty}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-700 line-clamp-3">{exp.description}</p>
      <div className="mt-4 flex justify-end">
        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={onOpen}>Open</button>
      </div>
    </div>
  );
}
