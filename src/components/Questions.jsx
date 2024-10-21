import React from 'react';
import { Link } from 'react-router-dom';
import QuestionWithSolutions from './QuestionWithSolutions';

function Questions() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Questions</h1>
      <div className="mb-4">
        <Link to="/ask" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Ask a Question
        </Link>
      </div>
      <div className="space-y-8">
        <QuestionWithSolutions
          title="What's the difference between SQL and NoSQL databases?"
          author="Alice Brown"
          upvotes={19}
          answers={8}
          solutions={[
            { author: "Bob Johnson", content: "SQL databases are relational, structured, and use SQL for querying. NoSQL databases are non-relational, flexible, and use various query languages." },
            { author: "Eva Davis", content: "SQL databases ensure ACID properties, while NoSQL databases often sacrifice some consistency for scalability and performance." }
          ]}
        />
        <QuestionWithSolutions
          title="How can I improve my problem-solving skills?"
          author="Charlie Wilson"
          upvotes={56}
          answers={23}
          solutions={[
            { author: "Diana Smith", content: "Practice regularly with coding challenges on platforms like LeetCode or HackerRank." },
            { author: "Frank Miller", content: "Break down complex problems into smaller, manageable parts and solve them step by step." }
          ]}
        />
        <QuestionWithSolutions
          title="What are the key principles of object-oriented programming?"
          author="Eva Davis"
          upvotes={31}
          answers={11}
          solutions={[
            { author: "George Brown", content: "The four main principles are Encapsulation, Abstraction, Inheritance, and Polymorphism (EAIP)." },
            { author: "Hannah Lee", content: "OOP focuses on creating reusable and modular code by organizing data and behavior into objects." }
          ]}
        />
      </div>
    </div>
  );
}

export default Questions;
