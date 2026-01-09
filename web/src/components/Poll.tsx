'use client';

import { useState } from 'react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollProps {
  pollId: string;
  question: string;
  options: PollOption[];
  userVote?: string;
  className?: string;
}

export default function Poll({ pollId, question, options: initialOptions, userVote: initialVote, className = '' }: PollProps) {
  const [options, setOptions] = useState<PollOption[]>(initialOptions);
  const [userVote, setUserVote] = useState<string | undefined>(initialVote);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
  const hasVoted = !!userVote;

  const vote = async (optionId: string) => {
    if (hasVoted || voting) return;

    setVoting(true);
    setError(null);

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Oy kullanilamadi');
        return;
      }

      setOptions(data.options);
      setUserVote(optionId);
    } catch (err) {
      setError('Bir hata olustu');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className={`glass-card rounded-xl p-4 ${className}`}>
      <h4 className="font-medium mb-3">{question}</h4>

      <div className="space-y-2">
        {options.map(option => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = userVote === option.id;

          return (
            <button
              key={option.id}
              onClick={() => vote(option.id)}
              disabled={hasVoted || voting}
              className={`w-full text-left relative overflow-hidden rounded-lg p-3 transition-all ${
                hasVoted
                  ? isSelected
                    ? 'bg-purple-500/20 border border-purple-500/50'
                    : 'bg-white/5'
                  : 'bg-white/5 hover:bg-white/10 cursor-pointer'
              }`}
            >
              {/* Progress bar background */}
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-purple-500/10 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex justify-between items-center">
                <span className={isSelected ? 'font-medium' : ''}>{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-gray-400">
                    {percentage}% ({option.votes})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}

      <div className="text-xs text-gray-500 mt-3">
        Toplam {totalVotes} oy
      </div>
    </div>
  );
}
