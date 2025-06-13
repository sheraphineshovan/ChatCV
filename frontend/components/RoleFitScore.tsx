"use client";
import React, { useEffect, useState } from "react";

interface RoleFitScoreProps {
    sessionId: string;
}

const RoleFitScore: React.FC<RoleFitScoreProps> = ({ sessionId }) => {
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScore = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/score/${sessionId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch score");
                }
                const data = await response.json();
                setScore(data.score);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScore();
    }, [sessionId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="role-fit-score">
            <h2>Role Fit Score</h2>
            {score !== null ? (
                <p>Your role fit score is: {score}</p>
            ) : (
                <p>No score available.</p>
            )}
        </div>
    );
};

export default RoleFitScore;