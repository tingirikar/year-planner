import React from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { getMonthColumns } from '../../utils/dateUtils';

export const MonthHeader: React.FC = () => {
  const { year, settings } = usePlanner();
  const months = getMonthColumns(year);

  return (
    <div className="month-header-container">
      {/* Quarter Bar (Subtle top band) */}
      {settings.showQuarterDividers && (
        <div className="quarter-bar">
          <div className="quarter-segment q1" style={{ width: '24.65%' }}>
            <span>Q1</span>
          </div>
          <div className="quarter-segment q2" style={{ width: '24.93%' }}>
            <span>Q2</span>
          </div>
          <div className="quarter-segment q3" style={{ width: '25.2%' }}>
            <span>Q3</span>
          </div>
          <div className="quarter-segment q4" style={{ width: '25.2%' }}>
            <span>Q4</span>
          </div>
        </div>
      )}

      {/* Months Bar */}
      <div className="months-row">
        {months.map((m) => (
          <div
            key={m.name}
            className={`month-col-header ${m.index % 2 === 1 ? 'alt-month' : ''}`}
            style={{ width: `${m.widthPercent}%` }}
            title={`${m.fullName} (${m.daysInMonth} days)`}
          >
            <span className="month-name">{m.name}</span>
            {settings.showSubTicks && (
              <div className="month-subticks">
                <span className="subtick subtick-start" />
                <span className="subtick subtick-mid" title="15th" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
