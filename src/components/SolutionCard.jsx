import React, { useState } from 'react';

function SolutionCard({ author, content }) {
  const [upvoted, setUpvoted] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState([]);

  const handleUpvote = () => {
    setUpvoted(!upvoted);
  };

  const handleReply = () => {
    setShowReplyInput(!showReplyInput);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (reply.trim()) {
      setReplies([...replies, reply]);
      setReply('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg mt-2">
      <p className="text-sm text-gray-800 mb-1">{content}</p>
      <p className="text-xs text-gray-600">Answered by {author}</p>
      <div className="mt-2 flex justify-between items-center">
        <button
          className={`upvote-btn text-sm ${upvoted ? 'text-red-500' : 'text-gray-500'}`}
          onClick={handleUpvote}
        >
          <i className="fas fa-arrow-up"></i> {upvoted ? 'Upvoted' : 'Upvote'}
        </button>
        <button className="text-sm text-gray-500" onClick={handleReply}>
          <i className="fas fa-reply"></i> Reply
        </button>
      </div>
      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="mt-2">
          <input
            type="text"
            placeholder="Type your reply..."
            className="w-full p-2 border rounded"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
        </form>
      )}
      {replies.map((r, index) => (
        <p key={index} className="text-sm text-gray-800 mt-2">{r}</p>
      ))}
    </div>
  );
}

export default SolutionCard;
