import { useCallback, useRef } from 'react';
import API_BASE from '../config';

export const submitScore = async (user, score) => {
    const response = await fetch(`${API_BASE}/api/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user?._id,
            email: user?.email,
            playerName: user?.name,
            score
        })
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to save score.');
    }

    if (!result?.name) {
        throw new Error('Score was not associated with a user.');
    }

    return result;
};

export const useScoreSubmission = (user) => {
    const sessionRef = useRef({ saved: false, pending: null });

    const saveScore = useCallback((score) => {
        if ((!user?._id && !user?.email && !user?.name) || score <= 0) return Promise.resolve(true);
        if (!Number.isSafeInteger(score)) {
            console.error('Failed to save score: score must be a safe integer.');
            return Promise.resolve(false);
        }

        const session = sessionRef.current;
        if (session.saved) return Promise.resolve(true);
        if (session.pending) return session.pending;

        const pending = submitScore(user, score)
            .then(() => {
                session.saved = true;
                return true;
            })
            .catch(error => {
                console.error('Failed to save score:', error);
                return false;
            })
            .finally(() => {
                session.pending = null;
            });

        session.pending = pending;
        return pending;
    }, [user?._id, user?.email, user?.name]);

    const resetScoreSubmission = useCallback(() => {
        sessionRef.current = { saved: false, pending: null };
    }, []);

    return { saveScore, resetScoreSubmission };
};

export const saveScoreAndExit = async (saveScore, score, onBack) => {
    const saved = await saveScore(score);
    if (!saved) {
        window.alert('Your score could not be saved. Check your connection and try again before leaving.');
        return;
    }

    onBack?.();
};
