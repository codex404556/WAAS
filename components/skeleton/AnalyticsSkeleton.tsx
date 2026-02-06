"use client";

import React from "react";

const AnalyticsSkeleton = () => {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-80 bg-gray-200 rounded" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`stat-${idx}`}
            className="border rounded-lg p-4 bg-white space-y-3"
          >
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-100 rounded" />
        </div>
        <div className="border rounded-lg p-4 bg-white space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-100 rounded" />
        </div>
      </div>

      {/* Tabs / Table Area */}
      <div className="border rounded-lg p-4 bg-white space-y-4">
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`row-${idx}`}
              className="h-10 w-full bg-gray-100 rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
